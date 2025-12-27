from django.db import models
from django.utils import timezone


class Kassenabrechnung(models.Model):
    """Hauptmodell für eine Kassenabrechnung eines Tages"""
    datum = models.DateField(default=timezone.now)
    kassenstand_anfang = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Verkaufte Artikel
    anzahl_kinder = models.IntegerField(default=0)
    anzahl_erwachsene = models.IntegerField(default=0)
    anzahl_tee = models.IntegerField(default=0)
    
    # Preise
    preis_kinder = models.DecimalField(max_digits=5, decimal_places=2, default=3.00)
    preis_erwachsene = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    preis_tee = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    
    # Rückgeld und Spende
    rueckgeldspende = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Bargeld-Zählungen
    anzahl_50euro = models.IntegerField(default=0)
    anzahl_20euro = models.IntegerField(default=0)
    anzahl_10euro = models.IntegerField(default=0)
    anzahl_5euro = models.IntegerField(default=0)
    anzahl_2euro = models.IntegerField(default=0)
    anzahl_1euro = models.IntegerField(default=0)
    anzahl_50cent = models.IntegerField(default=0)
    anzahl_20cent = models.IntegerField(default=0)
    anzahl_10cent = models.IntegerField(default=0)
    
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
        """Berechnet die Tageseinnahmen"""
        return (
            (self.anzahl_kinder * self.preis_kinder) +
            (self.anzahl_erwachsene * self.preis_erwachsene) +
            (self.anzahl_tee * self.preis_tee)
        )
    
    @property
    def kassenstand_soll(self):
        """Berechnet den Kassenstand Soll"""
        return self.kassenstand_anfang + self.tageseinnahmen_gesamt
    
    @property
    def bargeld_gesamt(self):
        """Berechnet das gezählte Bargeld"""
        return (
            (self.anzahl_50euro * 50) +
            (self.anzahl_20euro * 20) +
            (self.anzahl_10euro * 10) +
            (self.anzahl_5euro * 5) +
            (self.anzahl_2euro * 2) +
            (self.anzahl_1euro * 1) +
            (self.anzahl_50cent * 0.50) +
            (self.anzahl_20cent * 0.20) +
            (self.anzahl_10cent * 0.10)
        )
