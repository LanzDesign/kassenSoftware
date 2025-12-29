#!/bin/bash
# Quick-Fix: Frontend Static Files Problem beheben

echo "=== Quick-Fix: Frontend Static Files ==="

# Farben
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Prüfen ob Container laufen
echo -e "${CYAN}[1/7] Container-Status prüfen...${NC}"
docker-compose ps

# 2. Frontend Container-Inhalt prüfen
echo -e "${CYAN}[2/7] Prüfe Frontend-Container-Inhalt...${NC}"
echo "Dateien in /usr/share/nginx/html:"
docker-compose exec frontend ls -la /usr/share/nginx/html/ || echo -e "${RED}Fehler beim Lesen des Containers${NC}"

echo ""
echo "Static-Dateien:"
docker-compose exec frontend ls -la /usr/share/nginx/html/static/ 2>/dev/null || echo -e "${YELLOW}Kein /static/ Verzeichnis gefunden${NC}"

# 3. Index.html prüfen
echo -e "\n${CYAN}[3/7] Index.html Inhalt (erste 30 Zeilen):${NC}"
docker-compose exec frontend head -30 /usr/share/nginx/html/index.html

# 4. .env.production prüfen
echo -e "\n${CYAN}[4/7] .env.production Inhalt:${NC}"
cat frontend/.env.production

# 5. package.json homepage prüfen
echo -e "\n${CYAN}[5/7] package.json homepage:${NC}"
grep -A 1 '"homepage"' frontend/package.json

# 6. Frontend neu bauen
echo -e "\n${CYAN}[6/7] Frontend Container neu bauen...${NC}"
read -p "Frontend neu bauen? (j/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]
then
    echo "Stoppe Frontend..."
    docker-compose stop frontend
    
    echo "Baue Frontend neu (ohne Cache)..."
    docker-compose build --no-cache frontend
    
    echo "Starte Frontend..."
    docker-compose up -d frontend
    
    echo "Warte 5 Sekunden..."
    sleep 5
fi

# 7. Test-Request
echo -e "\n${CYAN}[7/7] Test-Request:${NC}"
echo "Hauptseite:"
curl -I http://localhost:3002/ 2>/dev/null | head -5

echo ""
echo "Static JS (erster gefundener):"
JS_FILE=$(docker-compose exec frontend find /usr/share/nginx/html -name "*.js" -type f | head -1 | tr -d '\r')
if [ ! -z "$JS_FILE" ]; then
    JS_NAME=$(basename $JS_FILE)
    echo "Datei: $JS_NAME"
    curl -I http://localhost:3002/static/js/$JS_NAME 2>/dev/null | head -5
else
    echo -e "${RED}Keine JS-Dateien gefunden!${NC}"
fi

echo -e "\n${GREEN}Diagnose abgeschlossen!${NC}"
echo -e "${YELLOW}Falls Fehler bestehen:${NC}"
echo "1. Prüfen Sie ob PUBLIC_URL=/ in frontend/.env.production steht"
echo "2. Committen und pushen Sie die Änderungen"
echo "3. Auf dem Server: git pull && docker-compose build --no-cache frontend && docker-compose up -d"
