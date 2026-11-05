from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Adicionados StockBalance e StockMovement
from .models import UnitOfMeasure, Category, Product, StockBalance, StockMovement
from .serializers import (
    UnitOfMeasureSerializer, 
    CategorySerializer, 
    ProductSerializer,
    StockBalanceSerializer,      # Novo
    StockMovementSerializer      # Novo
)

class SoftDeleteModelViewSet(ModelViewSet):
    """
    ViewSet base que sobrescreve o método de exclusão padrão do Django REST
    para utilizar o soft_delete() do nosso BaseModel, protegendo a integridade dos dados.
    """
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.soft_delete() # Chama o método que criamos no BaseModel
        return Response(status=status.HTTP_204_NO_CONTENT)

class UnitOfMeasureViewSet(SoftDeleteModelViewSet):
    # Retorna apenas os registros ativos
    queryset = UnitOfMeasure.objects.filter(is_active=True)
    serializer_class = UnitOfMeasureSerializer
    permission_classes = [IsAuthenticated]

class CategoryViewSet(SoftDeleteModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(SoftDeleteModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

# ==========================================
# NOVOS VIEWSETS DE ESTOQUE
# ==========================================

class StockBalanceViewSet(mixins.ListModelMixin, 
                          mixins.RetrieveModelMixin, 
                          GenericViewSet):
    """
    Saldos de estoque (Somente Leitura - GET).
    A alteração do saldo ocorre exclusivamente via StockMovement (transaction.atomic).
    """
    queryset = StockBalance.objects.filter(is_active=True)
    serializer_class = StockBalanceSerializer
    permission_classes = [IsAuthenticated]

class StockMovementViewSet(mixins.CreateModelMixin, 
                           mixins.ListModelMixin, 
                           mixins.RetrieveModelMixin, 
                           GenericViewSet):
    """
    Movimentações de estoque (Criação - POST e Listagem - GET).
    Histórico imutável: Sem suporte para edição (PUT/PATCH) ou exclusão (DELETE).
    """
    queryset = StockMovement.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Injeta automaticamente o usuário autenticado no momento de salvar
        serializer.save(performed_by=self.request.user)