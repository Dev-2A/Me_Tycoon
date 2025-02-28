import { useEffect, useState } from "react";
import { fetchRewards, buyReward, getUserInfo } from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Rewards() {
    const [rewards, setRewards] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 보상 목록 & 유저 정보 로드
    const loadRewardsAndUser = async () => {
        try {
            const [rewardsData, userData] = await Promise.all([
                fetchRewards(),
                getUserInfo(),
            ]);
            setRewards(rewardsData);
            setUser(userData);
        } catch (error) {
            console.error("❌ 보상 목록/유저 정보 로드 실패:", error);
            alert("보상 목록을 불러오는데 실패했습니다. 😢");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRewardsAndUser();
    }, [navigate]);

    const handleBuyReward = async (rewardId) => {
        try {
            const result = await buyReward(rewardId);
            alert(`🎉 보상 구매 성공! 남은 코인: ${result.remaining_coins}`);

            // 보상 구매 후 최신 유저 정보 & 보상 목록 다시 로드
            await loadRewardsAndUser();
        } catch (error) {
            console.error("❌ 보상 구매 실패:", error);
            alert("보상 구매에 실패했습니다. 😢");
        }
    };

    if (loading) {
        return <h2>⏳ 보상 정보를 불러오는 중...</h2>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <h1>🎁 보상 목록</h1>

            {user && (
                <div>
                    <p>👤 사용자: {user.username}</p>
                    <p>💰 보유 코인: {user.coins}</p>
                </div>
            )}

            <ul>
                {rewards.map((reward, index) => (
                    <motion.li
                        key={reward.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="reward-item"
                    >
                        <span>{reward.name} - {reward.description} - {reward.cost}코인</span>
                        {user && user.coins >= reward.cost ? (
                            <button onClick={() => handleBuyReward(reward.id)}>구매</button>
                        ) : (
                            <button disabled>구매 불가</button>
                        )}
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}

export default Rewards;