import { useEffect, useState } from "react";
import { fetchQuests, getUserInfo } from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import QuestCard from "../components/QuestCard";

function Quests() {
  const [quests, setQuests] = useState([]);
  const [filteredQuests, setFilteredQuests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  // 데이터 로드
  const loadData = async () => {
    try {
      const [questsData, userData] = await Promise.all([
        fetchQuests(),
        getUserInfo(),
      ]);
      setQuests(questsData);
      setFilteredQuests(questsData);
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

  useEffect(() => {
    loadData();
  }, [navigate]);

  // 필터 적용
  const filterQuests = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredQuests(quests);
    } else {
      setFilteredQuests(quests.filter(quest => quest.repeat_type === filter));
    }
  };

  // 퀘스트 완료 후 처리
  const handleQuestComplete = () => {
    // 유저 정보와 퀘스트 목록 새로고침
    loadData();
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="loading-spinner large"></div>
        <h2>퀘스트 정보를 불러오는 중...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>🎯 퀘스트 목록</h1>
        <p>완료할 퀘스트를 선택하고 보상을 받으세요!</p>
      </motion.div>

      {user && (
        <motion.div 
          className="user-info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="user-info-header">
            <h3>👤 {user.username}</h3>
            <div className="user-level">레벨 {user.level}</div>
          </div>
          
          <div className="user-stats">
            <div className="user-stat">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{user.xp} XP</span>
            </div>
            <div className="user-stat">
              <span className="stat-icon">💰</span>
              <span className="stat-value">{user.coins} 코인</span>
            </div>
          </div>
          
          <div className="level-progress">
            <div className="level-progress-label">
              다음 레벨까지: {user.level * 100 - user.xp} XP
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(user.xp % (user.level * 100)) / (user.level * 100) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="filter-controls">
        <button 
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => filterQuests('all')}
        >
          전체
        </button>
        <button 
          className={`filter-button ${activeFilter === 'daily' ? 'active' : ''}`}
          onClick={() => filterQuests('daily')}
        >
          일일
        </button>
        <button 
          className={`filter-button ${activeFilter === 'weekly' ? 'active' : ''}`}
          onClick={() => filterQuests('weekly')}
        >
          주간
        </button>
        <button 
          className={`filter-button ${activeFilter === 'monthly' ? 'active' : ''}`}
          onClick={() => filterQuests('monthly')}
        >
          월간
        </button>
        <button 
          className={`filter-button ${activeFilter === 'none' ? 'active' : ''}`}
          onClick={() => filterQuests('none')}
        >
          일회성
        </button>
      </div>

      <div className="quests-grid">
        {filteredQuests.length > 0 ? (
          filteredQuests.map((quest, index) => (
            <QuestCard 
              key={quest.id} 
              quest={quest} 
              onComplete={handleQuestComplete}
              userCoins={user?.coins || 0}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <h3>퀘스트가 없습니다</h3>
            <p>다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quests;
