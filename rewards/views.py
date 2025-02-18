from django.shortcuts import render
from rest_framework import viewsets
from .models import Reward, UserReward
from .serializers import RewardSerializer, UserRewardSerializer

# Create your views here.
class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer

class UserRewardViewSet(viewsets.ModelViewSet):
    queryset = UserReward.objects.all()
    serializer_class = UserRewardSerializer