const BASE_URL = "http://127.0.0.1:8000/api"; // ✅ Django 백엔드 주소

// ✅ 토큰 가져오기 (항상 최신 토큰 사용)
const getAuthToken = () => {
    const token = localStorage.getItem("token");
    console.log("🔑 현재 저장된 토큰:", token);
    return token;
};

// ✅ API 요청을 위한 기본 헤더 설정
const getHeaders = () => {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Token ${token}` : "", // ✅ 토큰이 없을 경우 빈 값 처리
    };
};

// ✅ 공통 API 요청 함수 (에러 처리 추가)
const apiRequest = async (endpoint, method = "GET", body = null) => {
    try {
        const options = {
            method,
            headers: getHeaders(),
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${BASE_URL}/${endpoint}/`, options);

        if (!response.ok) {
            // 🚀 DRF 에러 응답 확인 (JSON 형태일 가능성 있음)
            let errorMessage = `API 요청 실패: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage += ` - ${errorData.detail}`; // ✅ 상세 에러 메시지 추가
                }
            } catch (jsonError) {
                console.warn("❌ JSON 에러 메시지를 가져오지 못함:", jsonError);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`📦 API 응답 (${endpoint}):`, data);
        return data;
    } catch (error) {
        console.error(`❌ API 요청 오류 (${endpoint}):`, error);
        throw error;
    }
};

// ✅ 퀘스트 목록 가져오기
export const fetchQuests = () => apiRequest("quests");

// ✅ 퀘스트 완료 API
export const completeQuest = (questId) => apiRequest("complete-quest", "POST", { quest_id: questId });

// ✅ 사용자 정보 가져오기
export const getUserInfo = () => apiRequest("users/me");

// ✅ 홈 화면 데이터 가져오기 (백엔드 엔드포인트 확인 필요)
export const fetchHomeData = () => apiRequest("home");

// ✅ 보상 구매 API
export const buyReward = (rewardId) => apiRequest("buy-reward", "POST", { reward_id: rewardId });