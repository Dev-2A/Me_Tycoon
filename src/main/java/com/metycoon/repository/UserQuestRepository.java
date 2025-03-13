package com.metycoon.repository;

import com.metycoon.model.Quest;
import com.metycoon.model.User;
import com.metycoon.model.UserQuest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserQuestRepository extends JpaRepository<UserQuest, Long> {
    List<UserQuest> findByUser(User user);
    List<UserQuest> findByUserAndCompleted(User user, boolean completed);
    List<UserQuest> findByUserAndCompletionDateBetween(User user, LocalDateTime start, LocalDateTime end);
    Optional<UserQuest> findByUserAndQuest(User user, Quest quest);
}