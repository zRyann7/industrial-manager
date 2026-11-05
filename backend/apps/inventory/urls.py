from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UnitOfMeasureViewSet, 
    CategoryViewSet, 
    ProductViewSet,
    StockBalanceViewSet,
    StockMovementViewSet
)

router = DefaultRouter()
router.register(r'units', UnitOfMeasureViewSet, basename='unit')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'balances', StockBalanceViewSet, basename='stockbalance')
router.register(r'movements', StockMovementViewSet, basename='stockmovement')

urlpatterns = [
    path('', include(router.urls)),
]