import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/api";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { fetchActiveTitle } from "../api/api";
import { motion } from "framer-motion";

function Header({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState(isAuthenticated);
    const [activeTitle, setActiveTitle] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
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
        setIsAuthenticated(false);
        setAuthState(false);
        setMobileMenuOpen(false);
        navigate("/login");
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className="game-header">
            <div className="logo">
                <Link to="/">
                    <h2>🕹️ Me Tycoon</h2>
                </Link>
            </div>
            
            {/* 모바일 메뉴 토글 버튼 */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                <span className="menu-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
            
            <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <ul>
                    <li>
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                            🏠 홈
                        </Link>
                    </li>
                    
                    {authState ? (
                        <>
                            <li>
                                <Link to="/quests" onClick={() => setMobileMenuOpen(false)}>
                                    📜 퀘스트
                                </Link>
                            </li>
                            
                            <li>
                                <Link to="/rewards" onClick={() => setMobileMenuOpen(false)}>
                                    🎁 보상
                                </Link>
                            </li>
                            
                            <li>
                                <Link to="/achievements" onClick={() => setMobileMenuOpen(false)}>
                                    🏆 업적
                                </Link>
                            </li>
                            
                            <li>
                                <Link to="/titles" onClick={() => setMobileMenuOpen(false)}>
                                    👑 칭호
                                </Link>
                            </li>
                            
                            <li>
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    📊 통계
                                </Link>
                            </li>
                            
                            <li className="profile-link">
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                    <motion.div 
                                        className="profile-badge"
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        transition={{ 
                                            repeat: Infinity, 
                                            repeatType: "reverse", 
                                            duration: 1.5 
                                        }}
                                    >
                                        👤
                                    </motion.div>
                                    프로필
                                    {activeTitle && (
                                        <span className="header-title">
                                            {activeTitle.icon} {activeTitle.name}
                                        </span>
                                    )}
                                </Link>
                            </li>
                            
                            <li>
                                <Link to="/user-rewards" onClick={() => setMobileMenuOpen(false)}>
                                    🏅 내 보상
                                </Link>
                            </li>
                            
                            <li>
                                <button 
                                    className="logout-button" 
                                    onClick={handleLogout}
                                >
                                    🚪 로그아웃
                                </button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link 
                                to="/login" 
                                className="login-button"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                🔑 로그인
                            </Link>
                        </li>
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