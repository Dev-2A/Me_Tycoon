from django.shortcuts import render
from rest_framework import viewsets, status
from .models import Reward, UserReward
from .serializers import RewardSerializer, UserRewardSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.models import User

# Create your views here.
class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer

class UserRewardViewSet(viewsets.ModelViewSet):
    queryset = UserReward.objects.all()
    serializer_class = UserRewardSerializer

# ✅ 보상 구매 API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_reward(request):
    user = request.user
    reward_id = request.data.get("reward_id")

    try:
        reward = Reward.objects.get(id=reward_id)
    except Reward.DoesNotExist:
        return Response({"error": "Reward not found"}, status=404)

    if user.coins < reward.cost:
        return Response({"error": "Not enough coins"}, status=400)

    # 코인 차감 및 보상 지급
    user.coins -= reward.cost
    user.save()

    user_reward = UserReward.objects.create(user=user, reward=reward)
    serializer = UserRewardSerializer(user_reward)
    return Response(serializer.data)