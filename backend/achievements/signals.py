from django.db.models.signals import post_save
from django.dispatch import receiver
from quests.models import UserQuest
from users.models import User
from rewards.models import UserReward
from .models import Achievement, UserAchievement
from django.db.models import Count
from django.utils import timezone

@receiver(post_save, sender=UserQuest)
def check_quest_achievements(sender, instance, created, **kwargs):
    if not created and instance.completed:
        user = instance.user
        
        # 첫 퀘스트 업적 확인
        first_quest_achievement = Achievement.objects.filter(name="첫 퀘스트").first()
        if first_quest_achievement:
            # 사용자의 완료된 퀘스트 수 확인
            completed_quests = UserQuest.objects.filter(user=user, completed=True).count()
            if completed_quests >= 1:
                UserAchievement.objects.get_or_create(user=user, achievement=first_quest_achievement)
        
        # 퀘스트 마스터 10 업적 확인
        quest_master_10 = Achievement.objects.filter(name="퀘스트 마스터 10").first()
        if quest_master_10:
            completed_quests = UserQuest.objects.filter(user=user, completed=True).count()
            if completed_quests >= 10:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=quest_master_10)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += quest_master_10.xp_reward
                    user.coins += quest_master_10.coin_reward
                    user.level_up()
                    user.save()
        
        # 퀘스트 마스터 50 업적 확인
        quest_master_50 = Achievement.objects.filter(name="퀘스트 마스터 50").first()
        if quest_master_50:
            completed_quests = UserQuest.objects.filter(user=user, completed=True).count()
            if completed_quests >= 50:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=quest_master_50)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += quest_master_50.xp_reward
                    user.coins += quest_master_50.coin_reward
                    user.level_up()
                    user.save()
        
        # 퀘스트 마스터 100 업적 확인
        quest_master_100 = Achievement.objects.filter(name="퀘스트 마스터 100").first()
        if quest_master_100:
            completed_quests = UserQuest.objects.filter(user=user, completed=True).count()
            if completed_quests >= 100:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=quest_master_100)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += quest_master_100.xp_reward
                    user.coins += quest_master_100.coin_reward
                    user.level_up()
                    user.save()
        
        # 완벽주의자 업적 확인 (모든 퀘스트 유형 완료)
        perfectionist = Achievement.objects.filter(name="완벽주의자").first()
        if perfectionist:
            # 반복 유형별 완료 여부 확인
            none_type_completed = UserQuest.objects.filter(user=user, quest__repeat_type='none', completed=True).exists()
            daily_type_completed = UserQuest.objects.filter(user=user, quest__repeat_type='daily', completed=True).exists()
            weekly_type_completed = UserQuest.objects.filter(user=user, quest__repeat_type='weekly', completed=True).exists()
            monthly_type_completed = UserQuest.objects.filter(user=user, quest__repeat_type='monthly', completed=True).exists()
            
            if none_type_completed and daily_type_completed and weekly_type_completed and monthly_type_completed:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=perfectionist)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += perfectionist.xp_reward
                    user.coins += perfectionist.coin_reward
                    user.level_up()
                    user.save()
        
        # 일일 퀘스트 마스터 업적 확인
        daily_master = Achievement.objects.filter(name="일일 퀘스트 완성자").first()
        if daily_master and instance.quest.repeat_type == 'daily':
            # 오늘 완료한 일일 퀘스트 수
            today = timezone.now().date()
            completed_daily_quests = UserQuest.objects.filter(
                user=user, 
                quest__repeat_type='daily', 
                completed=True,
                completion_date__date=today
            ).count()
            
            # 전체 일일 퀘스트 수
            total_daily_quests = UserQuest.objects.filter(
                quest__repeat_type='daily'
            ).values('quest').distinct().count()
            
            if completed_daily_quests >= total_daily_quests:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=daily_master)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += daily_master.xp_reward
                    user.coins += daily_master.coin_reward
                    user.level_up()
                    user.save()
        
        # 주간 퀘스트 마스터 업적 확인
        weekly_master = Achievement.objects.filter(name="주간 퀘스트 완성자").first()
        if weekly_master and instance.quest.repeat_type == 'weekly':
            # 이번 주에 완료한 주간 퀘스트 수
            today = timezone.now().date()
            start_of_week = today - timezone.timedelta(days=today.weekday())
            completed_weekly_quests = UserQuest.objects.filter(
                user=user, 
                quest__repeat_type='weekly', 
                completed=True,
                completion_date__date__gte=start_of_week
            ).count()
            
            # 전체 주간 퀘스트 수
            total_weekly_quests = UserQuest.objects.filter(
                quest__repeat_type='weekly'
            ).values('quest').distinct().count()
            
            if completed_weekly_quests >= total_weekly_quests:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=weekly_master)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += weekly_master.xp_reward
                    user.coins += weekly_master.coin_reward
                    user.level_up()
                    user.save()
        
        # 월간 퀘스트 마스터 업적 확인
        monthly_master = Achievement.objects.filter(name="월간 퀘스트 완성자").first()
        if monthly_master and instance.quest.repeat_type == 'monthly':
            # 이번 달에 완료한 월간 퀘스트 수
            today = timezone.now().date()
            start_of_month = today.replace(day=1)
            completed_monthly_quests = UserQuest.objects.filter(
                user=user, 
                quest__repeat_type='monthly', 
                completed=True,
                completion_date__date__gte=start_of_month
            ).count()
            
            # 전체 월간 퀘스트 수
            total_monthly_quests = UserQuest.objects.filter(
                quest__repeat_type='monthly'
            ).values('quest').distinct().count()
            
            if completed_monthly_quests >= total_monthly_quests:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=monthly_master)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += monthly_master.xp_reward
                    user.coins += monthly_master.coin_reward
                    user.level_up()
                    user.save()

