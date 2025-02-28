import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>🏠 Me Tycoon에 오신 것을 환영합니다!</h1>
      <p>퀘스트를 완료하고 보상을 획득하세요!</p>
      <nav>
        <ul>
          <li><Link to="/quests">📜 퀘스트 목록</Link></li>
          <li><Link to="/rewards">🎁 보상 목록</Link></li>
          <li><Link to="/profile">👤 내 프로필</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;