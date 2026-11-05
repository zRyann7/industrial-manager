import uuid
from django.db import models
from django.utils import timezone

class BaseModel(models.Model):
    """
    Modelo base abstrato para todas as entidades do sistema.
    Garante chave primária em UUID, trilha de auditoria e Soft Delete.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Timestamps de auditoria
    created_at = models.DateTimeField('criado em', auto_now_add=True)
    updated_at = models.DateTimeField('atualizado em', auto_now=True)
    
    # Campos para Soft Delete
    is_active = models.BooleanField('ativo', default=True)
    deleted_at = models.DateTimeField('excluído em', null=True, blank=True)

    class Meta:
        abstract = True # Isso avisa ao Django para não criar uma tabela no banco para este modelo

    def soft_delete(self):
        """Realiza a exclusão lógica do registro."""
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_active', 'deleted_at'])

    def restore(self):
        """Restaura um registro excluído logicamente."""
        self.is_active = True
        self.deleted_at = None
        self.save(update_fields=['is_active', 'deleted_at'])