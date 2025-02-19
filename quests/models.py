from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class Quest(models.Model):
    CATEGORY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('event', 'Event'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    xp_reward = models.IntegerField()
    coin_reward = models.IntegerField()
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    status = models.BooleanField(default=True) # 활성화 여부
    
    def __str__(self):
        return self.title

# 사용자 퀘스트 완료 기록
class UserQuest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.quest.title}"