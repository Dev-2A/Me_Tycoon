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
from users.models import User

# 퀘스트 컨텍스트 처리 유틸리티 함수 추가
def check_auto_complete_quests(user):
    """자동으로 완료 가능한 퀘스트를 확인하고 처리합니다."""
    auto_completed = []
    
    # 첫 걸음 퀘스트 (처음 로그인 시 자동 완료)
    first_step_quest = Quest.objects.filter(title="첫 걸음").first()
    if first_step_quest:
        user_quest, created = UserQuest.objects.get_or_create(user=user, quest=first_step_quest)
        if created or not user_quest.completed:
            user_quest.completed = True
            user_quest.completion_date = timezone.now()
            user_quest.save()
            
            # 사용자에게 보상 지급
            user.xp += first_step_quest.xp_reward
            user.coins += first_step_quest.coin_reward
            user.level_up()  # 레벨업 체크
            user.save()
            
            auto_completed.append({
                "quest_id": first_step_quest.id,
                "title": first_step_quest.title,
                "xp_reward": first_step_quest.xp_reward,
                "coin_reward": first_step_quest.coin_reward
            })
    
    # 일일 출석 퀘스트 (하루에 한 번 자동 완료)
    daily_attendance_quest = Quest.objects.filter(title="일일 출석").first()
    if daily_attendance_quest:
        user_quest, created = UserQuest.objects.get_or_create(user=user, quest=daily_attendance_quest)
        
        # 오늘 이미 완료했는지 확인
        today = timezone.now().date()
        if created or not user_quest.completed or (user_quest.completion_date and user_quest.completion_date.date() < today):
            user_quest.completed = True
            user_quest.completion_date = timezone.now()
            user_quest.save()
            
            # 사용자에게 보상 지급
            user.xp += daily_attendance_quest.xp_reward
            user.coins += daily_attendance_quest.coin_reward
            user.level_up()  # 레벨업 체크
            user.save()
            
            auto_completed.append({
                "quest_id": daily_attendance_quest.id,
                "title": daily_attendance_quest.title,
                "xp_reward": daily_attendance_quest.xp_reward,
                "coin_reward": daily_attendance_quest.coin_reward
            })
    
    # 연속 접속 퀘스트 처리 (위에서 일일 출석을 했다면)
    if auto_completed and any(q["title"] == "일일 출석" for q in auto_completed):
        # 연속 3일 접속 퀘스트
        consecutive_3days_quest = Quest.objects.filter(title="연속 3일 접속").first()
        if consecutive_3days_quest:
            # 최근 3일간의 일일 출석 퀘스트 완료 기록 확인
            if daily_attendance_quest:
                recent_completions = UserQuest.objects.filter(
                    user=user,
                    quest=daily_attendance_quest,
                    completed=True,
                    completion_date__gte=timezone.now() - timedelta(days=3)
                ).order_by('-completion_date')
                
                if recent_completions.count() >= 3:
                    user_quest, created = UserQuest.objects.get_or_create(user=user, quest=consecutive_3days_quest)
                    if created or not user_quest.completed:
                        user_quest.completed = True
                        user_quest.completion_date = timezone.now()
                        user_quest.save()
                        
                        # 사용자에게 보상 지급
                        user.xp += consecutive_3days_quest.xp_reward
                        user.coins += consecutive_3days_quest.coin_reward
                        user.level_up()  # 레벨업 체크
                        user.save()
                        
                        auto_completed.append({
                            "quest_id": consecutive_3days_quest.id,
                            "title": consecutive_3days_quest.title,
                            "xp_reward": consecutive_3days_quest.xp_reward,
                            "coin_reward": consecutive_3days_quest.coin_reward
                        })
        
        # 연속 7일 접속 퀘스트
        consecutive_7days_quest = Quest.objects.filter(title="연속 7일 접속").first()
        if consecutive_7days_quest:
            # 최근 7일간의 일일 출석 퀘스트 완료 기록 확인
            if daily_attendance_quest:
                recent_completions = UserQuest.objects.filter(
                    user=user,
                    quest=daily_attendance_quest,
                    completed=True,
                    completion_date__gte=timezone.now() - timedelta(days=7)
                ).order_by('-completion_date')
                
                if recent_completions.count() >= 7:
                    user_quest, created = UserQuest.objects.get_or_create(user=user, quest=consecutive_7days_quest)
                    if created or not user_quest.completed:
                        user_quest.completed = True
                        user_quest.completion_date = timezone.now()
                        user_quest.save()
                        
                        # 사용자에게 보상 지급
                        user.xp += consecutive_7days_quest.xp_reward
                        user.coins += consecutive_7days_quest.coin_reward
                        user.level_up()  # 레벨업 체크
                        user.save()
                        
                        auto_completed.append({
                            "quest_id": consecutive_7days_quest.id,
                            "title": consecutive_7days_quest.title,
                            "xp_reward": consecutive_7days_quest.xp_reward,
                            "coin_reward": consecutive_7days_quest.coin_reward
                        })
    
    return auto_completed

