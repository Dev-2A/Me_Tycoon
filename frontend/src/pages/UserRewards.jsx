import { useEffect, useState } from 'react';
import { fetchUserRewards, getUserInfo, applyReward } from '../api/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function UserRewards() {
    const [userRewards, setUserRewards] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appliedMessage, setAppliedMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [rewardsData, userData] = await Promise.all([
                    fetchUserRewards(),
                    getUserInfo()
                ]);
                
                if (rewardsData.user_rewards) {
                    setUserRewards(rewardsData.user_rewards);
                } else {
                    console.warn("⚠️ user_rewards 데이터가 없습니다.");
                    setUserRewards([]);
                }
                
                setUser(userData);
            } catch (error) {
                console.error("❌ 사용자 보상 내역 로드 실패:", error);
                alert("보상 내역을 불러오는데 실패했습니다. 😢");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    // 보상 적용 처리
    const handleApplyReward = async (rewardId) => {
        try {
            await applyReward(rewardId);
            
            // 해당 보상 찾기
            const reward = userRewards.find(r => r.id === rewardId);
            
            if (reward) {
                setAppliedMessage(`${reward.reward_name} 보상이 성공적으로 적용되었습니다!`);
                
                // 5초 후 메시지 제거
                setTimeout(() => {
                    setAppliedMessage(null);
                }, 5000);
            }
        } catch (error) {
            console.error("❌ 보상 적용 실패:", error);
            alert("보상 적용에 실패했습니다.");
        }
    };

    // 보상 유형에 따른 아이콘 결정
    const getRewardTypeIcon = (rewardName) => {
        if (rewardName.includes('배경')) return '🖼️';
        if (rewardName.includes('프레임')) return '🔘';
        if (rewardName.includes('아이콘')) return '🌟';
        if (rewardName.includes('부스터')) return '🚀';
        
        return '🎁';
    };

    // 보상 미리보기 이미지 경로 결정
    const getRewardPreview = (reward) => {
        // 상세 정보를 기반으로 경로 유추
        if (reward.reward_name.includes('우주')) {
            return '/assets/backgrounds/space.jpg';
        } else if (reward.reward_name.includes('바다')) {
            return '/assets/backgrounds/ocean.jpg';
        } else if (reward.reward_name.includes('정글')) {
            return '/assets/backgrounds/jungle.jpg';
        } else if (reward.reward_name.includes('골드')) {
            return '/assets/frames/gold.svg';
        } else if (reward.reward_name.includes('다이아몬드')) {
            return '/assets/frames/diamond.svg';
        } else if (reward.reward_name.includes('왕관')) {
            return '/assets/icons/crown.svg';
        } else if (reward.reward_name.includes('별')) {
            return '/assets/icons/star.svg';
        }
        
        return null;
    };

    if (loading) {
        return <h2>⏳ 보상 내역을 불러오는 중...</h2>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="user-rewards-container"
        >
            <h1>🏅 내 보상 내역</h1>

            {appliedMessage && (
                <motion.div 
                    className="applied-message"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    {appliedMessage}
                </motion.div>
            )}

            {userRewards.length === 0 ? (
                <div className="empty-state">
                    <p>아직 구매한 보상이 없습니다. 🎁</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/rewards')}
                    >
                        보상 상점 가기
                    </button>
                </div>
            ) : (
                <div className="rewards-grid">
                    {userRewards.map((reward, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="user-reward-card"
                        >
                            <div className="reward-info">
                                <div className="reward-header">
                                    <h3>
                                        {getRewardTypeIcon(reward.reward_name)} {reward.reward_name}
                                    </h3>
                                    <span className="reward-date">
                                        {reward.purchased_at}
                                    </span>
                                </div>
                                
                                {getRewardPreview(reward) && (
                                    <div className="reward-preview">
                                        <img 
                                            src={getRewardPreview(reward)} 
                                            alt={reward.reward_name} 
                                            className="reward-preview-image"
                                        />
                                    </div>
                                )}
                                
                                <p>{reward.description}</p>
                                <div className="reward-footer">
                                    <span>💰 {reward.cost} 코인</span>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => handleApplyReward(reward.id)}
                                    >
                                        적용하기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            
            <div className="back-to-profile">
                <button 
                    className="btn btn-outline"
                    onClick={() => navigate('/profile')}
                >
                    프로필로 돌아가기
                </button>
            </div>
        </motion.div>
    );
}

export default UserRewards;