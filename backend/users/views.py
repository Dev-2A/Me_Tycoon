from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .models import User
from quests.models import UserQuest  # ✅ 퀘스트 데이터 조회 추가
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    print("🔍 요청 데이터:", request.data)

    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data

        if user is None:
            print("🚨 로그인 실패: 사용자 없음")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        login(request, user)
        return Response({"token": token.key, "user": UserSerializer(user).data})

    print("🚨 로그인 실패: ", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ 현재 로그인한 사용자 정보 반환
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    print(f"✅ get_user_info 실행됨! 요청 유저: {request.user}, 인증 상태: {request.user.is_authenticated}")
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

# ✅ 사용자 통계 반환 (경험치, 레벨, 코인, 완료한 퀘스트 수 포함)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    user = request.user
    completed_quests_count = UserQuest.objects.filter(user=user, completed=True).count()  # ✅ 완료된 퀘스트 개수 계산

    stats = {
        "level": user.level,
        "xp": user.xp,
        "coins": user.coins,
        "completed_quests": completed_quests_count,
    }
    return Response(stats)
