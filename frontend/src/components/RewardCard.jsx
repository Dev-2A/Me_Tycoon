import { useState } from 'react';
import { buyReward } from '../api/api';
import { motion } from 'framer-motion';

function RewardCard({ reward, userCoins, onPurchase }) {
    const [loading, setLoading] = useState(false);
    const [purchased, setPurchased] = useState(false);

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

    // 가격 범위에 따른 배지 색상 결정
    const getPriceBadgeClass = (cost) => {
        if (cost < 300) return 'badge-primary';
        if (cost < 700) return 'badge-success';
        if (cost < 1200) return 'badge-warning';
        return 'badge-error';
    };

    return (
        <motion.div
            className='game-card reward-card'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
        >
            <div className='reward-header'>
                <h3>{reward.name}</h3>
                <span className={`badge ${getPriceBadgeClass(reward.cost)}`}>
                    💰 {reward.cost} 코인
                </span>
            </div>

            <p className='reward-description'>{reward.description}</p>

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

            {!canAfford && (
                <div className='coin-missing'>
                    {reward.cost - userCoins} 코인 더 필요
                </div>
            )}
        </motion.div>
    );
}

export default RewardCard;