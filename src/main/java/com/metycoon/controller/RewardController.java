package com.metycoon.controller;

import com.metycoon.dto.request.BuyRewardRequest;
import com.metycoon.dto.request.RewardCreateRequest;
import com.metycoon.dto.response.BuyRewardResponse;
import com.metycoon.dto.response.RewardHistoryResponse;
import com.metycoon.dto.response.RewardResponse;
import com.metycoon.model.User;
import com.metycoon.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @GetMapping
    public ResponseEntity<List<RewardResponse>> getAllRewards() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RewardResponse> getRewardById(@PathVariable Long id) {
        return ResponseEntity.ok(rewardService.getRewardById(id));
    }

    @PostMapping
    public ResponseEntity<RewardResponse> createReward(@RequestBody @Valid RewardCreateRequest request) {
        return ResponseEntity.ok(rewardService.createReward(request));
    }

    @PostMapping("/buy")
    public ResponseEntity<BuyRewardResponse> buyReward(
            @AuthenticationPrincipal User user,
            @RequestBody BuyRewardRequest request) {
        return ResponseEntity.ok(rewardService.buyReward(user, request));
    }

    @GetMapping("/history")
    public ResponseEntity<RewardHistoryResponse> getRewardHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rewardService.getRewardHistory(user));
    }
}