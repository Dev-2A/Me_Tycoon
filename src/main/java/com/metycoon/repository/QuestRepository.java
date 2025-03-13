package com.metycoon.repository;

import com.metycoon.model.Quest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByRepeatType(Quest.RepeatType repeatType);
}