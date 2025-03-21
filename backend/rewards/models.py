from django.db import models
from django.contrib.auth import get_user_model
from users.models import User

User = get_user_model()

# Create your models here.
class Reward(models.Model):
    REWARD_TYPES = [
        ('background', '배경화면'),
        ('profile_frame', '프로필 프레임'),
        ('special_icon', '특수 아이콘'),
        ('booster', '부스터'),
        ('other', '기타'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    cost = models.IntegerField(default=0) # 🚀 보상 구매 비용
    # 보상 유형 필드 추가
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES, default='other')
    # 보상 값 필드 추가 (예: 배경화면의 경우 'space', 'ocean', 'jungle' 등)
    reward_value = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.name

# 사용자 보상 구매 기록
class UserReward(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True) # 🚀 구매 시간 저장
    
    def __str__(self):
        return f"{self.user.username} - {self.reward.name}"