import { useEffect, useState } from "react";
import { fetchRewards, buyReward, getUserInfo } from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RewardCard from "../components/RewardCard";

function Rewards() {
    const [rewards, setRewards] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchaseNotification, setPurchaseNotification] = useState(null);
    const [selectedReward, setSelectedReward] = useState(null);
    const navigate = useNavigate();

    // 보상 & 유저 정보 로드
    const loadRewardsAndUser = async () => {
        try {
            const [rewardsData, userData] = await Promise.all([
                fetchRewards(),
                getUserInfo(),
            ]);
            
            // 보상을 카테고리별로 분류
            const categorizedRewards = rewardsData.reduce((acc, reward) => {
                // 코스트에 따라 카테고리 분류
                let category = 'premium';
                if (reward.cost < 300) category = 'basic';
                else if (reward.cost < 800) category = 'advanced';
                
                if (!acc[category]) acc[category] = [];
                acc[category].push(reward);
                return acc;
            }, {});
            
            setRewards(categorizedRewards);
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

    // 보상 구매 처리
    const handlePurchase = (result) => {
        // 구매 알림 표시
        setPurchaseNotification({
            message: `${result.reward.name} 보상을 성공적으로 구매했습니다!`,
            coins: result.remaining_coins
        });
        
        // 3초 후 알림 제거
        setTimeout(() => {
            setPurchaseNotification(null);
        }, 3000);
        
        // 유저 정보 갱신
        loadRewardsAndUser();
    };

    // 보상 상세 표시
    const handleShowDetail = (reward) => {
        setSelectedReward(reward);
    };

    // 보상 상세 닫기
    const handleCloseDetail = () => {
        setSelectedReward(null);
    };

    if (loading) {
        return (
            <div className="container loading-container">
                <div className="loading-spinner large"></div>
                <h2>보상 정보를 불러오는 중...</h2>
            </div>
        );
    }

    return (
        <div className="container rewards-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>🎁 보상 상점</h1>
                <p>코인을 사용하여 다양한 보상을 구매하세요!</p>
            </motion.div>

            {user && (
                <motion.div 
                    className="user-coins"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <span className="coin-icon">💰</span>
                    <span className="coin-amount">{user.coins} 코인</span>
                </motion.div>
            )}

            {/* 기본 보상 섹션 */}
            {rewards.basic && rewards.basic.length > 0 && (
                <motion.div 
                    className="reward-category"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h2>기본 보상</h2>
                    <div className="rewards-grid">
                        {rewards.basic.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                userCoins={user?.coins || 0}
                                onPurchase={handlePurchase}
                                onShowDetail={() => handleShowDetail(reward)}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 고급 보상 섹션 */}
            {rewards.advanced && rewards.advanced.length > 0 && (
                <motion.div 
                    className="reward-category"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <h2>고급 보상</h2>
                    <div className="rewards-grid">
                        {rewards.advanced.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                userCoins={user?.coins || 0}
                                onPurchase={handlePurchase}
                                onShowDetail={() => handleShowDetail(reward)}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 프리미엄 보상 섹션 */}
            {rewards.premium && rewards.premium.length > 0 && (
                <motion.div 
                    className="reward-category"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <h2>프리미엄 보상</h2>
                    <div className="rewards-grid">
                        {rewards.premium.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                userCoins={user?.coins || 0}
                                onPurchase={handlePurchase}
                                onShowDetail={() => handleShowDetail(reward)}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 구매 알림 */}
            <AnimatePresence>
                {purchaseNotification && (
                    <motion.div 
                        className="purchase-notification"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                    >
                        <p>{purchaseNotification.message}</p>
                        <p>남은 코인: {purchaseNotification.coins} 코인</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 보상 상세 모달 */}
            <AnimatePresence>
                {selectedReward && (
                    <motion.div 
                        className="reward-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseDetail}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{selectedReward.name}</h2>
                                <button className="close-btn" onClick={handleCloseDetail}>&times;</button>
                            </div>
                            
                            <div className="reward-preview">
                                <div className="reward-preview-icon">🎁</div>
                            </div>
                            
                            <div className="reward-details">
                                <p>{selectedReward.description}</p>
                            </div>
                            
                            <div className="reward-price">
                                <span className="coin-icon">💰</span>
                                <span>{selectedReward.cost} 코인</span>
                            </div>
                            
                            <div className="purchase-buttons">
                                <button 
                                    className="btn btn-outline"
                                    onClick={handleCloseDetail}
                                >
                                    취소
                                </button>
                                
                                <button 
                                    className={`btn btn-primary ${user?.coins < selectedReward.cost ? 'btn-disabled' : ''}`}
                                    disabled={user?.coins < selectedReward.cost}
                                    onClick={() => {
                                        buyReward(selectedReward.id)
                                            .then(result => {
                                                handlePurchase(result);
                                                handleCloseDetail();
                                            })
                                            .catch(error => {
                                                console.error("보상 구매 실패:", error);
                                                alert("보상 구매에 실패했습니다.");
                                            });
                                    }}
                                >
                                    {user?.coins < selectedReward.cost ? '코인 부족' : '구매하기'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Rewards;