import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Quests from "./pages/Quests";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Rewards from "./pages/Rewards";
import History from "./pages/History";
import QuestDetail from "./pages/QuestDetail";
import RewardDetail from "./pages/RewardDetail";
import Header from "./components/Header";
import UserRewards from "./pages/UserRewards";
import Achievements from "./pages/Achievements";
import Titles from "./pages/Titles";
import Dashboard from "./pages/Dashboard";

// 공통 스타일 로드
import "./styles/theme.css";
import "./styles/Dashboard.css";
import "./styles/Achievements.css";
import "./styles/Titles.css";
import "./styles/quests.css";
import "./styles/rewards.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  // 로컬 스토리지 변경 감지하여 로그인 상태 업데이트
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    console.log("🔐 인증 상태 변경:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <main className="main-content">
        <Routes>
          {/* 홈 화면 */}
          <Route path="/" element={<Home />} />

          {/* 로그인 페이지 */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/quests" />}
          />

          {/* 퀘스트 목록 페이지 */}
          <Route
            path="/quests"
            element={isAuthenticated ? <Quests /> : <Navigate to="/login" />}
          />

          {/* 프로필 페이지 */}
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />

          {/* 보상 페이지 */}
          <Route
            path="/rewards"
            element={isAuthenticated ? <Rewards /> : <Navigate to="/login" />}
          />

          {/* 퀘스트&보상 내역 페이지 */}
          <Route 
            path="/history"
            element={isAuthenticated ? <History /> : <Navigate to="/login" />}
          />

          {/* 퀘스트 상세 페이지 */}
          <Route 
            path="/quests/:questId"
            element={isAuthenticated ? <QuestDetail /> : <Navigate to="/login" />}
          />

          {/* 보상 상세 페이지 */}
          <Route 
            path="/rewards/:id"
            element={isAuthenticated ? <RewardDetail /> : <Navigate to="/login" />}
          />

          {/* 유저 보상 목록 페이지 */}
          <Route 
            path="/user-rewards"
            element={isAuthenticated ? <UserRewards /> : <Navigate to="/login" />}
          />

          {/* 업적 목록 페이지 */}
          <Route
            path="/achievements"
            element={isAuthenticated ? <Achievements /> : <Navigate to="/login" />}
          />

          {/* 칭호 목록 페이지 */}
          <Route
            path="/titles"
            element={isAuthenticated ? <Titles /> : <Navigate to="/login" />}
          />

          {/* 대시보드 페이지 */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />

          {/* 존재하지 않는 경로 -> 홈으로 리디렉트 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="game-footer">
        <div className="container">
          <p>© 2025 Me Tycoon - 나를 키워가는 RPG</p>
        </div>
      </footer>
    </Router>
  );
}

export default App;