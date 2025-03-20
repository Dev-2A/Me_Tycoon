import { useState, useEffect } from "react";
import { fetchStatsOverview, fetchActivityHistory, fetchQuestStatistics, fetchRewardStatistics } from "../api/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [ activity, setActivity] = useState([]);
    const [questStats, setQuestStats] = useState(null);
    const [rewardStats, setRewardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDays, setActiveDays] = useState(7);
    const navigate = useNavigate();

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [overviewData, activityData, questData, rewardData] = await Promise.all([
                    fetchStatsOverview(),
                    fetchActivityHistory(activeDays),
                    fetchQuestStatistics(),
                    fetchRewardStatistics()
                ]);

                setOverview(overviewData);
                setActivity(activityData);
                setQuestStats(questData);
                setRewardStats(rewardData);
                console.log("✅ 통계 데이터 불러오기 성공");
            } catch (error) {
                console.error("❌ 통계 데이터 불러오기 실패:", error);
                alert("통계 데이터를 불러오는데 실패했습니다.");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [navigate, activeDays]);

    if (loading) {
        return <h2>⏳ 로딩 중...</h2>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="dashboard"
        >
            <h1>📊 통계 대시보드</h1>

            {/* 개요 섹션 */}
            {overview && (
                <section className="overview-section">
                    <h2>전체 통계</h2>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <h3>레벨 & 경험치</h3>
                            <p className="stat-value">Lv. {overview.level}</p>
                            <div className="progress-bar">
                                <div
                                    className="progress"
                                    style={{ width: `${(overview.xp / (overview.xp + overview.xp_to_next_level)) * 100}%`}}
                                ></div>
                            </div>
                            <p>{overview.xp} / {overview.xp + overview.xp_to_next_level} XP</p>
                        </div>

                        <div className="stat-card">
                            <h3>코인</h3>
                            <p className="stat-value">💰 {overview.coins}</p>
                            <p>총 획득: {overview.total_coins_earned} 코인</p>
                            <p>총 지출: {overview.total_coins_spent} 코잉ㄴ</p>
                        </div>

                        <div className="stat-card">
                            <h3>퀘스트</h3>
                            <p className="stat-value">{overview.total_quests_completed}개 완료</p>
                            <p>완료율: {overview.quest_completion_rate}%</p>
                        </div>

                        <div className="stat-card">
                            <h3>컬렉션</h3>
                            <p>업적: {overview.achievements_count}개</p>
                            <p>칭호: {overview.titles_count}개</p>
                            {overview.active_title && (
                                <p>현재 칭호: {overview.active_title}</p>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 활동 차트 섹션 */}
            <section className="activity-section">
                <h2>활동 기록</h2>
                <div className="period-selector">
                    <button
                        onClick={() => setActiveDays(7)}
                        className={activeDays === 7 ? 'active' : ''}
                    >
                        7일
                    </button>
                    <button
                        onClick={() => setActiveDays(14)}
                        className={activeDays === 14 ? 'active' : ''}
                    >
                        14일
                    </button>
                    <button
                        onClick={() => setActiveDays(30)}
                        className={activeDays === 30 ? 'active' : ''}
                    >
                        30일
                    </button>
                </div>

                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={activity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="quests_completed" name="완료한 퀘스트" stroke="#8884d8" />
                            <Line type="monotone" dataKey="rewards_purchased" name="구매한 보상" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 퀘스트 통계 */}
            {questStats && (
                <section className="quest-stats-section">
                    <h2>퀘스트 통계</h2>

                    <div className="quest-types">
                        {Object.entries(questStats.quest_by_type).map(([type, data]) => {
                            // 한글 타입명 매핑
                            const typeNames = {
                                'none': '일회성',
                                'daily': '일일',
                                'weekly': '주간',
                                'monthly': '월간'
                            };

                            return (
                                <div key={type} className="quest-type-card">
                                    <h3>{typeNames[type]} 퀘스트</h3>
                                    <p>{data.completed} / {data.total} 완료</p>
                                    <div className="progress-bar">
                                        <div
                                            className="progress"
                                            style={{ width: `${data.completion_rate}%`}}
                                        ></div>
                                    </div>
                                    <p className="completion-rate">{data.completion_rate}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="recent-quests">
                        <h3>최근 완료한 퀘스트</h3>
                        {questStats.recent_completed_quests.length > 0 ? (
                            <ul>
                                {questStats.recent_completed_quests.map((quest, index) => (
                                    <li key={index}>
                                        <strong>{quest.title}</strong>
                                        <span className="completion-date">
                                            {new Date(quest.completed_at).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>최근 완료한 퀘스트가 없습니다.</p>
                        )}
                    </div>
                </section>
            )}

            {/* 보상 통계 */}
            {rewardStats && (
                <section className="reward-stats-section">
                    <h2>보상 통계</h2>

                    <div className="reward-summary">
                        <div className="reward-stat">
                            <h3>총 구매 보상</h3>
                            <p className="stat-value">{rewardStats.total_rewards_purchased}개</p>
                        </div>

                        <div className="reward-stat">
                            <h3>총 사용 코인</h3>
                            <p className="stat-value">💰 {rewardStats.total_coins_spent}</p>
                        </div>

                        <div className="reward-stat">
                            <h3>평균 보상 가격</h3>
                            <p className="stat-value">💰 {rewardStats.average_reward_cost}</p>
                        </div>
                    </div>

                    <div className="recent-rewards">
                        <h3>최근 구매한 보상</h3>
                        {rewardStats.recent_purchased_rewards.length > 0 ? (
                            <ul>
                                {rewardStats.recent_purchased_rewards.map((reward, index) => (
                                    <li key={index}>
                                        <strong>{reward.name}</strong>
                                        <span className="reward-cost">💰 {reward.cost}</span>
                                        <span className="purchase-date">
                                            {new Date(reward.purchased_at).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>최근 구매한 보상이 없습니다.</p>
                        )}
                    </div>
                </section>
            )}
        </motion.div>
    );
}

export default Dashboard;