# Deployment-Script für Windows (PowerShell)
# Führt ein komplettes Update der Kassensoftware durch

Write-Host "=== Kassensoftware Update ===" -ForegroundColor Green

# 1. Git Pull
Write-Host "`n[1/5] Git Repository aktualisieren..." -ForegroundColor Cyan
git pull

# 2. Container stoppen
Write-Host "`n[2/5] Container stoppen..." -ForegroundColor Cyan
docker-compose down

# 3. Container neu bauen (mit --no-cache für sauberen Build)
Write-Host "`n[3/5] Container neu bauen..." -ForegroundColor Cyan
docker-compose build --no-cache

# 4. Container starten
Write-Host "`n[4/5] Container starten..." -ForegroundColor Cyan
docker-compose up -d

# 5. Warten und Migrations ausführen
Write-Host "`n[5/5] Datenbank-Migrationen ausführen..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
docker-compose exec backend python manage.py migrate

# Status anzeigen
Write-Host "`n=== Container Status ===" -ForegroundColor Green
docker-compose ps

Write-Host "`nDeployment abgeschlossen!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3002" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8002" -ForegroundColor Yellow
Write-Host "`nLogs anzeigen: docker-compose logs -f" -ForegroundColor Gray
