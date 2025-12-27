from rest_framework import serializers
from .models import Kassenabrechnung


class KassenabrechnungSerializer(serializers.ModelSerializer):
    tageseinnahmen_gesamt = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    kassenstand_soll = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    bargeld_gesamt = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Kassenabrechnung
        fields = '__all__'
        read_only_fields = ['erstellt_am', 'aktualisiert_am']
