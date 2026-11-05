from django.db import models
from apps.common.models import BaseModel

class UnitOfMeasure(BaseModel):
    name = models.CharField('name',max_length=50)
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
        RAW_MATERIAL = 'RM', 'Matéria-Prima' # Técidos e linhas
        TRIMIRING = 'TR', 'Aviamento' # Botões, Ziperes, Etiquetas
        FINISHED = 'FG', 'Produto acabado' # Camisa Pronta, Calções
        PACKAGING = 'PK', 'Embalagem' # Caixas, Sacos Plásticos

    name = models.CharField('nome do produto', max_length=255)
    sku = models.CharField('código SKU', max_length=100, unique=True)
    product_type = models.CharField('tipo', max_length=2, choices=ProductType.choices)

    # models.PROTECT impede que um usuário apague uma Categoria ou Unidade se houver produtos usando-as
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    unit = models.ForeignKey(UnitOfMeasure, on_delete=models.PROTECT, related_name='products')

    standard_cost = models.DecimalField('custo padrão', max_digits=10, decimal_places=4, default=0.0)

    def __str__(self):
        return f"[{self.sku}] {self.name}"