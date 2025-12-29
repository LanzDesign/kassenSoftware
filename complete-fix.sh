#!/bin/bash
# KOMPLETTER FIX für Static-Files Problem
# Dieses Script behebt alle bekannten Probleme

set -e

echo "=========================================="
echo "  Kassensoftware - Static Files Fix"
echo "=========================================="

# Farben
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}[1/8] Git Status prüfen...${NC}"
git status

echo -e "\n${CYAN}[2/8] Neueste Änderungen vom Repository holen...${NC}"
git pull

echo -e "\n${CYAN}[3/8] Frontend .env Dateien prüfen...${NC}"
echo "=== .env.production ==="
cat frontend/.env.production
echo ""
echo "=== .env (sollte leer/irrelevant sein) ==="
cat frontend/.env 2>/dev/null || echo "Keine .env vorhanden (gut!)"

echo -e "\n${CYAN}[4/8] Alle Container stoppen...${NC}"
docker-compose down

echo -e "\n${CYAN}[5/8] Docker Build Cache leeren...${NC}"
docker builder prune -f

echo -e "\n${CYAN}[6/8] Frontend Container komplett neu bauen...${NC}"
docker-compose build --no-cache --pull frontend

echo -e "\n${CYAN}[7/8] Alle Container starten...${NC}"
docker-compose up -d

echo -e "\n${CYAN}[8/8] Warte auf Container-Start und prüfe Status...${NC}"
sleep 15

echo ""
docker-compose ps

echo -e "\n${GREEN}=========================================="
echo "  Fix abgeschlossen!"
echo "==========================================${NC}"

echo -e "\n${YELLOW}WICHTIG:${NC}"
echo "1. Öffnen Sie die Seite im ${YELLOW}Inkognito-Modus${NC}"
echo "2. Oder leeren Sie den Browser-Cache (Strg+Shift+Delete)"
echo "3. Oder machen Sie einen Hard-Refresh (Strg+Shift+R)"

echo -e "\n${CYAN}Test-URLs:${NC}"
echo "Frontend: http://localhost:3002"
echo "Backend:  http://localhost:8002/api/"

echo -e "\n${CYAN}Logs anzeigen:${NC}"
echo "docker-compose logs -f frontend"
echo "docker-compose logs -f backend"

echo -e "\n${CYAN}Container-Inhalt prüfen:${NC}"
echo "docker-compose exec frontend ls -la /usr/share/nginx/html/"
echo "docker-compose exec frontend cat /usr/share/nginx/html/index.html"
