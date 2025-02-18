from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, login_view, register_view
from quests.views import QuestViewSet, UserQuestViewSet
from rewards.views import RewardViewSet, UserRewardViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'quests', QuestViewSet)
router.register(r'user-quests', UserQuestViewSet)
router.register(r'rewards', RewardViewSet)
router.register(r'user-rewards', UserRewardViewSet)

urlpatterns = [
    path('', include(router.urls)),  # ✅ API 라우터 포함
    path('login/', login_view, name='login'),  # ✅ 로그인 API 추가
    path('register/', register_view, name='register'),  # ✅ 회원가입 API 추가
]
