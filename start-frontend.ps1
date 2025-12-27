# Startskript für Frontend (Windows PowerShell)

Write-Host "=== Kassensoftware Frontend starten ===" -ForegroundColor Green

# Zum Frontend wechseln
Set-Location frontend

# Server starten
Write-Host "Frontend startet auf http://localhost:3000" -ForegroundColor Cyan
npm start
