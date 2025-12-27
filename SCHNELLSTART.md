# Schnellstart-Anleitung

## Backend starten

1. Terminal öffnen im Projekt-Ordner
2. Virtual Environment aktivieren:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
3. Zum Backend-Ordner wechseln:
   ```powershell
   cd backend
   ```
4. Server starten:
   ```powershell
   python manage.py runserver
   ```
   Backend läuft auf: http://localhost:8000

## Frontend starten

1. Neues Terminal öffnen im Projekt-Ordner
2. Zum Frontend-Ordner wechseln:
   ```powershell
   cd frontend
   ```
3. Server starten:
   ```powershell
   npm start
   ```
   Frontend öffnet sich automatisch auf: http://localhost:3000

## Erste Schritte

1. Frontend öffnet sich im Browser
2. Eine neue Kassenabrechnung wird automatisch erstellt
3. Beginnen Sie Verkäufe zu erfassen mit den Buttons
4. Zählen Sie am Ende des Tages das Bargeld

## Admin-Zugang (Optional)

Um das Django Admin-Panel zu nutzen:

1. Superuser erstellen:
   ```powershell
   cd backend
   python manage.py createsuperuser
   ```
2. Admin-Panel öffnen: http://localhost:8000/admin

## Problemlösung

**Backend startet nicht?**

- Prüfen Sie ob venv aktiviert ist (sehen Sie `(venv)` im Terminal?)
- Prüfen Sie ob alle Pakete installiert sind: `pip install -r requirements.txt`

**Frontend startet nicht?**

- Prüfen Sie ob node_modules existiert
- Falls nicht: `npm install` ausführen

**Frontend kann Backend nicht erreichen?**

- Stellen Sie sicher, dass Backend läuft (http://localhost:8000)
- Prüfen Sie CORS-Einstellungen in backend/kassensystem/settings.py
