from django.db import IntegrityError
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
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
            # 🚀 반복 퀘스트 초기화 시간에 도달했으면 다시 수행 가능하도록 처리
            if user_quest.is_available_again():
                user_quest.completed = False
                user_quest.completion_date = None # 완료 기록 초기화
            else:
                return Response({"message": "This quest is already completed and cannot be repeated yet!"}, status=status.HTTP_400_BAD_REQUEST)

        user_quest.completed = True
        user_quest.completion_date = timezone.now()
        user_quest.save()

        user.xp += quest.xp_reward
        user.coins += quest.coin_reward
        
        # 🚨 레벨 업 확인
        leveled_up = user.level_up()

        try:
            user.save()
        except Exception as e:
            return Response({"error": f"Failed to update user stats: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 🚀 현재 한국 시간(KST) 기준으로 now 설정
        now_kst = timezone.localtime(timezone.now())

        # 🚀 퀘스트 반복 유형에 따른 다음 수행 가능 시간 계산
        next_available = None
        if quest.repeat_type == "daily":
            next_available = now_kst.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        elif quest.repeat_type == "weekly":
            next_available = now_kst - timedelta(days=now_kst.weekday())  # 이번 주 월요일 00시
            next_available = next_available.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(weeks=1)
        elif quest.repeat_type == "monthly":
            next_available = now_kst.replace(day=1, hour=0, minute=0, second=0, microsecond=0) + timedelta(days=30)
        
        return Response({
            "message": "Quest completed successfully!",
            "xp_reward": quest.xp_reward,
            "coin_reward": quest.coin_reward,
            "total_xp": user.xp,
            "total_coins": user.coins,
            "level": user.level,
            "leveled_up": leveled_up, # 🚀 레벨 업 여부 추가
            "repeat_type": quest.repeat_type,  # 🚀 퀘스트 반복 여부 추가
            "next_available": next_available  # 🚀 KST 기준 다음 수행 가능 시간 추가
        }, status=status.HTTP_200_OK)

    except IntegrityError:
        return Response({"error": "Failed to create UserQuest due to ForeignKey issue"}, status=status.HTTP_400_BAD_REQUEST)

# ✅ 퀘스트 히스토리 반환
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quest_history(request):
    user_quests = UserQuest.objects.filter(user=request.user)
    serializer = UserQuestSerializer(user_quests, many=True)
    return Response(serializer.data)