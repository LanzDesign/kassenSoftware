from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KassenabrechnungViewSet, einstellungen_view, csrf_token_view, login_view, logout_view

router = DefaultRouter()
router.register(r'abrechnungen', KassenabrechnungViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('csrf/', csrf_token_view, name='csrf-token'),
    path('einstellungen/', einstellungen_view, name='einstellungen'),
]
