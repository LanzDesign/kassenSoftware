from django.db import models
from django.utils import timezone


class KassenEinstellungen(models.Model):
    """Zentrale Einstellungen für die Kasse - Preise und Bezeichnungen"""
    # Es soll nur einen Eintrag geben
    id = models.AutoField(primary_key=True)
    
    # Bezeichnungen
    bezeichnung_position1 = models.CharField(max_length=50, default="Kinder")
    bezeichnung_position2 = models.CharField(max_length=50, default="Erwachsene")
    bezeichnung_position3 = models.CharField(max_length=50, default="Tee")
    
    # Preise
    preis_position1 = models.DecimalField(max_digits=5, decimal_places=2, default=3.00)
    preis_position2 = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    preis_position3 = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    
    # Kassenstand Anfang
    kassenstand_anfang_default = models.DecimalField(max_digits=10, decimal_places=2, default=50.00, help_text="Standard-Kassenstand zu Beginn")
    
    aktualisiert_am = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kassen-Einstellungen'
        verbose_name_plural = 'Kassen-Einstellungen'
    
    def __str__(self):
        return "Kassen-Einstellungen"
    
    def save(self, *args, **kwargs):
        # Nur ein Eintrag erlaubt
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_einstellungen(cls):
        """Gibt die Einstellungen zurück, erstellt sie falls nicht vorhanden"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class Kassenabrechnung(models.Model):
    """Hauptmodell für eine Kassenabrechnung eines Tages"""
    datum = models.DateField(default=timezone.now)
    kassenstand_anfang = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Verkaufte Artikel (aktueller Verkauf)
    anzahl_kinder = models.IntegerField(default=0)
    anzahl_erwachsene = models.IntegerField(default=0)
    anzahl_tee = models.IntegerField(default=0)
    
    # Tagesgesamtsummen (kumuliert über den ganzen Tag)
    gesamt_kinder = models.IntegerField(default=0)
    gesamt_erwachsene = models.IntegerField(default=0)
    gesamt_tee = models.IntegerField(default=0)
    
    # Preise
    preis_kinder = models.DecimalField(max_digits=5, decimal_places=2, default=3.00)
    preis_erwachsene = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    preis_tee = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    
    # Rückgeld und Spende
    rueckgeldspende = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Bargeld-Zählungen (aktuell)
    anzahl_50euro = models.IntegerField(default=0)
    anzahl_20euro = models.IntegerField(default=0)
    anzahl_10euro = models.IntegerField(default=0)
    anzahl_5euro = models.IntegerField(default=0)
    anzahl_2euro = models.IntegerField(default=0)
    anzahl_1euro = models.IntegerField(default=0)
    anzahl_50cent = models.IntegerField(default=0)
    anzahl_20cent = models.IntegerField(default=0)
    anzahl_10cent = models.IntegerField(default=0)
    
    # Kumuliertes Bargeld über den Tag
    gesamt_bargeld = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Gegeben und Rückgeld für letzten Verkauf
    gegeben = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rueckgeld = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Metadaten
    erstellt_am = models.DateTimeField(auto_now_add=True)
    aktualisiert_am = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-datum']
        verbose_name = 'Kassenabrechnung'
        verbose_name_plural = 'Kassenabrechnungen'
    
    def __str__(self):
        return f"Kassenabrechnung {self.datum}"
    
    @property
    def tageseinnahmen_gesamt(self):
        """Berechnet die Tageseinnahmen aus den Gesamtwerten"""
        return (
            (self.gesamt_kinder * self.preis_kinder) +
            (self.gesamt_erwachsene * self.preis_erwachsene) +
            (self.gesamt_tee * self.preis_tee)
        )
    
    @property
    def kassenstand_soll(self):
        """Berechnet den Kassenstand Soll"""
        return self.kassenstand_anfang + self.tageseinnahmen_gesamt
    
    @property
    def bargeld_gesamt(self):
        """Gibt das kumulierte Bargeld über den Tag zurück"""
        return self.gesamt_bargeld
