import { useEffect, useState } from "react";
import { fetchHomeData } from "../api/api"; // ✅ API 호출 추가

function Home() {
  const [message, setMessage] = useState("홈 화면입니다!");

  useEffect(() => {
    fetchHomeData()
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("홈 데이터 불러오기 실패:", error));
  }, []);

  return (
    <div>
      <h1>🏡 Me Tycoon 홈</h1>
      <p>{message}</p>
    </div>
  );
}

export default Home;
