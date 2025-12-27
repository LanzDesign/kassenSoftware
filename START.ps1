# KASSENSOFTWARE STARTEN
# Dieses Skript startet Backend und Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KASSENSOFTWARE - FECG Lahr" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backend starten
Write-Host "[1/2] Backend wird gestartet..." -ForegroundColor Yellow
$backendPath = "C:\Users\Daniel\Documents\GitHub\kassenSoftware\backend"
$pythonExe = "C:\Users\Daniel\Documents\GitHub\kassenSoftware\.venv\Scripts\python.exe"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '$pythonExe' manage.py runserver"

Start-Sleep -Seconds 3

# Frontend starten  
Write-Host "[2/2] Frontend wird gestartet..." -ForegroundColor Yellow
$frontendPath = "C:\Users\Daniel\Documents\GitHub\kassenSoftware\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start"

Start-Sleep -Seconds 8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  KASSENSOFTWARE LAEUFT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Admin:    http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Die Server laufen in separaten Fenstern." -ForegroundColor Yellow
Write-Host "Schliessen Sie die Fenster um die Server zu stoppen." -ForegroundColor Yellow
Write-Host ""

# Browser oeffnen
Start-Sleep -Seconds 15
Start-Process "http://localhost:3000"