# 자동 완료된 퀘스트 반환 API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_auto_completed_quests(request):
    """사용자가 로그인할 때 자동으로 완료되는 퀘스트 정보를 반환합니다."""
    user = request.user
    auto_completed = check_auto_complete_quests(user)
    
    return Response({
        "auto_completed": auto_completed
    })

# 기존 퀘스트 완료 API 업데이트
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
            # 반복 퀘스트 초기화 시간에 도달했으면 다시 수행 가능하도록 처리
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
        
        # 레벨 업 확인
        leveled_up = user.level_up()

        try:
            user.save()
        except Exception as e:
            return Response({"error": f"Failed to update user stats: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 현재 한국 시간(KST) 기준으로 now 설정
        now_kst = timezone.localtime(timezone.now())

        # 퀘스트 반복 유형에 따른 다음 수행 가능 시간 계산
        next_available = None
        if quest.repeat_type == "daily":
            next_available = now_kst.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        elif quest.repeat_type == "weekly":
            next_available = now_kst - timedelta(days=now_kst.weekday())  # 이번 주 월요일 00시
            next_available = next_available.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(weeks=1)
        elif quest.repeat_type == "monthly":
            next_available = now_kst.replace(day=1, hour=0, minute=0, second=0, microsecond=0) + timedelta(days=30)
        
        # 추가 자동 완료 퀘스트가 있는지 확인
        auto_completed = []
        
        # 일일 미션 3개 완료 퀘스트
        daily_missions_quest = Quest.objects.filter(title="일일 미션 3개 완료").first()
        if daily_missions_quest:
            daily_completed_count = UserQuest.objects.filter(
                user=user,
                quest__repeat_type="daily",
                completed=True,
                completion_date__date=now_kst.date()
            ).count()
            
            if daily_completed_count >= 3:
                daily_mission_user_quest, created = UserQuest.objects.get_or_create(user=user, quest=daily_missions_quest)
                
                if created or not daily_mission_user_quest.completed or daily_mission_user_quest.is_available_again():
                    daily_mission_user_quest.completed = True
                    daily_mission_user_quest.completion_date = now_kst
                    daily_mission_user_quest.save()
                    
                    # 보상 지급
                    user.xp += daily_missions_quest.xp_reward
                    user.coins += daily_missions_quest.coin_reward
                    user.save()
                    
                    auto_completed.append({
                        "quest_id": daily_missions_quest.id,
                        "title": daily_missions_quest.title,
                        "xp_reward": daily_missions_quest.xp_reward,
                        "coin_reward": daily_missions_quest.coin_reward
                    })
        
        return Response({
            "message": "Quest completed successfully!",
            "xp_reward": quest.xp_reward,
            "coin_reward": quest.coin_reward,
            "total_xp": user.xp,
            "total_coins": user.coins,
            "level": user.level,
            "leveled_up": leveled_up, # 레벨 업 여부
            "repeat_type": quest.repeat_type,  # 퀘스트 반복 여부
            "next_available": next_available,  # 다음 수행 가능 시간
            "auto_completed": auto_completed  # 자동 완료된 퀘스트 목록
        }, status=status.HTTP_200_OK)

    except IntegrityError:
        return Response({"error": "Failed to create UserQuest due to ForeignKey issue"}, status=status.HTTP_400_BAD_REQUEST)