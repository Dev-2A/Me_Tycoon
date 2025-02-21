import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; // ✅ PropTypes 추가

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      console.log("✅ 로그인 성공 -> 퀘스트 페이지로 이동");
      navigate("/quests");
    } else {
      alert("로그인 실패: " + data.error);
    }
  };

  return (
    <div>
      <h1>로그인 페이지</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">아이디: </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호: </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

// ✅ `setIsAuthenticated`의 PropTypes 검증 추가
Login.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Login;