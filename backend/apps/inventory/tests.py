from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import CustomUser
from .models import Category, Product, StockBalance, StockMovement, UnitOfMeasure


class StockMovementSmokeTests(TestCase):
    """Teste de fumaça da Fase 1: garante que movimentações podem ser criadas."""

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='tester', email='tester@example.com', password='x-Senha-123'
        )
        unit = UnitOfMeasure.objects.create(name='Metro', abbreviation='m')
        category = Category.objects.create(name='Tecidos')
        self.product = Product.objects.create(
            name='Malha', sku='MAL-001', product_type=Product.ProductType.RAW_MATERIAL,
            category=category, unit=unit,
        )

    def _move(self, movement_type, qty):
        return StockMovement.objects.create(
            product=self.product, movement_type=movement_type,
            quantity=Decimal(qty), performed_by=self.user,
        )

    def test_entrada_cria_movimentacao_e_atualiza_saldo(self):
        self._move(StockMovement.MovementType.IN, '10')
        self.assertEqual(StockBalance.objects.get(product=self.product).quantity, Decimal('10.000'))

    def test_saida_com_saldo_insuficiente_e_rejeitada(self):
        self._move(StockMovement.MovementType.IN, '5')
        with self.assertRaises(ValidationError):
            self._move(StockMovement.MovementType.OUT, '6')
        self.assertEqual(StockBalance.objects.get(product=self.product).quantity, Decimal('5.000'))

    def test_movimentacao_existente_nao_pode_ser_alterada(self):
        mov = self._move(StockMovement.MovementType.IN, '3')
        mov.quantity = Decimal('99')
        with self.assertRaises(ValidationError):
            mov.save()


class ApiAccessSmokeTests(TestCase):
    """Rotas existem no prefixo correto e exigem autenticação."""

    def test_rotas_exigem_login(self):
        client = APIClient()
        for rota in ('units', 'categories', 'products', 'balances', 'movements'):
            resp = client.get(f'/api/v1/inventory/{rota}/')
            self.assertEqual(resp.status_code, 401, rota)

    def test_login_jwt_e_acesso_autenticado(self):
        CustomUser.objects.create_user(username='a', email='a@x.com', password='Senha-123-ok')
        client = APIClient()
        resp = client.post('/api/v1/auth/login/', {'email': 'a@x.com', 'password': 'Senha-123-ok'}, format='json')
        self.assertEqual(resp.status_code, 200)
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + resp.data['access'])
        self.assertEqual(client.get('/api/v1/inventory/products/').status_code, 200)
        self.assertEqual(client.get('/api/v1/auth/me/').status_code, 200)
