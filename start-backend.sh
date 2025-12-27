#!/bin/bash
# Startskript für Linux/Mac

echo "=== Kassensoftware Backend starten ==="

# Virtual Environment aktivieren
source venv/bin/activate

# Zum Backend wechseln
cd backend

# Server starten
echo "Backend startet auf http://localhost:8000"
python manage.py runserver
