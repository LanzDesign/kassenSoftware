# Quick-Fix: Frontend Static Files Problem beheben (PowerShell)

Write-Host "=== Quick-Fix: Frontend Static Files ===" -ForegroundColor Green

# 1. Prüfen ob Container laufen
Write-Host "`n[1/7] Container-Status prüfen..." -ForegroundColor Cyan
docker-compose ps

# 2. Frontend Container-Inhalt prüfen
Write-Host "`n[2/7] Prüfe Frontend-Container-Inhalt..." -ForegroundColor Cyan
Write-Host "Dateien in /usr/share/nginx/html:"
docker-compose exec frontend ls -la /usr/share/nginx/html/

Write-Host "`nStatic-Dateien:"
$staticCheck = docker-compose exec frontend ls -la /usr/share/nginx/html/static/ 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Kein /static/ Verzeichnis gefunden" -ForegroundColor Yellow
} else {
    Write-Host $staticCheck
}

# 3. Index.html prüfen
Write-Host "`n[3/7] Index.html Inhalt (erste 30 Zeilen):" -ForegroundColor Cyan
docker-compose exec frontend head -30 /usr/share/nginx/html/index.html

# 4. .env.production prüfen
Write-Host "`n[4/7] .env.production Inhalt:" -ForegroundColor Cyan
Get-Content frontend\.env.production

# 5. package.json homepage prüfen
Write-Host "`n[5/7] package.json homepage:" -ForegroundColor Cyan
Get-Content frontend\package.json | Select-String -Pattern '"homepage"' -Context 0,1

# 6. Frontend neu bauen
Write-Host "`n[6/7] Frontend Container neu bauen..." -ForegroundColor Cyan
$rebuild = Read-Host "Frontend neu bauen? (j/n)"
if ($rebuild -eq "j" -or $rebuild -eq "J") {
    Write-Host "Stoppe Frontend..." -ForegroundColor Yellow
    docker-compose stop frontend
    
    Write-Host "Baue Frontend neu (ohne Cache)..." -ForegroundColor Yellow
    docker-compose build --no-cache frontend
    
    Write-Host "Starte Frontend..." -ForegroundColor Yellow
    docker-compose up -d frontend
    
    Write-Host "Warte 5 Sekunden..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# 7. Test-Request
Write-Host "`n[7/7] Test-Request:" -ForegroundColor Cyan
Write-Host "Hauptseite:"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/" -Method Head -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content-Type: $($response.Headers['Content-Type'])"
} catch {
    Write-Host "Fehler: $_" -ForegroundColor Red
}

Write-Host "`nStatic JS Test:"
$jsFiles = docker-compose exec frontend find /usr/share/nginx/html -name "*.js" -type f 2>$null
if ($jsFiles) {
    $jsFile = ($jsFiles -split "`n")[0].Trim()
    $jsName = Split-Path $jsFile -Leaf
    Write-Host "Datei: $jsName"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/static/js/$jsName" -Method Head -ErrorAction Stop
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "Status: 404 - Nicht gefunden" -ForegroundColor Red
    }
} else {
    Write-Host "Keine JS-Dateien gefunden!" -ForegroundColor Red
}

Write-Host "`n=== Diagnose abgeschlossen! ===" -ForegroundColor Green
Write-Host "`nFalls Fehler bestehen:" -ForegroundColor Yellow
Write-Host "1. Prüfen Sie ob PUBLIC_URL=/ in frontend\.env.production steht"
Write-Host "2. Committen und pushen Sie die Änderungen"
Write-Host "3. Auf dem Server: git pull && docker-compose build --no-cache frontend && docker-compose up -d"
