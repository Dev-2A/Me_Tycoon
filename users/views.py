from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .models import User
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    print("🔍 요청 데이터:", request.data)  # ✅ 요청 데이터 확인

    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data
        
        if user is None:  # 🚨 사용자가 존재하는지 체크
            print("🚨 로그인 실패: 사용자 없음")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 🚨 사용자 인스턴스가 데이터베이스에 존재하는지 확인 후 Token 생성
        if not User.objects.filter(id=user.id).exists():
            print("🚨 사용자 데이터베이스에 없음")
            return Response({"error": "User does not exist in DB"}, status=status.HTTP_400_BAD_REQUEST)
        
        token, _ = Token.objects.get_or_create(user=user)
        login(request, user)
        return Response({"token": token.key, "user": UserSerializer(user).data})
    
    print("🚨 로그인 실패: ", serializer.errors)  # 🚨 실패 이유 출력
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