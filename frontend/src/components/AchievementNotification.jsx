import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNewAchievements, acknowledgeAchievement } from '../api/api';

function AchievementNotification() {
    const [achievements, setAchievements] = useState([]);
    const [currentAchievement, setCurrentAchievement] = useState(null);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const checkNewAchievements = async () => {
            try {
                const response = await getNewAchievements();
                if (response.recent_achievements && response.recent_achievements.length > 0) {
                    setAchievements(response.recent_achievements);
                    setCurrentAchievement(response.recent_achievements[0]);
                    setShowNotification(true);
                }
            } catch (error) {
                console.error("업적 조회 오류:", error);
            }
        };

        // 로그인 상태일 때만 체크
        const token = localStorage.getItem('token');
        if (token) {
            checkNewAchievements();
        }
    }, []);

    // 다음 업적 표시 또는 알림 닫기
    const handleNext = async () => {
        if (currentAchievement) {
            await acknowledgeAchievement(currentAchievement.id);
        }
        
        const currentIndex = achievements.indexOf(currentAchievement);
        if (currentIndex < achievements.length - 1) {
            setCurrentAchievement(achievements[currentIndex + 1]);
        } else {
            setShowNotification(false);
        }
    };

    if (!showNotification || !currentAchievement) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="achievement-notification"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
            >
                <div className="notification-header achievement-header">
                    <h3>🏆 업적 달성!</h3>
                    <button className="close-btn" onClick={() => setShowNotification(false)}>×</button>
                </div>
                <div className="notification-content achievement-content">
                    <div className="achievement-icon">{currentAchievement.icon}</div>
                    <h4>{currentAchievement.name}</h4>
                    <p>{currentAchievement.description}</p>
                    <div className="achievement-rewards">
                        <div className="reward-item">
                            <span className="reward-icon">⭐</span>
                            <span>{currentAchievement.xp_reward} XP</span>
                        </div>
                        <div className="reward-item">
                            <span className="reward-icon">💰</span>
                            <span>{currentAchievement.coin_reward} 코인</span>
                        </div>
                    </div>
                </div>
                <div className="notification-footer achievement-footer">
                    <button className="btn btn-primary" onClick={handleNext}>
                        {achievements.indexOf(currentAchievement) < achievements.length - 1 ? '다음' : '확인'}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default AchievementNotification;