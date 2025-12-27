from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KassenabrechnungViewSet

router = DefaultRouter()
router.register(r'abrechnungen', KassenabrechnungViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
