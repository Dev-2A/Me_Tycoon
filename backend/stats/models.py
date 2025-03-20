from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class DailyActivity(models.Model):
    """사용자의 일일 활동을 기록하는 모델"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    quests_completed = models.IntegerField(default=0)
    rewards_purchased = models.IntegerField(default=0)
    xp_gained = models.IntegerField(default=0)
    coins_gained = models.IntegerField(default=0)
    coins_spent = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('user', 'date')
        
    def __str__(self):
        return f"{self.user.username} - {self.date}"