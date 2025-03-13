package com.metycoon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteQuestResponse {
    private String message;
    private int xpReward;
    private int coinReward;
    private int totalXp;
    private int totalCoins;
    private int level;
    private boolean leveledUp;
    private String repeatType;
    private LocalDateTime nextAvailable;
}