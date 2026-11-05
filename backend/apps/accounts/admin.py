from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Campos que aparecerão na listagem do painel
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'registration_number')
    ordering = ('email',)
    
    # Adicionando a matrícula na tela de edição do admin
    fieldsets = UserAdmin.fieldsets + (
        ('Informações da Empresa', {'fields': ('registration_number',)}),
    )