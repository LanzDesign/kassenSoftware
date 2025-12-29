#!/bin/bash
# Deployment-Script für Linux/Server
# Führt ein komplettes Update der Kassensoftware durch

set -e  # Bei Fehler abbrechen

echo "=== Kassensoftware Update ==="

# Farben
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Git Pull
echo -e "${CYAN}[1/6] Git Repository aktualisieren...${NC}"
git pull

# 2. Container stoppen
echo -e "${CYAN}[2/6] Container stoppen...${NC}"
docker-compose down

# 3. Container neu bauen (mit --no-cache für sauberen Build)
echo -e "${CYAN}[3/6] Container neu bauen...${NC}"
docker-compose build --no-cache

# 4. Container starten
echo -e "${CYAN}[4/6] Container starten...${NC}"
docker-compose up -d

# 5. Warten auf Container
echo -e "${CYAN}[5/6] Warten auf Container-Start...${NC}"
sleep 15

# 6. Migrations ausführen
echo -e "${CYAN}[6/6] Datenbank-Migrationen ausführen...${NC}"
docker-compose exec -T backend python manage.py migrate
docker-compose exec -T backend python manage.py collectstatic --noinput

# Status anzeigen
echo -e "${GREEN}=== Container Status ===${NC}"
docker-compose ps

echo -e "${GREEN}Deployment abgeschlossen!${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3002${NC}"
echo -e "${YELLOW}Backend: http://localhost:8002${NC}"
echo -e "Logs anzeigen: docker-compose logs -f"
