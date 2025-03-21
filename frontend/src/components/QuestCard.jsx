import { useState } from 'react';
import { completeQuest } from '../api/api';
import { motion } from 'framer-motion';

function QuestCard({ quest, onComplete, userCoins }) {
    const [loading, setLoading] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [rewards, setRewards] = useState(null);

    // 퀘스트 반복 타입에 따른 배지 색상
    const getBadgeClass = (type) => {
        switch(type) {
            case 'daily': return 'badge-primary';
            case 'weekly': return 'badge-success';
            case 'monthly': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    // 퀘스트 반복 타입 한글화
    const getRepeatType = (type) => {
        switch(type) {
            case 'daily': return '일일';
            case 'weekly': return '주간';
            case 'monthly': return '월간';
            default: return '일회성';
        }
    };

    // 퀘스트 완료 처리
    const handleComplete = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const result = await completeQuest(quest.id);
            setRewards(result);
            setShowReward(true);

            // 1.5초 후 보상 표시 숨김
            setTimeout(() => {
                setShowReward(false);
                if (onComplete) onComplete();
            }, 1500);
        } catch (error) {
            console.error("퀘스트 완료 오류:", error);
            alert("퀘스트 완료 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className='game-card quest-card'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className='quest-header'>
                <h3>{quest.title}</h3>
                <span className={`badge ${getBadgeClass(quest.repeat_type)}`}>
                    {getRepeatType(quest.repeat_type)}
                </span>
            </div>

            <p className='quest-description'>{quest.description}</p>

            <div className='quest-rewards'>
                <div className='reward-item'>
                    <span className='reward-icon'>⭐</span>
                    <span className='reward-value'>{quest.xp_reward} XP</span>
                </div>
                <div className='reward-item'>
                    <span className='reward-icon'>💰</span>
                    <span className='reward-value'>{quest.coin_reward} 코인</span>
                </div>
            </div>

            <button
                className={`btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
                onClick={handleComplete}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className='loading-spinner'></span>
                        처리 중...
                    </>
                ) : '퀘스트 완료'}
            </button>

            {showReward && rewards && (
                <motion.div
                    className='reward-notification'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <h4>보상 획득!</h4>
                    <div className='reward-details'>
                        <p>⭐ {rewards.xp_reward} XP</p>
                        <p>💰 {rewards.coin_reward} 코인</p>
                    </div>
                    {rewards.leveled_up && (
                        <div className='level-up-alert'>
                            🎉 레벨 업! 현재 레벨: {rewards.level}
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}

export default QuestCard;