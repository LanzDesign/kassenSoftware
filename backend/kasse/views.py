from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from .models import Kassenabrechnung, KassenEinstellungen
from .serializers import KassenabrechnungSerializer


@ensure_csrf_cookie
@api_view(['GET'])
def csrf_token_view(request):
    """Stellt einen CSRF-Token bereit"""
    return Response({'detail': 'CSRF cookie set'})


@api_view(['GET'])
def einstellungen_view(request):
    """Gibt die Kassen-Einstellungen zurück"""
    einstellungen = KassenEinstellungen.get_einstellungen()
    return Response({
        'kassenstand_anfang_default': str(einstellungen.kassenstand_anfang_default),
        'bezeichnung_position1': einstellungen.bezeichnung_position1,
        'bezeichnung_position2': einstellungen.bezeichnung_position2,
        'bezeichnung_position3': einstellungen.bezeichnung_position3,
        'preis_position1': str(einstellungen.preis_position1),
        'preis_position2': str(einstellungen.preis_position2),
        'preis_position3': str(einstellungen.preis_position3),
    })


class KassenabrechnungViewSet(viewsets.ModelViewSet):
    """
    ViewSet für Kassenabrechnungen
    """
    queryset = Kassenabrechnung.objects.all()
    serializer_class = KassenabrechnungSerializer
    
    @action(detail=False, methods=['get'])
    def aktuelle(self, request):
        """Gibt die aktuelle (neueste) Kassenabrechnung zurück"""
        kassenabrechnung = Kassenabrechnung.objects.first()
        if kassenabrechnung:
            serializer = self.get_serializer(kassenabrechnung)
            return Response(serializer.data)
        return Response(
            {'detail': 'Keine Kassenabrechnung gefunden'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['post'])
    def reset(self, request, pk=None):
        """Setzt alle Zähler zurück"""
        kassenabrechnung = self.get_object()
        kassenabrechnung.anzahl_kinder = 0
        kassenabrechnung.anzahl_erwachsene = 0
        kassenabrechnung.anzahl_tee = 0
        kassenabrechnung.anzahl_50euro = 0
        kassenabrechnung.anzahl_20euro = 0
        kassenabrechnung.anzahl_10euro = 0
        kassenabrechnung.anzahl_5euro = 0
        kassenabrechnung.anzahl_2euro = 0
        kassenabrechnung.anzahl_1euro = 0
        kassenabrechnung.anzahl_50cent = 0
        kassenabrechnung.anzahl_20cent = 0
        kassenabrechnung.anzahl_10cent = 0
        kassenabrechnung.gegeben = 0
        kassenabrechnung.rueckgeld = 0
        kassenabrechnung.save()
        serializer = self.get_serializer(kassenabrechnung)
        return Response(serializer.data)
