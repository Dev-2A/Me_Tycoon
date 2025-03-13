package com.metycoon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestHistoryResponse {
    private List<CompletedQuestDTO> completedQuests;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletedQuestDTO {
        private String title;
        private String completedAt;
        private int xpReward;
        private int coinReward;
    }
}