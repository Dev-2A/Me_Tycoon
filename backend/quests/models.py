from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, datetime

User = get_user_model()

# Create your models here.
class Quest(models.Model):
    REPEAT_CHOICES = [
        ('none', '반복없음'),
        ('daily', '매일 반복'),
        ('weekly', '매주 반복'),
        ('monthly', '매월 반복'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    xp_reward = models.IntegerField()
    coin_reward = models.IntegerField()
    repeat_type = models.CharField(max_length=10, choices=REPEAT_CHOICES, default='none')
    
    def __str__(self):
        return self.title

# 사용자 퀘스트 완료 기록
class UserQuest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    
    def is_available_again(self):
        """🚀 퀘스트가 반복될 경우 일정 시간이 지나면 다시 수행 가능"""
        if not self.completed:
            return True # 아직 완료하지 않은 퀘스트는 수행 가능
        
        # 🚨 현재 시간을 한국 시간(KST)으로 변환
        now_kst = timezone.localtime(timezone.now())
        
        # 🚨 퀘스트 반복 조건 적용
        if self.quest.repeat_type == 'none':
            return False # 반복 없는 퀘스트는 다시 수행 불가
        elif self.quest.repeat_type == 'daily':
            reset_time = now_kst.replace(hour=0, minute=0, second=0, microsecond=0) # 오늘 자정
            return now_kst >= reset_time
        elif self.quest.repeat_type == 'weekly':
            reset_time = now_kst - timedelta(days=now_kst.weekday()) # 이번 주 월요일
            reset_time = reset_time.replace(hour=0, minute=0, second=0, microsecond=0)
            return now_kst >= reset_time
        elif self.quest.repeat_type == 'monthly':
            reset_time = now_kst.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return now_kst >= reset_time

        return False