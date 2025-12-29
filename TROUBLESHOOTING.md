# Troubleshooting Guide

## Problem: Static Files (CSS/JS) werden nicht geladen

### Symptome:

- Browser-Fehler: `Failed to load resource: 404`
- MIME-Type Fehler: `text/html` statt `application/javascript`
- `ERR_NAME_NOT_RESOLVED` für `backend:8000`

### Lösung:

1. **Frontend neu bauen** (wichtig nach .env Änderungen):

   ```bash
   docker-compose down
   docker-compose build --no-cache frontend
   docker-compose up -d
   ```

2. **Prüfen ob .env.production existiert**:

   ```bash
   cat frontend/.env.production
   ```

   Sollte enthalten: `REACT_APP_API_URL=/api`

3. **Browser-Cache leeren**:

   - Chrome: Strg + Shift + Delete
   - Oder: Inkognito-Fenster verwenden

4. **Container-Logs prüfen**:
   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   ```

## Problem: API-Anfragen schlagen fehl

### Symptome:

- Network Errors in Browser Console
- 502 Bad Gateway
- CORS Errors

### Lösung:

1. **Backend-Health prüfen**:

   ```bash
   docker-compose ps
   curl http://localhost:8002/api/
   ```

2. **NGINX-Konfiguration prüfen**:

   ```bash
   docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
   ```

3. **Backend-Logs prüfen**:

   ```bash
   docker-compose logs backend | tail -50
   ```

4. **Netzwerk-Verbindung testen**:
   ```bash
   docker-compose exec frontend ping backend
   ```

## Problem: Datenbank-Verbindung fehlgeschlagen

### Symptome:

- Backend startet nicht
- Fehler: "could not connect to database"

### Lösung:

1. **Datenbank-Status prüfen**:

   ```bash
   docker-compose ps db
   docker-compose logs db
   ```

2. **Health-Check manuell testen**:

   ```bash
   docker-compose exec db pg_isready -U kasse_user -d kasse_db
   ```

3. **.env Datei prüfen**:

   ```bash
   cat .env | grep POSTGRES
   ```

4. **Datenbank neu initialisieren** (VORSICHT: Löscht Daten!):
   ```bash
   docker-compose down -v
   docker-compose up -d
   docker-compose exec backend python manage.py migrate
   ```

## Problem: Container startet nicht

### Symptome:

- Container Status: "Restarting" oder "Exited"

### Lösung:

1. **Container-Logs anzeigen**:

   ```bash
   docker-compose logs <service-name>
   ```

2. **Images neu bauen**:

   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Einzelnen Container debuggen**:

   ```bash
   docker-compose up <service-name>
   ```

4. **In Container einloggen**:
   ```bash
   docker-compose exec <service-name> sh
   ```

## Problem: Port bereits belegt

### Symptome:

- Fehler: "port is already allocated"

### Lösung:

1. **Verwendete Ports prüfen**:

   ```bash
   # Windows
   netstat -ano | findstr :3002
   netstat -ano | findstr :8002

   # Linux
   lsof -i :3002
   lsof -i :8002
   ```

2. **Ports in docker-compose.yml ändern**:

   ```yaml
   ports:
     - "3003:80" # Statt 3002
   ```

3. **Alten Container stoppen**:
   ```bash
   docker ps -a
   docker stop <container-id>
   docker rm <container-id>
   ```

## Nützliche Befehle

### Container neu starten:

```bash
docker-compose restart
```

### Nur einen Service neu starten:

```bash
docker-compose restart frontend
```

### Alle Container-Logs live anzeigen:

```bash
docker-compose logs -f
```

### Nur einen Service:

```bash
docker-compose logs -f backend
```

### In Container einloggen:

```bash
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec db psql -U kasse_user -d kasse_db
```

### Container-Details anzeigen:

```bash
docker inspect kassensoftware-frontend
```

### Disk-Space bereinigen:

```bash
docker system prune -a
```

### Kompletter Neustart (Löscht Daten!):

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## Performance-Probleme

### Container sind langsam:

1. **Resource-Limits prüfen**:

   ```bash
   docker stats
   ```

2. **Production-Config verwenden** (mit Resource-Limits):

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Logs rotieren**:
   ```bash
   docker-compose logs --tail=100
   ```

### Datenbank ist langsam:

1. **PostgreSQL-Statistiken prüfen**:

   ```bash
   docker-compose exec db psql -U kasse_user -d kasse_db -c "SELECT * FROM pg_stat_database WHERE datname='kasse_db';"
   ```

2. **Indexes prüfen**:
   ```bash
   docker-compose exec backend python manage.py dbshell
   \d+ kasse_kassenabrechnung
   ```

## Support

Bei weiteren Problemen:

1. Komplette Logs sammeln:

   ```bash
   docker-compose logs > logs.txt
   ```

2. Container-Status exportieren:

   ```bash
   docker-compose ps > status.txt
   docker stats --no-stream >> status.txt
   ```

3. System-Info sammeln:
   ```bash
   docker version > system-info.txt
   docker-compose version >> system-info.txt
   ```
