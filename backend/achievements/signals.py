from django.db.models.signals import post_save
from django.dispatch import receiver
from quests.models import UserQuest
from users.models import User
from rewards.models import UserReward
from .models import Achievement, UserAchievement

@receiver(post_save, sender=UserQuest)
def check_quest_achievements(sender, instance, created, **kwargs):
    if not created and instance.completed:
        user = instance.user
        
        # 퀘스트 완료 관련 업적 체크
        completed_quests_count = UserQuest.objects.filter(user=user, completed=True).count()
        
        # 완료한 퀘스트 수에 따른 업적 체크
        for achievement in Achievement.objects.filter(type='quest'):
            if completed_quests_count >= achievement.required_value:
                # 업적이 이미 있는지 확인ㅇ 후 없으면 생성
                UserAchievement.objects.get_or_create(user=user, achievement=achievement)

@receiver(post_save, sender=User)
def check_level_achievements(sender, instance, **kwargs):
    # 레벨 관련 업적 체크
    for achievement in Achievement.objects.filter(category='level'):
        if instance.level >= achievement.required_value:
            # 업적이 이미 있는지 확인 후 없으면 생성
            UserAchievement.objects.get_or_create(user=instance, achievement=achievement)

@receiver(post_save, sender=UserReward)
def check_reward_achievements(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        
        # 보상 획득 관련 업적 체크
        purchased_rewards_count = UserReward.objects.filter(user=user).count()
        
        # 획득한 보상 수에 따른 업적 체크
        for achievement in Achievement.objects.filter(type='reward'):
            if purchased_rewards_count >= achievement.required_value:
                # 업적이 이미 있는지 확인 후 없으면 생성
                UserAchievement.objects.get_or_create(user=user, achievement=achievement)