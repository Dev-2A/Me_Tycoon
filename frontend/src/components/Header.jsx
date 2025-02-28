import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/api";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

function Header({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState(isAuthenticated);

    useEffect( () => {
        setAuthState(isAuthenticated);
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false); // ✅ 로그인 상태 변경
        setAuthState(false);
        navigate("/login"); // ✅ 로그인 페이지로 이동
    };

    return (
        <header>
            <h2>🕹 Me Tycoon</h2>
                <nav>
                    <ul>
                        <li><Link to="/">🏠 홈</Link></li>
                        {authState ? (
                            <>
                                <li><Link to="/quests">📜 퀘스트 목록</Link></li>
                                <li><Link to="/profile">👤 프로필</Link></li>
                                <li><Link to="/rewards">🎁 보상</Link></li>
                                <li><Link to="/user-rewards">🏅 내 보상 내역</Link></li>
                                <li><button onClick={handleLogout}>🚪 로그아웃</button></li>
                            </>
                        ) : (
                        <li><Link to="/login">🔑 로그인</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
}
Header.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    setIsAuthenticated: PropTypes.func.isRequired,
};

export default Header;