import { useEffect, useState } from "react";
import { fetchQuests, getUserInfo } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

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

  if (loading) {
    return <h2>⏳ 로딩 중...</h2>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
          <motion.li
            key={quest.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to={`/quests/${quest.id}`}>
              {quest.title} - {quest.description}
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

export default Quests;
