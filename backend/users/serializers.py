from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User
from quests.serializers import QuestSerializer
from quests.models import UserQuest, Quest

class UserSerializer(serializers.ModelSerializer):
    quests = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'level', 'xp', 'coins', "quests"]
    
    def get_quests(self, obj):
        user_quests = UserQuest.objects.filter(user=obj)
        
        if not user_quests.exists():
            return []  # ✅ 퀘스트가 없을 경우 빈 배열 반환
        
        return QuestSerializer([uq.quest for uq in user_quests], many=True).data

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        print(f"🔍 입력된 username: {data['username']}, password: {'*' * len(data['password'])}")  # ✅ 비밀번호 숨김 처리
        
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            print(f"✅ 로그인 성공: {user}")
            return user
        
        print("🚨 로그인 실패: Invalid credentials")
        raise serializers.ValidationError("Incorrect Credentials")

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)