package com.metycoon.dto.request;

import com.metycoon.model.Quest.RepeatType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestCreateRequest {
    @NotBlank(message = "퀘스트 제목은 필수 항목입니다")
    private String title;

    @NotBlank(message = "퀘스트 설명은 필수 항목입니다")
    private String description;

    @NotNull(message = "경험치 보상은 필수 항목입니다")
    @Positive(message = "경험치 보상은 양수여야 합니다")
    private Integer xpReward;

    @NotNull(message = "코인 보상은 필수 항목입니다")
    @Positive(message = "코인 보상은 양수여야 합니다")
    private Integer coinReward;

    @NotNull(message = "반복 유형은 필수 항목입니다")
    private RepeatType repeatType;
}