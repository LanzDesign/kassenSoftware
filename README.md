# Kassensoftware - FECG Lahr Sonntagsküche

Eine moderne Kassensoftware für die Sonntagsküche mit Django Backend und React Frontend.

## 📋 Features

- **Verkaufsverwaltung**: Zählung von Kinder-, Erwachsenen- und Tee-Verkäufen
- **Kassenabrechnung**: Automatische Berechnung von Tageseinnahmen und Kassenstand
- **Bargeld-Zählung**: Detaillierte Erfassung aller Münzen und Scheine
- **Rückgeldspende**: Verwaltung von Rückgeldspenden
- **REST API**: Vollständige API für mobile Apps oder externe Integrationen
- **Responsive Design**: Optimiert für Desktop und Tablet

## 🚀 Installation

### Voraussetzungen

- Python 3.11+
- Node.js 16+
- npm oder yarn

### Backend Setup

1. **Virtual Environment aktivieren:**

```bash
cd kassenSoftware
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# oder
source venv/bin/activate  # Linux/Mac
```

2. **Abhängigkeiten sind bereits installiert**

3. **Datenbank migrieren (bereits durchgeführt):**

```bash
cd backend
python manage.py migrate
```

4. **Admin-User erstellen (optional):**

```bash
python manage.py createsuperuser
```

5. **Development Server starten:**

```bash
python manage.py runserver
```

Backend läuft auf: http://localhost:8000
Admin Panel: http://localhost:8000/admin
API: http://localhost:8000/api/abrechnungen/

### Frontend Setup

1. **In Frontend-Verzeichnis wechseln:**

```bash
cd frontend
```

2. **Abhängigkeiten installieren:**

```bash
npm install
```

3. **Development Server starten:**

```bash
npm start
```

Frontend läuft auf: http://localhost:3000

## 📁 Projektstruktur

```
kassenSoftware/
├── backend/                    # Django Backend
│   ├── kassensystem/          # Django Projekt
│   │   ├── settings.py        # Konfiguration
│   │   ├── urls.py            # Haupt-URLs
│   │   └── wsgi.py
│   ├── kasse/                 # Kassen-App
│   │   ├── models.py          # Datenbankmodelle
│   │   ├── serializers.py     # API Serializer
│   │   ├── views.py           # API Views
│   │   ├── urls.py            # App URLs
│   │   └── admin.py           # Admin-Interface
│   ├── manage.py
│   └── db.sqlite3             # SQLite Datenbank
├── frontend/                   # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx            # Hauptkomponente
│   │   ├── App.css            # Styles
│   │   ├── api.ts             # API Service
│   │   ├── types.ts           # TypeScript Typen
│   │   ├── index.tsx          # Entry Point
│   │   └── index.css
│   ├── package.json
│   └── tsconfig.json
├── venv/                       # Python Virtual Environment
└── requirements.txt           # Python Dependencies
```

## 🔧 API Endpoints

### Kassenabrechnungen

- `GET /api/abrechnungen/` - Alle Abrechnungen abrufen
- `POST /api/abrechnungen/` - Neue Abrechnung erstellen
- `GET /api/abrechnungen/{id}/` - Einzelne Abrechnung abrufen
- `PATCH /api/abrechnungen/{id}/` - Abrechnung aktualisieren
- `DELETE /api/abrechnungen/{id}/` - Abrechnung löschen
- `GET /api/abrechnungen/aktuelle/` - Aktuelle (neueste) Abrechnung
- `POST /api/abrechnungen/{id}/reset/` - Alle Zähler zurücksetzen

### Beispiel Request

```bash
# Neue Kassenabrechnung erstellen
curl -X POST http://localhost:8000/api/abrechnungen/ \
  -H "Content-Type: application/json" \
  -d '{
    "datum": "2025-01-01",
    "kassenstand_anfang": 0.00,
    "anzahl_kinder": 0,
    "anzahl_erwachsene": 0,
    "anzahl_tee": 0
  }'
```

## 💾 Datenmodell

### Kassenabrechnung

| Feld                | Typ     | Beschreibung                                 |
| ------------------- | ------- | -------------------------------------------- |
| datum               | Date    | Datum der Abrechnung                         |
| kassenstand_anfang  | Decimal | Kassenstand zu Beginn                        |
| anzahl_kinder       | Integer | Anzahl verkaufter Kinderessen                |
| anzahl_erwachsene   | Integer | Anzahl verkaufter Erwachsenenessen           |
| anzahl_tee          | Integer | Anzahl verkaufter Tees                       |
| preis_kinder        | Decimal | Preis pro Kinderessen (Standard: 3.00€)      |
| preis_erwachsene    | Decimal | Preis pro Erwachsenenessen (Standard: 5.00€) |
| preis_tee           | Decimal | Preis pro Tee (Standard: 1.00€)              |
| anzahl\_\*euro/cent | Integer | Anzahl der Scheine/Münzen                    |
| gegeben             | Decimal | Gegebener Betrag                             |
| rueckgeld           | Decimal | Rückgeld                                     |
| rueckgeldspende     | Decimal | Gespendetes Rückgeld                         |

**Berechnete Felder:**

- `tageseinnahmen_gesamt`: Summe aller Verkäufe
- `kassenstand_soll`: Kassenstand Anfang + Tageseinnahmen
- `bargeld_gesamt`: Summe des gezählten Bargelds

## 🎨 Verwendung

### Verkäufe erfassen

1. Klicken Sie auf die Buttons (3, 4, 5, 6) um Verkäufe zu erfassen
2. Die Gesamtsumme wird automatisch berechnet
3. Verwenden Sie den Minus-Button zum Korrigieren

### Bargeld zählen

1. Scrollen Sie zum Bargeld-Bereich
2. Klicken Sie + oder - um Scheine/Münzen zu zählen
3. Der Gesamtbetrag wird automatisch berechnet

### Kassenabrechnung

1. Vergleichen Sie "Kassenstand Soll" mit "Bargeld Gesamt"
2. Verwenden Sie "Reset" um alle Zähler zurückzusetzen
3. Verwenden Sie "Rückgeldspende" für Spenden

## 🔐 Sicherheit

**Wichtig für Production:**

- Ändern Sie `SECRET_KEY` in `settings.py`
- Setzen Sie `DEBUG = False`
- Konfigurieren Sie `ALLOWED_HOSTS`
- Ändern Sie `CORS_ALLOW_ALL_ORIGINS = False` und setzen Sie spezifische Origins
- Verwenden Sie PostgreSQL statt SQLite
- Nutzen Sie HTTPS

## 🐛 Troubleshooting

### Backend startet nicht

```bash
# Prüfen Sie ob venv aktiviert ist
# Prüfen Sie ob Port 8000 frei ist
netstat -ano | findstr :8000
```

### Frontend verbindet nicht mit Backend

- Stellen Sie sicher, dass Backend auf Port 8000 läuft
- Prüfen Sie CORS-Einstellungen in `settings.py`
- Prüfen Sie API_BASE_URL in `frontend/src/api.ts`

### Datenbank-Fehler

```bash
# Migrationen zurücksetzen
python manage.py migrate kasse zero
python manage.py migrate
```

## 📝 Lizenz

Dieses Projekt wurde für die FECG Lahr Sonntagsküche entwickelt.

## 🤝 Kontakt

Bei Fragen oder Problemen wenden Sie sich an die IT-Abteilung der FECG Lahr.

## 🔄 Updates

### Version 1.0.0 (Dezember 2025)

- Initiale Version
- Django REST API Backend
- React TypeScript Frontend
- Vollständige Kassenverwaltung
- Bargeld-Zählung
- Responsive Design
