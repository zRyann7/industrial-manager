from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

class UserMeView(RetrieveAPIView):
    """
    Retorna os dados do usuário autenticado atual.
    """
    serializer_class = UserSerializer
    # Garante que só quem enviou um Token válido pode acessar esta rota
    permission_classes = [IsAuthenticated] 

    def get_object(self):
        
        return self.request.user