import { useEffect, useState } from "react";
import { fetchQuests, completeQuest, getUserInfo } from "../api/api";
import { useNavigate } from "react-router-dom";

function Quests() {
  const [quests, setQuests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [questsData, userData] = await Promise.all([
          fetchQuests(),
          getUserInfo(),
        ]);
        setQuests(questsData);
        setUser(userData);
        console.log("✅ 퀘스트 및 사용자 정보 불러오기 성공");
      } catch (error) {
        console.error("❌ 퀘스트 및 사용자 정보 불러오기 실패", error);
        alert("퀘스트 및 사용자 정보 불러오기에 실패했습니다. 😢");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // ✅ 퀘스트 완료 함수
  const handleCompleteQuest = async (questId) => {
    try {
      const result = await completeQuest(questId);
      alert(`🎉 퀘스트 완료! 경험치 +${result.xp_reward}, 코인 +${result.coin_reward}`);

      // ✅ 퀘스트 완료 후 사용자 정보 즉시 업데이트
      const updateUser = await getUserInfo();
      setUser(updateUser);

      // ✅ 레벨업 메시지 추가
      if (result.leveled_up) {
        alert(`🚀 레벨업! 레벨 ${result.level} 달성!`);
      }
    } catch (error) {
      console.error("❌ 퀘스트 완료 실패", error);
      alert(`퀘스트 완료에 실패했습니다. 😢`);
    }
  };

  if (loading) {
    return <h2>⏳ 로딩 중...</h2>;
  }

  return (
    <div>
      <h1>🎯 퀘스트 목록</h1>
      
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
        {quests.map((quest) => (
          <li key={quest.id}>
            {quest.title} - {quest.description} 
            <button onClick={() => handleCompleteQuest(quest.id)}>완료</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Quests;
