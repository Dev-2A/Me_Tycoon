import { useState, useEffect } from "react";
import { getUserInfo } from "../api/api"; // ✅ 사용자 정보 가져오는 API 호출
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserInfo(); // ✅ API 호출
        setUser(data); // ✅ 사용자 정보 저장
        console.log("✅ 사용자 정보 불러오기 성공:", data);
      } catch (error) {
        console.error("❌ 사용자 정보를 불러오는데 실패했습니다:", error);
        alert("사용자 정보를 불러오는데 실패했습니다. 다시 로그인해 주세요.");
        navigate("/login"); // ✅ 실패하면 로그인 페이지로 이동
      } finally {
        setLoading(false); // ✅ 로딩 완료
      }
    };

    fetchUserInfo();
  }, [navigate]);

  if (loading) {
    return <h2>⏳ 로딩 중...</h2>; // ✅ 로딩 표시
  }

  return (
    <div>
      <h1>👤 프로필</h1>
      {user ? (
        <div>
          <p>📛 닉네임: {user.username}</p>
          <p>🆙 레벨: {user.level}</p>
          <p>⭐ 경험치: {user.xp}</p>
          <p>💰 보유 코인: {user.coins}</p>
        </div>
      ) : (
        <p>❌ 사용자 정보를 불러올 수 없습니다.</p>
      )}
    </div>
  );
}

export default Profile;