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
        titles = Title.objects.filter(required_achievement=achievement.id)
        for title in titles:
            user_title, created = UserTitle.objects.get_or_create(user=user, title=title)
            
            # 첫 칭호라면 자동으로 활성화
            if created:
                # 현재 활성화된 칭호가 있는지 확인
                has_active = UserTitle.objects.filter(user=user, is_active=True).exists()
                
                # 첫 칭호이거나 퀘스트 추적자 칭호라면 자동 활성화
                if not has_active or title.name == "퀘스트 추적자":
                    user_title.is_active = True
                    user_title.save()

@receiver(post_save, sender=User)
def check_level_titles(sender, instance, **kwargs):
    user = instance
    
    # 레벨 기반 칭호 부여
    for title in Title.objects.filter(required_level__isnull=False):
        if user.level >= title.required_level:
            user_title, created = UserTitle.objects.get_or_create(user=user, title=title)
            
            # 초보자 칭호면서 아직 활성화된 칭호가 없다면 자동 활성화
            if created and title.name == "초보자":
                has_active = UserTitle.objects.filter(user=user, is_active=True).exists()
                if not has_active:
                    user_title.is_active = True
                    user_title.save()