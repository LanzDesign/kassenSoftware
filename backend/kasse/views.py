from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from .models import Kassenabrechnung, KassenEinstellungen
from .serializers import KassenabrechnungSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login-Endpoint für Token-Authentication"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username und Passwort erforderlich'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username,
            'user_id': user.id
        })
    else:
        return Response({'error': 'Ungültige Anmeldedaten'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout-Endpoint - löscht Token"""
    if request.user.is_authenticated:
        try:
            request.user.auth_token.delete()
        except:
            pass
    return Response({'detail': 'Erfolgreich abgemeldet'})


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token_view(request):
    """Stellt einen CSRF-Token bereit"""
    return Response({'detail': 'CSRF cookie set'})


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check_view(request):
    """Health Check Endpoint für Docker"""
    return Response({'status': 'healthy'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
    permission_classes = [IsAuthenticated]
    
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

    @action(detail=True, methods=['post'])
    def aktualisiere_preise(self, request, pk=None):
        """Aktualisiert die Preise aus den aktuellen Einstellungen"""
        kassenabrechnung = self.get_object()
        einstellungen = KassenEinstellungen.get_einstellungen()
        kassenabrechnung.preis_kinder = einstellungen.preis_position1
        kassenabrechnung.preis_erwachsene = einstellungen.preis_position2
        kassenabrechnung.preis_tee = einstellungen.preis_position3
        kassenabrechnung.save()
        serializer = self.get_serializer(kassenabrechnung)
        return Response(serializer.data)
