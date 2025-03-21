from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, login_view, register_view, get_user_info, user_stats
from quests.views import QuestViewSet, UserQuestViewSet, complete_quest, quest_history, get_auto_completed_quests
from rewards.views import RewardViewSet, UserRewardViewSet, buy_reward, reward_history, apply_reward, remove_applied_reward, get_applied_rewards
from achievements.views import AchievementViewSet, UserAchievementViewSet, new_achievements, acknowledge_achievement
from titles.views import TitleViewSet, UserTitleViewSet, my_titles, active_title
from stats.views import stats_overview, activity_history, quest_statistics, reward_statistics

# ✅ DRF Router 설정
router = DefaultRouter()
router.register(r'users', UserViewSet)  # ✅ ViewSet 등록
router.register(r'quests', QuestViewSet)
router.register(r'user-quests', UserQuestViewSet)
router.register(r'rewards', RewardViewSet)
router.register(r'user-rewards', UserRewardViewSet, basename='user-reward')
router.register(r'achievements', AchievementViewSet)
router.register(r'user-achievements', UserAchievementViewSet, basename='user-achievement')
router.register(r'titles', TitleViewSet)
router.register(r'user-titles', UserTitleViewSet, basename='user-title')

# ✅ urlpatterns 확인
urlpatterns = [
    path("", include(router.urls)),  # ✅ ViewSet 경로 추가
    path("login/", login_view, name="login"),
    path("register/", register_view, name="register"),
    path("users/me/", get_user_info, name="user-info"),  # ✅ 현재 로그인된 사용자 정보 조회
    path("users/stats/", user_stats, name="user-stats"),  # ✅ 사용자 통계 조회
    path("complete-quest/", complete_quest, name="complete-quest"),
    path("buy-reward/", buy_reward, name="buy-reward"),
    path("quest-history/", quest_history, name="quest-history"), # ✅ 퀘스트 내역 API
    path("reward-history/", reward_history, name="reward-history"), # ✅ 보상 내역 API
    path("my-achievements/", UserAchievementViewSet.as_view({'get': 'list'}), name="my-achievements"), # 업적
    path("my-titles/", my_titles, name="my-titles"),
    path("active-title/", active_title, name="active-title"), # 칭호
    path("stats/overview/", stats_overview, name="stats-overview"),
    path("stats/activity/", activity_history, name="activity-history"),
    path("stats/quests/", quest_statistics, name="quest-statistics"),
    path("stats/rewards/", reward_statistics, name="reward-statistics"), # 통계
    path("apply-reward/", apply_reward, name="apply-reward"),
    path("remove-applied-reward/", remove_applied_reward, name="remove-applied-reward"),
    path("applied-rewards/", get_applied_rewards, name="applied-rewards"),
    path("auto-completed-quests/", get_auto_completed_quests, name="auto-completed-quests"),
    path("new-achievements/", new_achievements, name="new-achievements"),
    path("acknowledge-achievement/", acknowledge_achievement, name="acknowledge-achievement"),
]

# ✅ DEBUGGING: URL 등록 여부 확인
print("✅ urlpatterns 로드 완료:", urlpatterns)