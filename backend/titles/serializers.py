from rest_framework import serializers
from .models import Title, UserTitle

class TitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Title
        fields = '__all__'

class UserTitleSerializer(serializers.ModelSerializer):
    title = TitleSerializer(read_only=True)
    
    class Meta:
        model = UserTitle
        fields = ['id', 'user', 'title', 'acquired_at', 'is_active']