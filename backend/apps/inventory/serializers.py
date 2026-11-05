from rest_framework import serializers
from .models import UnitOfMeasure, Category, Product, StockBalance, StockMovement

class UnitOfMeasureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasure
        fields = ['id', 'name', 'abbreviation', 'is_active']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    unit_detail = UnitOfMeasureSerializer(source='unit', read_only=True)
    
    product_type_display = serializers.CharField(source='get_product_type_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'product_type', 'product_type_display',
            'category', 'category_detail',
            'unit', 'unit_detail',
            'standard_cost', 'is_active', 'created_at'
        ]

class StockBalanceSerializer(serializers.ModelSerializer):

    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = StockBalance
        fields = [
            'id', 'product', 'product_detail', 'quantity', 'updated_at'
        ]
        read_only_fields = fields

class StockMovementSerializer(serializers.ModelSerializer):

    product_detail = ProductSerializer(source='product', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    
    performed_by_name = serializers.StringRelatedField(source='performed_by', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_detail', 
            'movement_type', 'movement_type_display', 
            'quantity', 'reference_document', 
            'notes', 'performed_by', 'performed_by_name', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'performed_by']