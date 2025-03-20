import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/api";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { fetchActiveTitle } from "../api/api";

function Header({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState(isAuthenticated);
    const [activeTitle, setActiveTitle] = useState(null);

    useEffect( () => {
        setAuthState(isAuthenticated);

        // 인증 상태가 true이면 활성 칭호 가져오기
        if (isAuthenticated) {
            fetchActiveTitle()
                .then(data => {
                    if (data && data.title) {
                        setActiveTitle(data.title);
                    }
                })
                .catch(err => console.error("칭호 로드 실패:", err));
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false); // ✅ 로그인 상태 변경
        setAuthState(false);
        navigate("/login"); // ✅ 로그인 페이지로 이동
    };

    return (
        <header className="game-header">
            <h2>🕹 Me Tycoon</h2>
            <nav>
                <ul>
                    <li><Link to="/">🏠 홈</Link></li>
                    {authState ? (
                        <>
                            <li><Link to="/quests">📜 퀘스트</Link></li>
                            <li><Link to="/rewards">🎁 보상</Link></li>
                            <li><Link to="/achievements">🏆 업적</Link></li> {/* 추가 */}
                            <li><Link to="/titles">👑 칭호</Link></li> {/* 추가 */}
                            <li><Link to="/dashboard">📊 통계</Link></li> {/* 추가 */}
                            <li>
                                <Link to="/profile">
                                    👤 프로필
                                    {activeTitle && (
                                        <span className="header-title">
                                            {activeTitle.icon} {activeTitle.name}
                                        </span>
                                    )}
                                </Link>
                            </li>
                            <li><Link to="/user-rewards">🏅 내 보상</Link></li>
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