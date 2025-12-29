# Fix: Static Files werden nicht geladen (404 Fehler)

## Problem

```
Failed to load resource: the server responded with a status of 404
/static/js/main.9a3ea06f.js
```

## Ursache

React Build erstellt Assets im `/static/` Unterverzeichnis, aber wenn `PUBLIC_URL` nicht korrekt gesetzt ist, werden die Pfade falsch generiert.

## Lösung

### 1. Änderungen committen und pushen

Die folgenden Dateien wurden bereits angepasst:

- ✅ `frontend/.env.production` → `PUBLIC_URL=/` hinzugefügt
- ✅ `frontend/package.json` → `"homepage": "."` hinzugefügt
- ✅ `frontend/Dockerfile` → Kopiert `.env.production` und setzt `NODE_ENV`

**Jetzt committen:**

```bash
git add .
git commit -m "Fix: Static Files Pfade für Production Build"
git push
```

### 2. Auf dem Server deployen

**Option A: Komplettes Deployment (empfohlen)**

```bash
ssh root@your-server

cd /var/www/kassenSoftware
git pull
chmod +x deploy.sh
./deploy.sh
```

**Option B: Nur Frontend neu bauen**

```bash
ssh root@your-server

cd /var/www/kassenSoftware
git pull
docker-compose stop frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

**Option C: Quick-Fix Script verwenden**

```bash
ssh root@your-server

cd /var/www/kassenSoftware
git pull
chmod +x fix-static-files.sh
./fix-static-files.sh
```

### 3. Browser-Cache leeren

Nach dem Deployment:

1. **Inkognito-Fenster öffnen** und Seite testen
2. Oder: **Hard Refresh** (Strg + Shift + R / Cmd + Shift + R)
3. Oder: **Browser-Cache komplett leeren**

## Testen

Nach dem Deployment testen:

```bash
# Hauptseite sollte 200 zurückgeben
curl -I https://kassensoftware.fecg-lahr-app.de/

# Static Files sollten existieren (innerhalb Container)
docker-compose exec frontend ls -la /usr/share/nginx/html/static/js/

# NGINX Logs prüfen
docker-compose logs frontend | grep "GET /static"
```

**Erwartetes Ergebnis:**

- ✅ Hauptseite lädt (200 OK)
- ✅ Keine 404 Fehler für `/static/js/` oder `/static/css/`
- ✅ Console zeigt keine MIME-Type Fehler

## Diagnose

Wenn das Problem weiterhin besteht:

### Container-Inhalt prüfen

```bash
# Was ist im nginx html-Verzeichnis?
docker-compose exec frontend ls -la /usr/share/nginx/html/

# Gibt es ein static-Verzeichnis?
docker-compose exec frontend ls -la /usr/share/nginx/html/static/

# Was steht in der index.html?
docker-compose exec frontend cat /usr/share/nginx/html/index.html | grep -E "(js|css)"
```

### Lokaler Test-Build

Auf Ihrer lokalen Maschine:

```bash
cd frontend
npm install
npm run build
ls -la build/
ls -la build/static/
cat build/index.html | grep -E "(js|css)"
```

Die Build-Artefakte sollten so aussehen:

```
build/
├── index.html           (referenziert ./static/js/main.xxx.js)
├── static/
│   ├── css/
│   │   └── main.xxx.css
│   └── js/
│       └── main.xxx.js
```

## Häufige Fehler

### ❌ `PUBLIC_URL` nicht gesetzt

**Symptom:** Assets werden mit `/static/` statt `./static/` referenziert

**Lösung:** In `frontend/.env.production`:

```
PUBLIC_URL=/
```

### ❌ `.env.production` nicht im Docker Build

**Symptom:** Build ignoriert Environment-Variablen

**Lösung:** In `frontend/Dockerfile`:

```dockerfile
COPY .env.production .env.production
ENV NODE_ENV=production
RUN npm run build
```

### ❌ `homepage` in package.json fehlt

**Symptom:** Absolute Pfade statt relative

**Lösung:** In `frontend/package.json`:

```json
{
  "homepage": ".",
  ...
}
```

### ❌ Browser-Cache

**Symptom:** Alte Version wird angezeigt

**Lösung:** Inkognito-Modus oder Hard Refresh

## Alternative: NGINX Alias

Falls Sie die Build-Konfiguration nicht ändern möchten, können Sie auch NGINX anpassen:

In `frontend/nginx.conf`:

```nginx
location /static/ {
    alias /usr/share/nginx/html/static/;
}
```

**Aber:** Die empfohlene Lösung ist es, `PUBLIC_URL=/` zu setzen!

## Checkliste

- [ ] `frontend/.env.production` enthält `PUBLIC_URL=/`
- [ ] `frontend/package.json` enthält `"homepage": "."`
- [ ] `frontend/Dockerfile` kopiert `.env.production`
- [ ] Änderungen committet und gepusht
- [ ] Auf Server: `git pull` ausgeführt
- [ ] Frontend-Container neu gebaut: `docker-compose build --no-cache frontend`
- [ ] Container neu gestartet: `docker-compose up -d`
- [ ] Browser-Cache geleert
- [ ] Seite im Inkognito-Modus getestet

## Support

Wenn das Problem weiterhin besteht:

1. **Logs sammeln:**

   ```bash
   docker-compose logs frontend > frontend-logs.txt
   docker-compose exec frontend ls -laR /usr/share/nginx/html/ > container-content.txt
   cat frontend/.env.production > env-production.txt
   ```

2. **Container-Inhalt prüfen:**

   ```bash
   docker-compose exec frontend sh
   cd /usr/share/nginx/html
   ls -la
   cat index.html
   ```

3. **Siehe:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
