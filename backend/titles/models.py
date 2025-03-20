from django.db import models
from django.contrib.auth import get_user_model
from achievements.models import Achievement

User = get_user_model()

class Title(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='👑') # 이모지나 아이콘 클래스
    # 칭호를 얻기 위한 업적 (선택 사항)
    required_achievement = models.ForeignKey(Achievement, on_delete=models.SET_NULL,
                                            null=True, blank=True)
    # 칭호를 얻기 위한 레벨 (선택 사항)
    required_level = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return self.name

class UserTitle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='titles')
    title = models.ForeignKey(Title, on_delete=models.CASCADE)
    acquired_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False) # 현재 사용 중인 칭호인지
    
    class Meta:
        unique_together = ('user', 'title')
    
    def __str__(self):
        return f"{self.user.username} - {self.title.name}"
    
    def save(self, *args, **kwargs):
        # 만약 현재 칭호가 활성화되면, 다른 칭호는 비활성화
        if self.is_active:
            UserTitle.objects.filter(user=self.user, is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)