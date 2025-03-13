package com.metycoon.repository;

import com.metycoon.model.Reward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByCostLessThanEqual(int cost);
}