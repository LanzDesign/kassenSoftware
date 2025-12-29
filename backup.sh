#!/bin/bash
# Backup-Script für Kassensoftware Datenbank

# Konfiguration
BACKUP_DIR="/backups/kassensoftware"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/kasse_backup_$DATE.sql"
RETENTION_DAYS=30

# Backup-Verzeichnis erstellen
mkdir -p $BACKUP_DIR

# Datenbank-Backup erstellen
echo "Erstelle Backup..."
docker-compose exec -T db pg_dump -U kasse_user kasse_db > "$BACKUP_FILE"

# Komprimieren
gzip "$BACKUP_FILE"
echo "Backup erstellt: ${BACKUP_FILE}.gz"

# Alte Backups löschen (älter als RETENTION_DAYS)
find $BACKUP_DIR -name "kasse_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "Alte Backups gelöscht (älter als $RETENTION_DAYS Tage)"

echo "Backup abgeschlossen!"
