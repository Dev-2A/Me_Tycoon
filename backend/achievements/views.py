from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Achievement, UserAchievement
from .serializers import AchievementSerializer, UserAchievementSerializer
from django.utils import timezone

class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer

class UserAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # 현재 로그인한 사용자의 업적만 반환
        return UserAchievement.objects.filter(user=self.request.user)

# 새로 획득한 업적 조회 API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def new_achievements(request):
    """최근 획득한 업적을 조회합니다."""
    user = request.user
    
    # 24시간 이내에 획득한 업적 조회
    recent_time = timezone.now() - timezone.timedelta(hours=24)
    
    recent_achievements = UserAchievement.objects.filter(
        user=user,
        achieved_at__gte=recent_time
    ).order_by('-achieved_at')
    
    # 이미 확인한 업적인지 여부를 확인할 필드 추가
    achievements_data = []
    for achievement in recent_achievements:
        data = {
            "id": achievement.id,
            "achievement_id": achievement.achievement.id,
            "name": achievement.achievement.name,
            "description": achievement.achievement.description,
            "category": achievement.achievement.category,
            "icon": achievement.achievement.icon,
            "xp_reward": achievement.achievement.xp_reward,
            "coin_reward": achievement.achievement.coin_reward,
            "achieved_at": achievement.achieved_at
        }
        achievements_data.append(data)
    
    return Response({
        "recent_achievements": achievements_data
    })

# 업적 확인 API (확인 처리)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acknowledge_achievement(request):
    """업적 확인 처리를 합니다."""
    user = request.user
    achievement_id = request.data.get('achievement_id')
    
    if not achievement_id:
        return Response({"error": "Achievement ID is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_achievement = UserAchievement.objects.get(id=achievement_id, user=user)
        # 필요시 확인 필드 업데이트 가능
        
        return Response({"message": "Achievement acknowledged."})
    except UserAchievement.DoesNotExist:
        return Response({"error": "Achievement not found."}, status=status.HTTP_404_NOT_FOUND)