@receiver(post_save, sender=User)
def check_level_achievements(sender, instance, **kwargs):
    user = instance
    
    # 초보 모험가 (레벨 5)
    if user.level >= 5:
        beginner_achievement = Achievement.objects.filter(name="초보 모험가").first()
        if beginner_achievement:
            user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=beginner_achievement)
            
            # 업적 보상 지급 (새로 획득했을 때만)
            if created:
                user.xp += beginner_achievement.xp_reward
                user.coins += beginner_achievement.coin_reward
                # 레벨 업 체크는 현재 save 이벤트에서 처리 중이므로 추가 체크 불필요
    
    # 성장하는 영웅 (레벨 10)
    if user.level >= 10:
        hero_achievement = Achievement.objects.filter(name="성장하는 영웅").first()
        if hero_achievement:
            user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=hero_achievement)
            
            # 업적 보상 지급 (새로 획득했을 때만)
            if created:
                user.xp += hero_achievement.xp_reward
                user.coins += hero_achievement.coin_reward
                # 레벨 업 체크는 현재 save 이벤트에서 처리 중이므로 추가 체크 불필요

    # 전설적인 영웅 (레벨 20)
    if user.level >= 20:
        legendary_achievement = Achievement.objects.filter(name="전설적인 영웅").first()
        if legendary_achievement:
            user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=legendary_achievement)
            
            # 업적 보상 지급 (새로 획득했을 때만)
            if created:
                user.xp += legendary_achievement.xp_reward
                user.coins += legendary_achievement.coin_reward
                # 레벨 업 체크는 현재 save 이벤트에서 처리 중이므로 추가 체크 불필요

@receiver(post_save, sender=UserReward)
def check_reward_achievements(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        
        # 첫 보상 업적 확인
        first_reward = Achievement.objects.filter(name="첫 보상").first()
        if first_reward:
            user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=first_reward)
            
            # 업적 보상 지급 (새로 획득했을 때만)
            if created:
                user.xp += first_reward.xp_reward
                user.coins += first_reward.coin_reward
                user.level_up()
                user.save()
        
        # 수집가 업적 확인 (5개)
        collector_achievement = Achievement.objects.filter(name="수집가").first()
        if collector_achievement:
            reward_count = UserReward.objects.filter(user=user).count()
            if reward_count >= 5:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=collector_achievement)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += collector_achievement.xp_reward
                    user.coins += collector_achievement.coin_reward
                    user.level_up()
                    user.save()
        
        # 컬렉터 업적 확인 (10개)
        collector_10_achievement = Achievement.objects.filter(name="컬렉터").first()
        if collector_10_achievement:
            reward_count = UserReward.objects.filter(user=user).count()
            if reward_count >= 10:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=collector_10_achievement)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += collector_10_achievement.xp_reward
                    user.coins += collector_10_achievement.coin_reward
                    user.level_up()
                    user.save()
        
        # 다이아몬드 컬렉터 업적 확인 (20개)
        diamond_collector_achievement = Achievement.objects.filter(name="다이아몬드 컬렉터").first()
        if diamond_collector_achievement:
            reward_count = UserReward.objects.filter(user=user).count()
            if reward_count >= 20:
                user_achievement, created = UserAchievement.objects.get_or_create(user=user, achievement=diamond_collector_achievement)
                
                # 업적 보상 지급 (새로 획득했을 때만)
                if created:
                    user.xp += diamond_collector_achievement.xp_reward
                    user.coins += diamond_collector_achievement.coin_reward
                    user.level_up()
                    user.save()