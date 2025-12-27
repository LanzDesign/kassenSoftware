from django.contrib import admin
from .models import Kassenabrechnung, KassenEinstellungen


@admin.register(KassenEinstellungen)
class KassenEinstellungenAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Kassenstand', {
            'fields': ('kassenstand_anfang_default',)
        }),
        ('Position 1', {
            'fields': (('bezeichnung_position1', 'preis_position1'),)
        }),
        ('Position 2', {
            'fields': (('bezeichnung_position2', 'preis_position2'),)
        }),
        ('Position 3', {
            'fields': (('bezeichnung_position3', 'preis_position3'),)
        }),
        ('Metadaten', {
            'fields': ('aktualisiert_am',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['aktualisiert_am']
    
    def has_add_permission(self, request):
        # Nur ein Eintrag erlaubt
        return not KassenEinstellungen.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Nicht löschbar
        return False


@admin.register(Kassenabrechnung)
class KassenabrechnungAdmin(admin.ModelAdmin):
    list_display = ['datum', 'tageseinnahmen_gesamt', 'kassenstand_soll', 'bargeld_gesamt']
    list_filter = ['datum']
    search_fields = ['datum']
    readonly_fields = ['erstellt_am', 'aktualisiert_am', 'tageseinnahmen_gesamt', 'kassenstand_soll', 'bargeld_gesamt']
    
    fieldsets = (
        ('Datum', {
            'fields': ('datum',)
        }),
        ('Kassenstand', {
            'fields': ('kassenstand_anfang',)
        }),
        ('Verkäufe', {
            'fields': (
                ('anzahl_kinder', 'preis_kinder'),
                ('anzahl_erwachsene', 'preis_erwachsene'),
                ('anzahl_tee', 'preis_tee'),
            )
        }),
        ('Bargeld-Zählung', {
            'fields': (
                ('anzahl_50euro', 'anzahl_20euro', 'anzahl_10euro', 'anzahl_5euro'),
                ('anzahl_2euro', 'anzahl_1euro'),
                ('anzahl_50cent', 'anzahl_20cent', 'anzahl_10cent'),
            )
        }),
        ('Letzte Transaktion', {
            'fields': ('gegeben', 'rueckgeld')
        }),
        ('Rückgeldspende', {
            'fields': ('rueckgeldspende',)
        }),
        ('Berechnete Werte', {
            'fields': ('tageseinnahmen_gesamt', 'kassenstand_soll', 'bargeld_gesamt')
        }),
        ('Metadaten', {
            'fields': ('erstellt_am', 'aktualisiert_am'),
            'classes': ('collapse',)
        }),
    )
