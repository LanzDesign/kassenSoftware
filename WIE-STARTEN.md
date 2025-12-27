# KASSENSOFTWARE - So geht's!

## ✅ Die Software ist jetzt einsatzbereit!

### 🚀 Schnellstart (Einfachste Methode)

**Doppelklick auf: `START.ps1`**

Das Skript öffnet automatisch:

- Backend-Server (Port 8000)
- Frontend-Server (Port 3000)
- Browser mit der Kassensoftware

Die beiden Server laufen in separaten PowerShell-Fenstern.

---

### 📝 Manuelle Methode

#### Backend starten:

1. PowerShell öffnen
2. Eingeben:
   ```powershell
   cd C:\Users\Daniel\Documents\GitHub\kassenSoftware\backend
   C:\Users\Daniel\Documents\GitHub\kassenSoftware\venv\Scripts\python.exe manage.py runserver
   ```

#### Frontend starten (neues PowerShell-Fenster):

1. Neue PowerShell öffnen
2. Eingeben:
   ```powershell
   cd C:\Users\Daniel\Documents\GitHub\kassenSoftware\frontend
   npm start
   ```

---

### 🌐 URLs

- **Frontend (Kassensystem):** http://localhost:3000
- **Backend API:** http://localhost:8000/api/abrechnungen/
- **Admin-Panel:** http://localhost:8000/admin

---

### ❓ Problemlösung

**"npm start" funktioniert nicht?**

- Stellen Sie sicher, dass Sie im `frontend` Ordner sind
- Führen Sie aus: `npm install`

**Backend startet nicht?**

- Prüfen Sie, ob Port 8000 bereits belegt ist
- Prüfen Sie, ob Python korrekt installiert ist

**Frontend kann Backend nicht erreichen?**

- Stellen Sie sicher, dass beide Server laufen
- Prüfen Sie http://localhost:8000/api/abrechnungen/ im Browser

---

### 🎯 Erste Schritte

1. **START.ps1** ausführen (Rechtsklick → Mit PowerShell ausführen)
2. Warten bis Browser sich öffnet
3. Verkäufe erfassen mit den Buttons (3, 4, 5, 6)
4. Am Ende des Tages Bargeld zählen
5. "Reset" Button zum Zurücksetzen

---

### 👨‍💼 Admin-Zugang erstellen

Wenn Sie das Admin-Panel nutzen möchten:

```powershell
cd backend
C:\Users\Daniel\Documents\GitHub\kassenSoftware\venv\Scripts\python.exe manage.py createsuperuser
```

Dann können Sie sich unter http://localhost:8000/admin anmelden.

---

### 📞 Hilfe

Bei Problemen siehe: `README.md`
