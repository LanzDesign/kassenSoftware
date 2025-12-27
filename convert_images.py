from PIL import Image
import os

# Pfad zum Ordner mit den Bildern
money_dir = r"frontend\public\images\money"

# Alle JPG Dateien durchgehen
for filename in os.listdir(money_dir):
    if filename.endswith('.jpg'):
        # Pfade
        jpg_path = os.path.join(money_dir, filename)
        png_filename = filename.replace('.jpg', '.png')
        png_path = os.path.join(money_dir, png_filename)
        
        print(f"Bearbeite: {filename}")
        
        # Bild öffnen
        img = Image.open(jpg_path)
        
        # Zu RGBA konvertieren (für Transparenz)
        img = img.convert("RGBA")
        
        # Daten des Bildes laden
        datas = img.getdata()
        
        # Neue Liste für die bearbeiteten Pixel
        newData = []
        
        for item in datas:
            # Grautöne erkennen (R, G, B sind ähnlich) und hell (> 200)
            # Anpassen je nach Hintergrundfarbe
            r, g, b, a = item
            
            # Wenn Pixel grau/weiß ist (alle RGB-Werte ähnlich und hell)
            if r > 200 and g > 200 and b > 200 and abs(r-g) < 30 and abs(r-b) < 30 and abs(g-b) < 30:
                # Transparent machen
                newData.append((r, g, b, 0))
            else:
                # Pixel behalten
                newData.append(item)
        
        # Neue Daten setzen
        img.putdata(newData)
        
        # Als PNG speichern
        img.save(png_path, "PNG")
        print(f"  -> Gespeichert als: {png_filename}")
        
        # Optional: JPG löschen
        os.remove(jpg_path)
        print(f"  -> JPG gelöscht")

print("\n✅ Fertig! Alle Bilder wurden konvertiert und der graue Hintergrund entfernt.")
