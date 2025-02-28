import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchRewardDetail } from "../api/api";

function RewardDetail() {
    const { id } = useParams();
    const [reward, setReward] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReward = async () => {
            try {
                const data = await fetchRewardDetail(id);
                setReward(data);
            } catch {
                alert("보상 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadReward();
    }, [id]);

    if (loading) return <h2>⏳ 로딩 중...</h2>;
    if (!reward) return <h2>🚨 보상 정보를 찾을 수 없습니다.</h2>;

    return (
        <div>
            <h1>🎁 보상 상세 정보</h1>
            <h2>{reward.name}</h2>
            <p>{reward.description}</p>
            <p>💰 가격: {reward.cost} 코인</p>
        </div>
    );
}

export default RewardDetail;