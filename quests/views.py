from django.shortcuts import render
from rest_framework import viewsets
from .models import Quest, UserQuest
from .serializers import QuestSerializer, UserQuestSerializer

# Create your views here.
class QuestViewSet(viewsets.ModelViewSet):
    queryset = Quest.objects.all()
    serializer_class = QuestSerializer

class UserQuestViewSet(viewsets.ModelViewSet):
    queryset = UserQuest.objects.all()
    serializer_class = UserQuestSerializer