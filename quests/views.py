from django.db import IntegrityError
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Quest, UserQuest
from .serializers import QuestSerializer, UserQuestSerializer
from users.models import User  # 🚨 추가

# ✅ QuestViewSet - 퀘스트 목록 조회, 생성, 수정, 삭제 지원
class QuestViewSet(viewsets.ModelViewSet):
    queryset = Quest.objects.all()
    serializer_class = QuestSerializer

# ✅ UserQuestViewSet - 사용자의 퀘스트 진행 내역을 관리
class UserQuestViewSet(viewsets.ModelViewSet):
    queryset = UserQuest.objects.all()
    serializer_class = UserQuestSerializer

# ✅ 퀘스트 완료 API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_quest(request):
    user = request.user
    quest_id = request.data.get('quest_id')

    try:
        quest = Quest.objects.get(id=quest_id)
    except Quest.DoesNotExist:
        return Response({"error": "Quest not found!"}, status=status.HTTP_404_NOT_FOUND)

    if not User.objects.filter(id=user.id).exists():
        return Response({"error": "User not found!"}, status=status.HTTP_400_BAD_REQUEST)

    print(f"✅ User: {user.username}, Quest: {quest.title}")

    try:
        user_quest, created = UserQuest.objects.get_or_create(user=user, quest=quest)

        if not created and user_quest.completed:
            return Response({"message": "This quest is already completed!"}, status=status.HTTP_400_BAD_REQUEST)

        user_quest.completed = True
        user_quest.completion_date = timezone.now()
        user_quest.save()

        user.xp += quest.xp_reward
        user.coins += quest.coin_reward

        try:
            user.save()
        except Exception as e:
            return Response({"error": f"Failed to update user stats: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "message": "Quest completed successfully!",
            "xp_reward": quest.xp_reward,
            "coin_reward": quest.coin_reward,
            "total_xp": user.xp,
            "total_coins": user.coins
        }, status=status.HTTP_200_OK)

    except IntegrityError:
        return Response({"error": "Failed to create UserQuest due to ForeignKey issue"}, status=status.HTTP_400_BAD_REQUEST)
