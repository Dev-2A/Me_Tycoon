import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAutoCompletedQuests } from '../api/api';

function AutoQuestNotification() {
    const [autoQuests, setAutoQuests] = useState([]);
    const [currentQuest, setCurrentQuest] = useState(null);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const checkAutoQuests = async () => {
            try {
                const response = await getAutoCompletedQuests();
                if (response.auto_completed && response.auto_completed.length > 0) {
                    setAutoQuests(response.auto_completed);
                    setCurrentQuest(response.auto_completed[0]);
                    setShowNotification(true);
                }
            } catch (error) {
                console.error("자동 완료 퀘스트 조회 오류:", error);
            }
        };

        checkAutoQuests();
    }, []);

    // 다음 퀘스트 표시 또는 알림 닫기
    const handleNext = () => {
        const currentIndex = autoQuests.indexOf(currentQuest);
        if (currentIndex < autoQuests.length - 1) {
            setCurrentQuest(autoQuests[currentIndex + 1]);
        } else {
            setShowNotification(false);
        }
    };

    if (!showNotification || !currentQuest) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="auto-quest-notification"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
            >
                <div className="notification-header">
                    <h3>🎉 퀘스트 자동 완료!</h3>
                    <button className="close-btn" onClick={() => setShowNotification(false)}>×</button>
                </div>
                <div className="notification-content">
                    <h4>{currentQuest.title}</h4>
                    <div className="quest-rewards">
                        <div className="reward-item">
                            <span className="reward-icon">⭐</span>
                            <span>{currentQuest.xp_reward} XP</span>
                        </div>
                        <div className="reward-item">
                            <span className="reward-icon">💰</span>
                            <span>{currentQuest.coin_reward} 코인</span>
                        </div>
                    </div>
                </div>
                <div className="notification-footer">
                    <button className="btn btn-primary" onClick={handleNext}>
                        {autoQuests.indexOf(currentQuest) < autoQuests.length - 1 ? '다음' : '확인'}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default AutoQuestNotification;