from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Reward, UserReward
from .serializers import RewardSerializer, UserRewardSerializer
from users.models import User  # 유저 모델 임포트
from django.utils.timezone import localtime


# ✅ 보상 전체 목록 조회 및 관리용 뷰셋 (관리자용 + 일반 조회 가능)
class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer
    permission_classes = [IsAuthenticated]  # 인증된 사용자만 조회 가능 (원하는 대로 조정 가능)


# ✅ 사용자가 구매한 보상 조회 및 관리용 뷰셋
class UserRewardViewSet(viewsets.ModelViewSet):
    serializer_class = UserRewardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserReward.objects.filter(user=self.request.user)


# ✅ 보상 구매 API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_reward(request):
    user = request.user
    reward_id = request.data.get('reward_id')

    if not reward_id:
        return Response({"error": "Reward ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        reward = Reward.objects.get(id=reward_id)
    except Reward.DoesNotExist:
        return Response({"error": "Reward not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.coins < reward.cost:
        return Response({"error": "Not enough coins to purchase this reward."}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ 보상 구매 처리
    try:
        user_reward = UserReward.objects.create(user=user, reward=reward)
        user.coins -= reward.cost
        user.save()

        # ✅ 디버그 로그 추가
        print(f"✅ {user.username}님이 '{reward.name}' 보상을 구매했습니다. 남은 코인: {user.coins}")

        # ✅ 응답 데이터 구성
        return Response({
            "message": f"Reward '{reward.name}' purchased successfully!",
            "remaining_coins": user.coins,
            "reward": RewardSerializer(reward).data,  # ✅ 보상 정보도 같이 반환
            "user_reward_id": user_reward.id,  # ✅ 생성된 UserReward ID 추가
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"❌ 보상 구매 중 오류 발생: {e}")
        return Response({"error": "Failed to purchase reward due to server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ 보상 구매 이력 조회 API (선택 사항)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reward_history(request):
    user = request.user
    user_rewards = UserReward.objects.filter(user=user).select_related('reward')

    # ✅ 날짜 형식은 YYYY-MM-DD HH:MM 형태로 표시 (로컬 시간 변환)
    reward_data = [
        {
            "reward_name": ur.reward.name,
            "description": ur.reward.description,
            "cost": ur.reward.cost,
            "purchased_at": localtime(ur.purchase_date).strftime('%Y-%m-%d %H:%M')  # 한국 시간으로 변환
        }
        for ur in user_rewards
    ]

    return Response({
        "user_rewards": reward_data  # ✅ 깔끔한 데이터로 반환
    }, status=status.HTTP_200_OK)