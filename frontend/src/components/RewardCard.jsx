import { useState } from 'react';
import { buyReward, applyReward } from '../api/api';
import { motion } from 'framer-motion';

function RewardCard({ reward, userCoins, onPurchase, owned, onApply }) {
    const [loading, setLoading] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const [applying, setApplying] = useState(false);

    const canAfford = userCoins >= reward.cost;

    // 보상 구매 처리
    const handlePurchase = async () => {
        if (loading || !canAfford) return;

        setLoading(true);
        try {
            const result = await buyReward(reward.id);
            setPurchased(true);

            // 1.5초 후 상태 초기화 및 부모 컴포넌트에 알림
            setTimeout(() => {
                setPurchased(false);
                if (onPurchase) onPurchase(result);
            }, 1500);
        } catch (error) {
            console.error("보상 구매 오류:", error);
            alert("보상 구매 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };
    
    // 보상 적용 처리
    const handleApply = async () => {
        if (applying) return;
        
        setApplying(true);
        try {
            await applyReward(reward.id);
            
            // 부모 컴포넌트에 알림
            if (onApply) onApply(reward);
            
            alert(`${reward.name} 보상이 적용되었습니다!`);
        } catch (error) {
            console.error("보상 적용 오류:", error);
            alert("보상 적용 중 오류가 발생했습니다.");
        } finally {
            setApplying(false);
        }
    };

    // 보상 미리보기 이미지 결정
    const getPreviewImage = () => {
        if (reward.reward_type === 'background') {
            return `/assets/backgrounds/${reward.reward_value}.jpg`;
        } else if (reward.reward_type === 'profile_frame') {
            return `/assets/frames/${reward.reward_value}.svg`;
        } else if (reward.reward_type === 'special_icon') {
            return `/assets/icons/${reward.reward_value}.svg`;
        }
        
        // 기본 아이콘
        return null;
    };

    // 가격 범위에 따른 배지 색상 결정
    const getPriceBadgeClass = (cost) => {
        if (cost < 300) return 'badge-primary';
        if (cost < 700) return 'badge-success';
        if (cost < 1200) return 'badge-warning';
        return 'badge-error';
    };
    
    // 보상 유형에 따른 배지 텍스트
    const getRewardTypeText = (type) => {
        switch(type) {
            case 'background': return '배경화면';
            case 'profile_frame': return '프로필 프레임';
            case 'special_icon': return '특수 아이콘';
            case 'booster': return '부스터';
            default: return '기타';
        }
    };

    return (
        <motion.div
            className={`game-card reward-card ${reward.cost >= 1000 ? 'epic' : (reward.cost >= 500 ? 'rare' : '')}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
        >
            <div className='reward-header'>
                <h3>{reward.name}</h3>
                <div className="reward-badges">
                    <span className={`badge ${getPriceBadgeClass(reward.cost)}`}>
                        💰 {reward.cost} 코인
                    </span>
                    <span className="badge badge-primary">
                        {getRewardTypeText(reward.reward_type)}
                    </span>
                </div>
            </div>
            
            {getPreviewImage() && (
                <div className="reward-preview">
                    <img 
                        src={getPreviewImage()} 
                        alt={reward.name} 
                        className="reward-preview-image"
                    />
                </div>
            )}

            <p className='reward-description'>{reward.description}</p>

            {owned ? (
                <button
                    className={`btn ${applying ? 'btn-disabled' : 'btn-secondary'}`}
                    onClick={handleApply}
                    disabled={applying}
                >
                    {applying ? '적용 중...' : '보상 적용하기'}
                </button>
            ) : (
                <button
                    className={`btn ${
                        loading ? 'btn-disabled' :
                        purchased ? 'btn-success' :
                        canAfford ? 'btn-primary' : 'btn-disabled'
                    }`}
                    onClick={handlePurchase}
                    disabled={loading || !canAfford || purchased}
                >
                    {loading ? '처리 중...' :
                    purchased ? '구매 완료!' :
                    canAfford ? '구매하기' : '코인 부족'}
                </button>
            )}

            {!canAfford && !owned && (
                <div className='coin-missing'>
                    {reward.cost - userCoins} 코인 더 필요
                </div>
            )}
        </motion.div>
    );
}

export default RewardCard;