package com.metycoon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestResponse {
    private Long id;
    private String title;
    private String description;
    private int xpReward;
    private int coinReward;
    private String repeatType;
}