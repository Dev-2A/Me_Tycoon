from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Title, UserTitle
from .serializers import TitleSerializer, UserTitleSerializer

class TitleViewSet(viewsets.ModelViewSet):
    queryset = Title.objects.all()
    serializer_class = TitleSerializer

class UserTitleViewSet(viewsets.ModelViewSet):
    serializer_class = UserTitleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserTitle.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        """특정 칭호를 활성화합니다."""
        try:
            user_title = self.get_queryset().get(pk=pk)
            user_title.is_active = True
            user_title.save() # save 메서드에서 다른 칭호는 자동으로 비활성화됨
            
            return Response({"message": "칭호가 성공적으로 활성화되었습니다."})
        except UserTitle.DoesNotExist:
            return Response(
                {"error": "해당 칭호를 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_titles(request):
    """사용자읭 모든 칭호를 반환합니다."""
    user_titles = UserTitle.objects.filter(user=request.user)
    serializer = UserTitleSerializer(user_titles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_title(request):
    """사용자의 현재 활성화된 칭호를 반환합니다."""
    try:
        user_title = UserTitle.objects.get(user=request.user, is_active=True)
        serializer = UserTitleSerializer(user_title)
        return Response(serializer.data)
    except UserTitle.DoesNotExist:
        return Response({"message": "활성화된 칭호가 없습니다."})