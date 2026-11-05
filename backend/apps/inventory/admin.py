from django.contrib import admin
from .models import UnitOfMeasure, Category, Product

@admin.register(UnitOfMeasure)
class UnitOfMeasureAdmin(admin.ModelAdmin):
    list_display = ('name', 'abbreviation', 'is_active', 'created_at')
    search_fields = ('name', 'abbreviation')
    list_filter = ('is_active',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    search_fields = ('name',)
    list_filter = ('is_active',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'product_type', 'category', 'unit', 'standard_cost', 'is_active')
    search_fields = ('sku', 'name')
    list_filter = ('product_type', 'category', 'is_active')
    
    fieldsets = (
        ('Identificação', {
            'fields': ('name', 'sku', 'product_type')
        }),
        ('Classificação e Medida', {
            'fields': ('category', 'unit')
        }),
        ('Custos', {
            'fields': ('standard_cost',)
        }),
        ('Auditoria (Soft Delete)', {
            'fields': ('is_active', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )