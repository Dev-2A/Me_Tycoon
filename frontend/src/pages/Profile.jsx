import { useState, useEffect } from "react";
import { getUserInfo, getAppliedRewards, removeAppliedReward } from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [appliedRewards, setAppliedRewards] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, rewardsData] = await Promise.all([
          getUserInfo(),
          getAppliedRewards()
        ]);
        setUser(userData);
        setAppliedRewards(rewardsData);
        console.log("✅ 사용자 정보 및 적용 보상 불러오기 성공:", userData, rewardsData);
      } catch (error) {
        console.error("❌ 사용자 정보를 불러오는데 실패했습니다:", error);
        alert("사용자 정보를 불러오는데 실패했습니다. 다시 로그인해 주세요.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 보상 적용 해제 처리
  const handleRemoveReward = async (rewardType) => {
    try {
      await removeAppliedReward(rewardType);
      
      // 상태 업데이트
      setAppliedRewards(prev => {
        const newState = {...prev};
        delete newState[rewardType];
        return newState;
      });
      
      alert("보상 적용이 해제되었습니다.");
    } catch (error) {
      console.error("❌ 보상 해제 실패:", error);
      alert("보상 해제에 실패했습니다.");
    }
  };

  // 배경 스타일 설정
  const getBackgroundStyle = () => {
    if (appliedRewards.background) {
      return {
        backgroundImage: `url(/assets/backgrounds/${appliedRewards.background.value}.jpg)`
      };
    }
    return {};
  };

  // 프로필 프레임 가져오기
  const getProfileFrame = () => {
    if (appliedRewards.profile_frame) {
      return `/assets/frames/${appliedRewards.profile_frame.value}.svg`;
    }
    return null;
  };

  // 특수 아이콘 가져오기
  const getSpecialIcon = () => {
    if (appliedRewards.special_icon) {
      return `/assets/icons/${appliedRewards.special_icon.value}.svg`;
    }
    return null;
  };

  if (loading) {
    return <h2>⏳ 로딩 중...</h2>;
  }

  return (
    <div className="profile-container" style={getBackgroundStyle()}>
      <motion.div 
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <div className="profile-avatar" style={getProfileFrame() ? {
            backgroundImage: `url(${getProfileFrame()})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          } : {}}>
            <div className="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
          </div>
          
          <div className="profile-title">
            <h2>
              {user.username}
              {getSpecialIcon() && (
                <img src={getSpecialIcon()} alt="특수 아이콘" className="special-icon" width="24" />
              )}
            </h2>
            
            {user.titles && user.titles.length > 0 && user.titles.some(t => t.is_active) && (
              <div className="active-title">
                {user.titles.find(t => t.is_active).title.icon} {user.titles.find(t => t.is_active).title.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">📛 레벨</span>
            <span className="stat-value">{user.level}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">⭐ 경험치</span>
            <span className="stat-value">{user.xp} / {user.level * 100}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">💰 보유 코인</span>
            <span className="stat-value">{user.coins}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">🏆 완료한 퀘스트</span>
            <span className="stat-value">
              {user.quests ? user.quests.length : 0}개
            </span>
          </div>
        </div>
        
        {Object.keys(appliedRewards).length > 0 && (
          <div className="applied-rewards">
            <h3>🎁 적용 중인 보상</h3>
            <div className="reward-list">
              {appliedRewards.background && (
                <div className="applied-reward">
                  <span>🖼️ 배경화면: {appliedRewards.background.name}</span>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleRemoveReward('background')}
                  >
                    해제
                  </button>
                </div>
              )}
              
              {appliedRewards.profile_frame && (
                <div className="applied-reward">
                  <span>🔘 프로필 프레임: {appliedRewards.profile_frame.name}</span>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleRemoveReward('profile_frame')}
                  >
                    해제
                  </button>
                </div>
              )}
              
              {appliedRewards.special_icon && (
                <div className="applied-reward">
                  <span>🌟 특수 아이콘: {appliedRewards.special_icon.name}</span>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleRemoveReward('special_icon')}
                  >
                    해제
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="profile-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/user-rewards')}
          >
            🏅 내 보상 관리
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/achievements')}
          >
            🏆 업적 확인
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;