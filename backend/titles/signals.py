from django.db.models.signals import post_save
from django.dispatch import receiver
from achievements.models import UserAchievement
from users.models import User
from .models import Title, UserTitle

@receiver(post_save, sender=UserAchievement)
def check_achievement_titles(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        achievement = instance.achievement
        
        # 업적 기반 칭호 부여
        titles = Title.objects.filter(required_achievement=achievement)
        for title in titles:
            UserTitle.objects.get_or_create(user=user, title=title)

@receiver(post_save, sender=User)
def check_level_titles(sender, instance, **kwargs):
    # 레벨 기반 칭호 부여
    for title in Title.objects.filter(required_level__isnull=False):
        if instance.level >= title.required_level:
            UserTitle.objects.get_or_create(user=instance, title=title)