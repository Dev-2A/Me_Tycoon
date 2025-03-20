from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from quests.models import UserQuest
from rewards.models import UserReward
from .models import DailyActivity

@receiver(post_save, sender=UserQuest)
def update_activity_on_quest_completion(sender, instance, **kwargs):
    if instance.completed and instnace.comletion_date:
        user = instance.user
        date = instance.completion_date.date()
        
        # 해당 날짜의 활동 기록 가져오기 또는 생성
        activity, created = DailyActivity.objects.get_or_create(
            user=user, date=date
        )
        
        # 퀘스트 완료 횟수 증가
        activity.quests_completed += 1
        
        # 획득한 경험치 및 코인 기록
        activity.xp_gained += instance.quest.xp_reward
        activity.coins_gained += instance.quest.coin_reward
        
        activity.save()

@receiver(post_save, sender=UserReward)
def update_activity_on_reward_purchase(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        date = timezone.now().date()
        
        # 해당 날짜의 활동 기록 가져오기 또는 생성
        activity, _ = DailyActivity.objects.get_or_create(
            user=user, date=date
        )
        
        # 보상 구매 횟수 증가
        activity.rewards_purchased += 1
        
        # 사용한 코인 기록
        activity.coins_spent += instance.reward.cost
        
        activity.save()