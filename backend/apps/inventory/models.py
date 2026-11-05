from decimal import Decimal
from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.conf import settings
from backend.apps.common.models import BaseModel

class UnitOfMeasure(BaseModel):
    name = models.CharField('nome', max_length=50)
    abbreviation = models.CharField('sigla', max_length=10, unique=True)

    def __str__(self):
        return f'{self.name} ({self.abbreviation})'

class Category(BaseModel):
    name = models.CharField('nome', max_length=100, unique=True)
    description = models.TextField('descrição', blank=True, null=True)

    def __str__(self):
        return self.name

class Product(BaseModel):
    class ProductType(models.TextChoices):
        RAW_MATERIAL = 'RM', 'Matéria-Prima' # Tecidos e linhas
        TRIMIRING = 'TR', 'Aviamento' # Botões, Zíperes, Etiquetas
        FINISHED = 'FG', 'Produto acabado' # Camisa Pronta, Calções
        PACKAGING = 'PK', 'Embalagem' # Caixas, Sacos Plásticos

    name = models.CharField('nome do produto', max_length=255)
    sku = models.CharField('código SKU', max_length=100, unique=True)
    product_type = models.CharField('tipo', max_length=2, choices=ProductType.choices)

    # models.PROTECT impede que um usuário apague uma Categoria ou Unidade se houver produtos usando-as
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', verbose_name='categoria')
    unit = models.ForeignKey(UnitOfMeasure, on_delete=models.PROTECT, related_name='products', verbose_name='unidade de medida')

    standard_cost = models.DecimalField('custo padrão', max_digits=10, decimal_places=4, default=0.0)

    def __str__(self):
        return f"[{self.sku}] {self.name}"

class StockBalance(BaseModel):
    product = models.OneToOneField(
        Product, 
        on_delete=models.PROTECT, 
        related_name='stock_balance',
        verbose_name='produto'
    )
    quantity = models.DecimalField('quantidade atual', max_digits=12, decimal_places=3, default=Decimal('0.000'))

    def __str__(self):
        return f"{self.product.name} - Saldo: {self.quantity}"

class StockMovement(BaseModel):
    class MovementType(models.TextChoices):
        IN = 'IN', 'Entrada (Compra/Produção)'
        OUT = 'OUT', 'Saída (Consumo/Venda)'
        ADJUST_IN = 'ADJI', 'Ajuste de Entrada'
        ADJUST_OUT = 'ADJO', 'Ajuste de Saída'
        LOSS = 'LOSS', 'Perda/Desperdício'

    product = models.ForeignKey(
        Product, 
        on_delete=models.PROTECT, 
        related_name='movements',
        verbose_name='produto'
    )
    movement_type = models.CharField('tipo de movimentação', max_length=4, choices=MovementType.choices)
    quantity = models.DecimalField('quantidade', max_digits=12, decimal_places=3)
    
    reference_document = models.CharField('documento de referência', max_length=100, blank=True, null=True)
    notes = models.TextField('observações', blank=True, null=True)
    
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT,
        related_name='stock_movements',
        verbose_name='realizado por'
    )

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValidationError("Movimentações de estoque são imutáveis e não podem ser alteradas.")
        
        if self.quantity <= 0:
            raise ValidationError("A quantidade da movimentação deve ser maior que zero.")

        with transaction.atomic():
            balance, created = StockBalance.objects.select_for_update().get_or_create(
                product=self.product,
                defaults={'quantity': Decimal('0.000')}
            )

            if self.movement_type in [self.MovementType.IN, self.MovementType.ADJUST_IN]:
                balance.quantity += self.quantity
            elif self.movement_type in [self.MovementType.OUT, self.MovementType.ADJUST_OUT, self.MovementType.LOSS]:
                if balance.quantity < self.quantity:
                    raise ValidationError(f"Saldo insuficiente para o produto {self.product.name}.")
                balance.quantity -= self.quantity

            balance.save()
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Movimentações de estoque não podem ser excluídas, apenas compensadas.")