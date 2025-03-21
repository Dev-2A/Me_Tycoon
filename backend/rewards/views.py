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

# 보상 적용 API 추가
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_reward(request):
    """사용자가 가진 보상을 프로필에 적용합니다."""
    user = request.user
    reward_id = request.data.get('reward_id')
    
    try:
        # 사용자가 해당 보상을 보유하고 있는지 확인
        user_reward = UserReward.objects.filter(user=user, reward_id=reward_id)
        reward = user_reward.reward
        
        # 보상 유형에 따라 사용자 모델 업데이트
        if reward.reward_type == 'background':
            user.background = reward.reward_value
        elif reward.reward_type == 'profile_frame':
            user.profile_frame = reward.reward_value
        elif reward.reward_type == 'special_icon':
            user.special_icon = reward.reward_value
        elif reward.reward_type == 'booster':
            # 부스터는 일시적인 효과이므로 별도 처리 필요
            # 여기서는 간단하게 응답만 반환
            return Response({
                "message": f"{reward.name} 부스터가 적용되었습니다!",
                "duration": "24시간",
                "effect": reward.reward_value
            })
            
        user.save()
        
        return Response({
            "message": f"{reward.name}이(가) 프로필에 적용되었습니다!",
            "reward_type": reward.reward_type,
            "reward_value": reward.reward_value
        })
        
    except UserReward.DoesNotExist:
        return Response({"error": "해당 보상을 보유하고 있지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"보상 적용 중 오류가 발생했습니다: {str(e)}"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 보상 적용 해제 API 추가
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_applied_reward(request):
    """프로필에 적용된 보상을 해제합니다."""
    user = request.user
    reward_type = request.data.get('reward_type')
    
    if not reward_type:
        return Response({"error": "보상 유형이 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 보상 유형에 따라 필드 초기화
        if reward_type == 'background':
            user.background = None
        elif reward_type == 'profile_frame':
            user.profile_frame = None
        elif reward_type == 'special_icon':
            user.special_icon = None
        
        user.save()
        
        return Response({
            "message": f"{reward_type} 보상이 해제되었습니다."
        })
        
    except Exception as e:
        return Response({"error": f"보상 해제 중 오류가 발생했습니다: {str(e)}"}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 현재 적용 중인 보상 조회 API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_applied_rewards(request):
    """현재 사용자가 적용 중인 보상 정보를 반환합니다."""
    user = request.user
    
    applied_rewards = {}
    
    if user.background:
        try:
            reward = Reward.objects.filter(reward_type='background', reward_value=user.background).first()
            if reward:
                applied_rewards['background'] = {
                    'id': reward.id,
                    'name': reward.name,
                    'value': user.background
                }
        except Exception:
            pass
    
    if user.profile_frame:
        try:
            reward = Reward.objects.filter(reward_type='profile_frame', reward_value=user.profile_frame).first()
            if reward:
                applied_rewards['profile_frame'] = {
                    'id': reward.id,
                    'name': reward.name,
                    'value': user.profile_frame
                }
        except Exception:
            pass
    
    if user.special_icon:
        try:
            reward = Reward.objects.filter(reward_type='special_icon', reward_value=user.special_icon).first()
            if reward:
                applied_rewards['special_icon'] = {
                    'id': reward.id,
                    'name': reward.name,
                    'value': user.special_icon
                }
        except Exception:
            pass
    
    return Response(applied_rewards)