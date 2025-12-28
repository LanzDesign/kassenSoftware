# Deployment Anleitung für kassensoftware.fecg-lahr-app.de

## Voraussetzungen

- Docker und Docker Compose installiert
- NGINX konfiguriert für die Domain
- SSL-Zertifikat (Let's Encrypt empfohlen)

## .env Datei erstellen

Erstelle eine `.env` Datei im Projektverzeichnis mit folgenden Einstellungen:

```bash
# --- Django Settings ---
DEBUG=False
SECRET_KEY=super-geheimer-key-bitte-aendern-12345
ALLOWED_HOSTS=kassensoftware.fecg-lahr-app.de,www.fecg-lahr-app.de,localhost,127.0.0.1,backend

# --- Datenbank Verbindung ---
POSTGRES_ENGINE=django.db.backends.postgresql
POSTGRES_DB=kasse_db
POSTGRES_USER=kasse_user
POSTGRES_PASSWORD=dein_sicheres_passwort
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

**WICHTIG**: Ändere `SECRET_KEY` und `POSTGRES_PASSWORD` in sichere, zufällige Werte!

## Deployment Schritte

### 1. Repository klonen

```bash
cd /var/www
git clone <repository-url> kassenSoftware
cd kassenSoftware
```

### 2. .env Datei anlegen

```bash
cp .env.example .env
nano .env  # oder vi .env
# Trage die Produktionswerte ein
```

### 3. Docker Container bauen und starten

```bash
docker-compose up -d --build
```

### 4. Datenbank migrieren (beim ersten Start)

```bash
docker-compose exec backend python manage.py migrate
```

### 5. Admin-Benutzer erstellen (optional)

```bash
docker-compose exec backend python manage.py createsuperuser
```

## NGINX Konfiguration

Erstelle eine NGINX-Konfiguration unter `/etc/nginx/sites-available/kassensoftware`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name kassensoftware.fecg-lahr-app.de;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kassensoftware.fecg-lahr-app.de;

    # SSL Zertifikate (anpassen!)
    ssl_certificate /etc/letsencrypt/live/kassensoftware.fecg-lahr-app.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kassensoftware.fecg-lahr-app.de/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # Proxy zu Docker Container
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Logs
    access_log /var/log/nginx/kassensoftware_access.log;
    error_log /var/log/nginx/kassensoftware_error.log;
}
```

### NGINX aktivieren

```bash
ln -s /etc/nginx/sites-available/kassensoftware /etc/nginx/sites-enabled/
nginx -t  # Konfiguration testen
systemctl reload nginx
```

## SSL-Zertifikat mit Let's Encrypt

```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d kassensoftware.fecg-lahr-app.de
```

## Nützliche Docker-Befehle

### Logs anzeigen

```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Container neustarten

```bash
docker-compose restart
```

### Container stoppen

```bash
docker-compose down
```

### Container stoppen und Volumes löschen (VORSICHT: Löscht Datenbank!)

```bash
docker-compose down -v
```

### Updates deployen

```bash
git pull
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

## Backup

### Datenbank-Backup erstellen

```bash
docker-compose exec db pg_dump -U kasse_user kasse_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Datenbank wiederherstellen

```bash
docker-compose exec -T db psql -U kasse_user kasse_db < backup_20251228_120000.sql
```

## Troubleshooting

### Backend-Logs prüfen

```bash
docker-compose logs backend
```

### In Backend-Container einloggen

```bash
docker-compose exec backend bash
```

### Datenbank-Verbindung testen

```bash
docker-compose exec backend python manage.py dbshell
```

### Container neu bauen (bei Problemen)

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Wartung

### Regelmäßige Backups einrichten

Erstelle einen Cronjob:

```bash
crontab -e
```

Füge hinzu:

```
0 2 * * * cd /var/www/kassenSoftware && docker-compose exec db pg_dump -U kasse_user kasse_db > /backup/kasse_$(date +\%Y\%m\%d).sql
```

### Logs rotieren

Docker rotiert Logs automatisch, aber überwache die Größe:

```bash
docker-compose logs --tail=100
```
