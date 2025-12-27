from PIL import Image
import os

# Pfad zum Ordner mit den Bildern
money_dir = r"frontend\public\images\money"

def remove_background_aggressive(img):
    """Entfernt grauen/weißen Hintergrund aggressiver"""
    img = img.convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        r, g, b, a = item
        
        # Mehrere Bedingungen für grauen/weißen Hintergrund
        is_gray = abs(r - g) < 40 and abs(r - b) < 40 and abs(g - b) < 40
        is_light = r > 180 or g > 180 or b > 180
        
        # Wenn grau UND hell -> transparent
        if is_gray and is_light:
            newData.append((r, g, b, 0))
        # Sehr helle Pixel (fast weiß) -> transparent
        elif r > 220 and g > 220 and b > 220:
            newData.append((r, g, b, 0))
        else:
            newData.append(item)
    
    img.putdata(newData)
    return img

# Alle PNG Dateien durchgehen
for filename in os.listdir(money_dir):
    if filename.endswith('.png'):
        png_path = os.path.join(money_dir, filename)
        
        print(f"Bearbeite: {filename}")
        
        # Bild öffnen
        img = Image.open(png_path)
        
        # Hintergrund entfernen
        img = remove_background_aggressive(img)
        
        # Überschreiben
        img.save(png_path, "PNG")
        print(f"  ✓ Gespeichert")

print("\n✅ Fertig! Hintergrund wurde aggressiver entfernt.")
