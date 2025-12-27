# Startskript für Windows PowerShell

Write-Host "=== Kassensoftware Backend starten ===" -ForegroundColor Green

# Virtual Environment aktivieren
& .\venv\Scripts\Activate.ps1

# Zum Backend wechseln
Set-Location backend

# Server starten
Write-Host "Backend startet auf http://localhost:8000" -ForegroundColor Cyan
python manage.py runserver
