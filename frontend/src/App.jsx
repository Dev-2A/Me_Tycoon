import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Quests from "./pages/Quests";
import Profile from "./pages/Profile";
import Home from "./pages/Home"; // ✅ 홈 화면 추가

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ 초기 로딩 상태 추가

  // ✅ 기존 토큰 감지하여 로그인 상태 유지
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("✅ 기존 토큰 감지됨, 로그인 상태 유지");
      setIsAuthenticated(true);
    }
    setLoading(false); // ✅ 로딩 완료 후 상태 변경
  }, []);

  // ✅ 로딩 중에는 화면 표시 안 함 (깜빡임 방지)
  if (loading) return <div>로딩 중...</div>;

  return (
    <Router>
      <Routes>
        {/* ✅ 홈 화면 */}
        <Route path="/" element={<Home />} />

        {/* ✅ 로그인 페이지 */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/quests" />}
        />

        {/* ✅ 퀘스트 목록 페이지 */}
        <Route
          path="/quests"
          element={isAuthenticated ? <Quests /> : <Navigate to="/login" />}
        />

        {/* ✅ 프로필 페이지 */}
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />

        {/* ✅ 존재하지 않는 경로 -> 홈으로 리디렉트 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;