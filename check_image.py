from PIL import Image
import os

# Pfad zum Ordner mit den Bildern
money_dir = r"frontend\public\images\money"

# Test: Ein Bild überprüfen
test_file = "50euro.png"
test_path = os.path.join(money_dir, test_file)

if os.path.exists(test_path):
    img = Image.open(test_path)
    print(f"Bild: {test_file}")
    print(f"Modus: {img.mode}")
    print(f"Größe: {img.size}")
    
    # Prüfe ob Transparenz vorhanden ist
    if img.mode == 'RGBA':
        # Zähle transparente Pixel
        transparent_count = 0
        total_pixels = img.size[0] * img.size[1]
        
        for pixel in img.getdata():
            if pixel[3] == 0:  # Alpha = 0
                transparent_count += 1
        
        print(f"Transparente Pixel: {transparent_count}/{total_pixels}")
        print(f"Prozentsatz transparent: {(transparent_count/total_pixels)*100:.2f}%")
    else:
        print("WARNUNG: Bild hat keine Transparenz (nicht RGBA)")
else:
    print(f"Datei nicht gefunden: {test_path}")
