import { useState, useEffect } from "react";
import { fetchQuestHistory, fetchRewardHistory } from "../api/api";
import { useNavigate } from "react-router-dom";

function History() {
    const [questHistory, setQuestHistory] = useState([]);
    const [rewardHistory, setRewardHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const quests = await fetchQuestHistory();
                const rewards = await fetchRewardHistory();
                setQuestHistory(quests);
                setRewardHistory(rewards);
                console.log("✅ 퀘스트 & 보상 내역 불러오기 성공");
            } catch (error) {
                console.error("❌ 퀘스트 & 보상 내역 불러오기 실패:", error);
                alert("퀘스트 & 보상 내역을 불러오는 중에 오류가 발생했습니다.");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    if (loading) {
        return <h2>⏳로딩 중...</h2>;
    }

    return (
        <div>
            <h1>📜 내역 조회</h1>

            <h2>📝 완료한 퀘스트</h2>
            {questHistory.length >0 ? (
                <ul>
                    {questHistory.map((quest, index) => (
                        <li key={index}>
                            {quest.title} - 완료 날짜: {quest.completed_at}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>✅ 완료한 퀘스트가 없습니다.</p>
            )}

            <h2>🎁 구매한 보상</h2>
            {rewardHistory.length > 0 ? (
                <ul>
                    {rewardHistory.map((reward, index) => (
                        <li key={index}>
                            {reward.name} - {reward.cost} 코인 (구매일: {reward.purchased_at})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>💸 구매한 보상이 없습니다.</p>
            )}
        </div>
    );
}

export default History;