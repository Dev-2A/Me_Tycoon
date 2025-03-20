from datetime import datetime, timedelta
from django.db.models import Sum, Count, Avg
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from quests.models import UserQuest, Quest
from rewards.models import UserReward, Reward
from achievements.models import UserAchievement
from titles.models import UserTitle
from .models import DailyActivity
from .serializers import DailyActivitySerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_overview(request):
    """사용자의 전체 통계 요약을 제공합니다."""
    user = request.user
    
    # 총 퀘스트 완료 수
    total_quests_completed = UserQuest.objects.filter(
        user=user, completed=True
    ).count()
    
    # 총 퀘스트 완료율
    all_quests = Quest.objects.count()
    completion_rate = 0
    if all_quests > 0:
        completion_rate = (total_quests_completed / all_quests) * 100
    
    # 레벨 및 XP 정보
    level = user.level
    xp = user.xp
    next_level_xp = level * 100 # 다음 레벨에 필요한 XP
    
    # 코인 통계
    coins = user.coins
    total_coins_earned = DailyActivity.objects.filter(
        user=user
    ).aggregate(total=Sum('coins_gained'))['total'] or 0
    
    total_coins_spent = DailyActivity.objects.filter(
        user=user
    ).aggregate(total=Sum('coins_spent'))['total'] or 0
    
    # 업적 통계
    achievements_count = UserAchievement.objects.filter(user=user).count()
    
    # 칭호 통계
    titles_count = UserTitle.objects.filter(user=user).count()
    active_title = UserTitle.objects.filter(user=user, is_active=True).first()
    
    return Response({
        "total_quests_completed": total_quests_completed,
        "quest_completion_rate": round(completion_rate, 2),
        "level": level,
        "xp": xp,
        "xp_to_next_level": next_level_xp - xp,
        "coins": coins,
        "total_coins_earned": total_coins_earned,
        "total_coins_spent": total_coins_spent,
        "titles_count": titles_count,
        "active_title": active_title.title.name if active_title else None,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_history(request):
    """사용자의 일일 활동 기록을 제공합니다."""
    user = request.user
    
    # 안전하게 days 파라미터 처리
    try:
        days_param = request.query_params.get('days', '7')
        # 슬래시 제거 및 숫자만 추출
        days_param = days_param.rstrip('/').split('/')[0]
        days = int(days_param)
    except (ValueError, IndexError):
        days = 7 # 변환 실패 시 기본값
    
    # 특정 기간의 활동 데이터
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    activities = DailyActivity.objects.filter(
        user=user,
        date__range=[start_date, end_date]
    ).order_by('date')
    
    serializer = DailyActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quest_statistics(request):
    """퀘스트 관련 상세 통계를 제공합니다."""
    user = request.user
    
    # 퀘스트 타입별 완료 현황
    repeat_types = Quest.objects.values_list('repeat_type', flat=True).distinct()
    quest_by_type = {}
    
    for repeat_type in repeat_types:
        total = Quest.objects.filter(repeat_type=repeat_type).count()
        completed = UserQuest.objects.filter(
            user=user,
            quest__repeat_type=repeat_type,
            completed=True
        ).count()
        
        completion_rate = 0
        if total > 0:
            completion_rate = (completed / total) * 100
        
        quest_by_type[repeat_type] = {
            "total": total,
            "completed": completed,
            "completion_rate": round(completion_rate, 2)
        }
    
    # 최근 완료한 퀘스트
    recent_quests = UserQuest.objects.filter(
        user=user,
        completed=True
    ).order_by('-completion_date')[:5]
    
    recent_quests_data = [{
        "id": uq.quest.id,
        "title": uq.quest.title,
        "completed_at": uq.completion_date
    } for uq in recent_quests]
    
    return Response({
        "quest_by_type": quest_by_type,
        "recent_completed_quests": recent_quests_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reward_statistics(request):
    """보상 관련 상세 통계를 제공합니다."""
    user = request.user
    
    # 총 구매한 보상 수
    total_rewards_purchased = UserReward.objects.filter(user=user).count()
    
    # 총 지출 코인
    total_spent = UserReward.objects.filter(
        user=user
    ).aggregate(total=Sum('reward__cost'))['total'] or 0
    
    # 가장 최근에 구매한 보상
    recent_rewards = UserReward.objects.filter(
        user=user
    ).order_by('-purchase_date')[:5]
    
    recent_rewards_data = [{
        "id": ur.reward.id,
        "name": ur.reward.name,
        "cost": ur.reward.cost,
        "purchased_at": ur.purchase_date
    } for ur in recent_rewards]
    
    return Response({
        "total_rewards_purchased": total_rewards_purchased,
        "total_coins_spent": total_spent,
        "recent_purchased_rewards": recent_rewards_data,
        "average_reward_cost": round(total_spent / total_rewards_purchased, 2) if total_rewards_purchased > 0 else 0
    })