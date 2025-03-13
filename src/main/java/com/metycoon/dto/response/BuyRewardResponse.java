package com.metycoon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuyRewardResponse {
    private String message;
    private int remainingCoins;
    private RewardResponse reward;
    private Long userRewardId;
}