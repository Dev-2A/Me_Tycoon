from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    coins = models.IntegerField(default=0)
    
    # 현재 적용 중인 배경화면
    background = models.CharField(max_length=100, blank=True, null=True)
    # 현재 적용 중인 프로필 프레임
    profile_frame = models.CharField(max_length=100, blank=True, null=True)
    # 현재 적용 중인 특수 아이콘
    special_icon = models.CharField(max_length=100, blank=True, null=True)
    
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_groups",
        blank=True,
    )
    
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions",
        blank=True,
    )
    
    def level_up(self):
        """사용자의 XP를 확인하여 레벨 업 처리"""
        level_up_xp = self.level * 100  # 🚀 레벨업 기준: 현재 레벨 * 100 XP 필요
        leveled_up = False  # 🚀 레벨업 여부 체크
        
        while self.xp >= level_up_xp:
            self.level += 1
            self.xp -= level_up_xp
            self.coins += 50  # 🚀 레벨업 보상: 50코인 지급
            level_up_xp = self.level * 100
            leveled_up = True
        
        return leveled_up # 🚀 레벨업 여부 반환