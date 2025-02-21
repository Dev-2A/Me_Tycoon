from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, login_view, register_view, get_user_info, user_stats
from quests.views import QuestViewSet, UserQuestViewSet, complete_quest, quest_history
from rewards.views import RewardViewSet, UserRewardViewSet, buy_reward

# ✅ DRF Router 설정
router = DefaultRouter()
router.register(r'users', UserViewSet)  # ✅ ViewSet 등록
router.register(r'quests', QuestViewSet)
router.register(r'user-quests', UserQuestViewSet)
router.register(r'rewards', RewardViewSet)
router.register(r'user-rewards', UserRewardViewSet)

# ✅ urlpatterns 확인
urlpatterns = [
    path("", include(router.urls)),  # ✅ ViewSet 경로 추가
    path("login/", login_view, name="login"),
    path("register/", register_view, name="register"),
    path("users/me/", get_user_info, name="user-info"),  # ✅ 현재 로그인된 사용자 정보 조회
    path("users/stats/", user_stats, name="user-stats"),  # ✅ 사용자 통계 조회
    path("complete-quest/", complete_quest, name="complete-quest"),
    path("quest-history/", quest_history, name="quest-history"),
    path("buy-reward/", buy_reward, name="buy-reward"),
]

# ✅ DEBUGGING: URL 등록 여부 확인
print("✅ urlpatterns 로드 완료:", urlpatterns)