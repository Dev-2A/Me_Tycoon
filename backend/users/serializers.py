from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'level', 'xp', 'coins']

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