#!/bin/bash
set -e

echo "=== Backup erstellen ==="
cp /etc/nginx/sites-available/fecg-lahr-app.de /etc/nginx/sites-available/fecg-lahr-app.de.backup-$(date +%Y%m%d-%H%M%S)

echo "=== Prüfe ob Media-Route bereits existiert ==="
if grep -q "location /media/" /etc/nginx/sites-available/fecg-lahr-app.de; then
    echo "Media-Route existiert bereits!"
else
    echo "=== Media-Route hinzufügen ==="
    # Füge Media-Route vor der allgemeinen location / hinzu
    sed -i '/# --- ROUTING ZUM BACKEND CONTAINER MIT CORS FIX ---/i\    # --- MEDIA FILES (Hochgeladene Bilder) ---\n    location /media/ {\n        proxy_pass http://127.0.0.1:8001/media/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        \n        # CORS fuer Media-Dateien\n        proxy_hide_header '"'"'Access-Control-Allow-Origin'"'"';\n        add_header '"'"'Access-Control-Allow-Origin'"'"' '"'"'https://fecg-lahr-app.de'"'"' always;\n        add_header '"'"'Access-Control-Allow-Credentials'"'"' '"'"'true'"'"' always;\n    }\n' /etc/nginx/sites-available/fecg-lahr-app.de
fi

echo "=== NGINX Config Test ==="
nginx -t

if [ $? -eq 0 ]; then
    echo "=== NGINX Reload ==="
    systemctl reload nginx
    echo "NGINX erfolgreich neu geladen!"
    
    echo ""
    echo "=== Test: Media-Route ==="
    curl -I https://api.fecg-lahr-app.de/media/members/ 2>&1 | head -10
else
    echo "FEHLER in der NGINX Config!"
    exit 1
fi
