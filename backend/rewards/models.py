from django.db import models
from django.contrib.auth import get_user_model
from users.models import User

User = get_user_model()

# Create your models here.
class Reward(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    cost = models.IntegerField(default=0) # 🚀 보상 구매 비용
    
    def __str__(self):
        return self.name

# 사용자 보상 구매 기록
class UserReward(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True) # 🚀 구매 시간 저장
    
    def __str__(self):
        return f"{self.user.username} - {self.reward.name}"