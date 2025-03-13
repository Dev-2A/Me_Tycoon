package com.metycoon.repository;

import com.metycoon.model.User;
import com.metycoon.model.UserReward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface UserRewardRepository extends JpaRepository<UserReward, Long> {
    List<UserReward> findByUser(User user);
    List<UserReward> findByUserAndPurchasedAtBetween(User user, LocalDateTime start, LocalDateTime end);
}