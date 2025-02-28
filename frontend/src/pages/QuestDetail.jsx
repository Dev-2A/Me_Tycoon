import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuests } from "../api/api";

function QuestDetail() {
    const { questId } = useParams();  // 여기서 제대로 받아야 함
    const navigate = useNavigate();
    const [quest, setQuest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("🆔 현재 questId:", questId);  // 디버그 로그 추가

        if (!questId) {
            console.error("⚠️ questId가 undefined 상태임! 올바른 URL인지 확인하세요.");
            alert("잘못된 접근입니다. 퀘스트 목록으로 이동합니다.");
            navigate("/quests");
            return;
        }

        const loadQuest = async () => {
            try {
                const quests = await fetchQuests();
                const foundQuest = quests.find(q => q.id.toString() === questId);
                if (!foundQuest) {
                    console.error(`⚠️ 해당 ID(${questId})의 퀘스트를 찾을 수 없음`);
                    alert("퀘스트를 찾을 수 없습니다.");
                    navigate("/quests");
                    return;
                }
                setQuest(foundQuest);
            } catch (error) {
                console.error("❌ 퀘스트 상세 정보 로드 실패", error);
                alert("퀘스트 상세 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadQuest();
    }, [questId, navigate]);

    if (loading) return <h2>⏳ 로딩 중...</h2>;
    if (!quest) return <h2>❌ 퀘스트 정보를 불러올 수 없습니다.</h2>;

    return (
        <div>
            <h1>{quest.title}</h1>
            <p>{quest.description}</p>
        </div>
    );
}

export default QuestDetail;
