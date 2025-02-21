import { useState, useEffect } from 'react';
import { getUserInfo, buyReward } from '../api/api';
import { useNavigate } from 'react-router-dom';

function Rewards() {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
        setRewards(userData.available_rewards || []);
        console.log("✅ 사용자 정보 및 보상 목록 불러오기 성공");
      } catch (error) {
        console.error("❌ 사용자 정보 및 보상 목록 불러오기 실패", error);
        alert("데이터를 불러오는 데 실패했습니다. 다시 로그인해주세요.");
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleBuyReward = async (rewardId) => {
    try {
      const result = await buyReward(rewardId);
      alert(`🎉 보상 구매 완료! 남은 코인: ${result.total_coins}`);

      // ✅ 보상 구매 후 사용자 정보 즉시 업데이트
      const updatedUser = await getUserInfo();
      setUser(updatedUser);
    } catch (error) {
      console.error("❌ 보상 구매 실패:", error);
      alert("보상 구매에 실패했습니다. 코인이 부족할 수 있습니다.");
    }
  };

  if (loading) {
    return <h2>⏳ 로딩 중...</h2>;
  }

  return (
    <div>
      <h1>🎁 보상 목록</h1>

      {user && (
        <div>
          <h3>👤 사용자 정보</h3>
          <p>📛 닉네임: {user.username}</p>
          <p>🆙 레벨: {user.level}</p>
          <p>⭐ 경험치: {user.xp}</p>
          <p>💰 보유 코인: {user.coins}</p>
        </div>
      )}

      <ul>
        {rewards.length > 0 ? (
          rewards.map((reward) => (
            <li key={reward.id}>
              {reward.name} - {reward.cost} 코인
              <button onClick={() => handleBuyReward(reward.id)}>구매</button>
            </li>
          ))
        ) : (
          <p>💸 구매 가능한 보상이 없습니다.</p>
        )}
      </ul>
    </div>
  );
}
  
export default Rewards;