package com.metycoon.service;

import com.metycoon.dto.request.BuyRewardRequest;
import com.metycoon.dto.request.RewardCreateRequest;
import com.metycoon.dto.response.BuyRewardResponse;
import com.metycoon.dto.response.RewardHistoryResponse;
import com.metycoon.dto.response.RewardResponse;
import com.metycoon.exception.CustomException;
import com.metycoon.model.Reward;
import com.metycoon.model.User;
import com.metycoon.model.UserReward;
import com.metycoon.repository.RewardRepository;
import com.metycoon.repository.UserRepository;
import com.metycoon.repository.UserRewardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;
    private final UserRewardRepository userRewardRepository;
    private final UserRepository userRepository;

    public List<RewardResponse> getAllRewards() {
        return rewardRepository.findAll().stream()
                .map(this::mapToRewardResponse)
                .collect(Collectors.toList());
    }

    public RewardResponse getRewardById(Long id) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new CustomException("보상을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return mapToRewardResponse(reward);
    }

    @Transactional
    public RewardResponse createReward(RewardCreateRequest request) {
        Reward reward = Reward.builder()
                .name(request.getName())
                .description(request.getDescription())
                .cost(request.getCost())
                .build();

        Reward savedReward = rewardRepository.save(reward);
        return mapToRewardResponse(savedReward);
    }

    @Transactional
    public BuyRewardResponse buyReward(User user, BuyRewardRequest request) {
        Reward reward = rewardRepository.findById(request.getRewardId())
                .orElseThrow(() -> new CustomException("보상을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        if (user.getCoins() < reward.getCost()) {
            throw new CustomException("코인이 부족합니다.", HttpStatus.BAD_REQUEST);
        }

        // 보상 구매 처리
        UserReward userReward = UserReward.builder()
                .user(user)
                .reward(reward)
                .build();
        userRewardRepository.save(userReward);

        // 사용자 코인 차감
        user.setCoins(user.getCoins() - reward.getCost());
        userRepository.save(user);

        return BuyRewardResponse.builder()
                .message("보상을 성공적으로 구매했습니다!")
                .remainingCoins(user.getCoins())
                .reward(mapToRewardResponse(reward))
                .userRewardId(userReward.getId())
                .build();
    }

    public RewardHistoryResponse getRewardHistory(User user) {
        List<UserReward> userRewards = userRewardRepository.findByUser(user);

        List<RewardHistoryResponse.PurchasedRewardDTO> purchasedRewards = userRewards.stream()
                .map(ur -> RewardHistoryResponse.PurchasedRewardDTO.builder()
                        .rewardName(ur.getReward().getName())
                        .description(ur.getReward().getDescription())
                        .cost(ur.getReward().getCost())
                        .purchasedAt(ur.getPurchasedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                        .build())
                .collect(Collectors.toList());

        return RewardHistoryResponse.builder()
                .purchasedRewards(purchasedRewards)
                .build();
    }

    private RewardResponse mapToRewardResponse(Reward reward) {
        return RewardResponse.builder()
                .id(reward.getId())
                .name(reward.getName())
                .description(reward.getDescription())
                .cost(reward.getCost())
                .build();
    }
}