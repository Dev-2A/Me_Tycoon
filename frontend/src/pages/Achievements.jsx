import { useState, useEffect } from "react";
import { fetchMyAchievements, fetchAchievements } from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Achievements() {
    const [myAchievements, setMyAchievements] = useState([]);
    const [allAchievements, setAllAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadAchievements = async () => {
            try {
                const [myData, allData] = await Promise.all([
                    fetchMyAchievements(),
                    fetchAchievements()
                ]);

                setMyAchievements(myData);
                setAllAchievements(allData);
                console.log("✅ 업적 정보 불러오기 성공");
            } catch (error) {
                console.error("❌ 업적 정보 불러오기 실패:", error);
                alert("업적 정보를 불러오는데 실패했습니다.");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadAchievements();
    }, [navigate]);

    if (loading) {
        return <h2>⏳ 로딩 중...</h2>;
    }

    // 내가 획득한 업적 ID 목록
    const myAchievementIds = myAchievements.map(a => a.achievement.id);

    // 카테고리별로 업적 분류
    const achievementsByCategory = {};
    allAchievements.forEach(achievement => {
        if (!achievementsByCategory[achievement.category]) {
            achievementsByCategory[achievement.category] = [];
        }
        achievementsByCategory[achievement.category].push(achievement);
    });

    // 카테고리 한글화
    const categoryNames = {
        'quest': '퀘스트',
        'level': '레벨',
        'reward': '보상',
        'special': '특별'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <h1>🏆 업적 목록</h1>
            <p>총 {myAchievements.length}개의 업적을 달성했습니다 (전체: {allAchievements.length}개)</p>

            {Object.keys(achievementsByCategory).map(category => (
                <div key={category} className="achievement-category">
                    <h2>{categoryNames[category]} 업적</h2>
                    <div className="achievements-grid">
                        {achievementsByCategory[category].map(achievement => {
                            const isUnlocked = myAchievementIds.includes(achievement.id);

                            return (
                                <motion.div
                                    key={achievement.id}
                                    className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="achievement-icon">{achievement.icon}</div>
                                    <h3>{achievement.name}</h3>
                                    <p>{achievement.description}</p>
                                    <div className="achievement-rewards">
                                        {achievement.xp_reward > 0 && <span>⭐ {achievement.xp_reward} XP</span>}
                                        {achievement.coin_reward > 0 && <span>💰 {achievement.coin_reward} 코인</span>}
                                    </div>
                                    <div className="achievement-status">
                                        {isUnlocked ? '🎉 달성!' : '🔒 잠김'}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

export default Achievements