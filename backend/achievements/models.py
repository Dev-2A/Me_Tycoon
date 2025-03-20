from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Achievement(models.Model):
    CATEGORY_CHOICES = [
        ('quest', '퀘스트'),
        ('level', '레벨'),
        ('reward', '보상'),
        ('special', '특별'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    icon = models.CharField(max_length=50, default='🏆') # 이모지나 아이콘 클래스
    xp_reward = models.IntegerField(default=0)
    coin_reward = models.IntegerField(default=0)
    required_value = models.IntegerField(default=1) # 달성에 필요한 수치
    
    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    achieved_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('user', 'achievement')
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"