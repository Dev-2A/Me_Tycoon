import { useState, useEffect } from "react";
import { fetchMyTitles, fetchTitles, setActiveTitle } from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Titles() {
    const [myTitles, setMyTitles] = useState([]);
    const [ allTitles, setAllTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadTitles = async () => {
        try {
            const [myData, allData] = await Promise.all([
                fetchMyTitles(),
                fetchTitles()
            ]);

            setMyTitles(myData);
            setAllTitles(allData);
            console.log("✅ 칭호 정보 불러오기 성공");
        } catch (error) {
            console.error("❌ 칭호 정보 불러오기 실패:", error);
            alert("칭호 정보를 불러오는데 실패했습니다.");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTitles();
    }, [navigate]);

    const handleActivateTitle = async (titleId) => {
        try {
            await setActiveTitle(titleId);
            alert("칭호가 성공적으로 적용되었습니다!");
            loadTitles(); // 목록 새로고침
        } catch (error) {
            console.error("❌ 칭호 적용 실패:", error);
            alert("칭호 적용에 실패했습니다.");
        }
    };

    if (loading) {
        return <h2>⏳ 로딩 중...</h2>;
    }

    // 내가 획득한 칭호 ID 목록
    const myTitleIds = myTitles.map(t => t.title.id);

    // 현재 활성화된 칭호 찾기
    const activeTitle = myTitles.find(t => t.is_active);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opaity: 0 }}
        >
            <h1>👑 칭호 목록</h1>

            <div className="active-title-section">
                <h2>현재 칭호</h2>
                {activeTitle ? (
                    <div className="active-title">
                        <span className="title-icon">{activeTitle.title.icon}</span>
                        <span className="title-name">{activeTitle.title.name}</span>
                    </div>
                ) : (
                    <p>현재 활성화된 칭호가 없습니다.</p>
                )}
            </div>

            <h2>획득한 칭호 ({myTitles.length}/{allTitles.length})</h2>
            <div className="titles-grid">
                {allTitles.map(title => {
                    const isUnlocked = myTitleIds.includes(title.id);
                    const userTitle = myTitles.find(t => t.title.id === title.id);
                    const isActive = userTitle?.is_active || false;

                    return (
                        <motion.div
                            key={title.id}
                            className={`title-card ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`}
                            whileHover = {{ scale: 1.05 }}
                        >
                            <div className="title-icon">{title.icon}</div>
                            <h3>{title.name}</h3>
                            <p>{title.description}</p>

                            {isUnlocked && !isActive && (
                                <button
                                    onClick={() => handleActivateTitle(userTitle.id)}
                                    className="activate-button"
                                >
                                    칭호 적용하기
                                </button>
                            )}

                            {isActive && (
                                <div className="active-badge">✔ 적용 중</div>
                            )}

                            {!isUnlocked && (
                                <div className="locked-info">
                                    {title.required_level && (
                                        <p>필요 레벨: {title.required_level}</p>
                                    )}
                                    {title.required_achievement && (
                                        <p>필요 업적: {title.required_achievement.name}</p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default Titles;