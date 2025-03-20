import { useEffect, useState } from 'react';
import { fetchUserRewards } from '../api/api';
import { motion } from 'framer-motion';

function UserRewards() {
    const [userRewards, setUserRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserRewards = async () => {
            try {
                const response = await fetchUserRewards();
                console.log("📦 사용자 보상 내역 데이터:", response);

                if (response.user_rewards) {
                    setUserRewards(response.user_rewards);  // ✅ user_rewards 배열로 저장
                } else {
                    console.warn("⚠️ user_rewards 데이터가 없습니다.");
                    setUserRewards([]);
                }
            } catch (error) {
                console.error("❌ 사용자 보상 내역 로드 실패:", error);
                alert("보상 내역을 불러오는데 실패했습니다. 😢");
            } finally {
                setLoading(false);
            }
        };

        loadUserRewards();
    }, []);

    if (loading) {
        return <h2>⏳ 보상 내역을 불러오는 중...</h2>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="user-rewards"
        >
            <h1>🏅 내 보상 내역</h1>

            {userRewards.length === 0 ? (
                <p>아직 구매한 보상이 없습니다. 🎁</p>
            ) : (
                <ul>
                    {userRewards.map((ur, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="reward-item"
                        >
                            <div className="reward-info">
                                <strong>{ur.reward_name}</strong>
                                <p>{ur.description}</p>
                                <span>💰 {ur.cost} 코인</span>
                            </div>
                            <div className="reward-date">
                                구매일: {ur.purchased_at}
                            </div>
                        </motion.li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}

export default UserRewards;