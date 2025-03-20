from rest_framework import serializers
from .models import Reward, UserReward

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = '__all__'

class UserRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReward
        fields = '__all__'