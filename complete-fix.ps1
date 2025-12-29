# KOMPLETTER FIX für Static-Files Problem (PowerShell)
# Dieses Script behebt alle bekannten Probleme

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Kassensoftware - Static Files Fix" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host "`n[1/8] Git Status prüfen..." -ForegroundColor Cyan
git status

Write-Host "`n[2/8] Neueste Änderungen vom Repository holen..." -ForegroundColor Cyan
git pull

Write-Host "`n[3/8] Frontend .env Dateien prüfen..." -ForegroundColor Cyan
Write-Host "=== .env.production ===" -ForegroundColor Yellow
Get-Content frontend\.env.production
Write-Host "`n=== .env (sollte leer/irrelevant sein) ===" -ForegroundColor Yellow
if (Test-Path frontend\.env) {
    Get-Content frontend\.env
} else {
    Write-Host "Keine .env vorhanden (gut!)" -ForegroundColor Green
}

Write-Host "`n[4/8] Alle Container stoppen..." -ForegroundColor Cyan
docker-compose down

Write-Host "`n[5/8] Docker Build Cache leeren..." -ForegroundColor Cyan
docker builder prune -f

Write-Host "`n[6/8] Frontend Container komplett neu bauen..." -ForegroundColor Cyan
docker-compose build --no-cache --pull frontend

Write-Host "`n[7/8] Alle Container starten..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "`n[8/8] Warte auf Container-Start und prüfe Status..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host ""
docker-compose ps

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  Fix abgeschlossen!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host "`nWICHTIG:" -ForegroundColor Yellow
Write-Host "1. Öffnen Sie die Seite im " -NoNewline
Write-Host "Inkognito-Modus" -ForegroundColor Yellow
Write-Host "2. Oder leeren Sie den Browser-Cache (Strg+Shift+Delete)"
Write-Host "3. Oder machen Sie einen Hard-Refresh (Strg+Shift+R)"

Write-Host "`nTest-URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3002"
Write-Host "Backend:  http://localhost:8002/api/"

Write-Host "`nLogs anzeigen:" -ForegroundColor Cyan
Write-Host "docker-compose logs -f frontend"
Write-Host "docker-compose logs -f backend"

Write-Host "`nContainer-Inhalt prüfen:" -ForegroundColor Cyan
Write-Host "docker-compose exec frontend ls -la /usr/share/nginx/html/"
Write-Host "docker-compose exec frontend cat /usr/share/nginx/html/index.html"
