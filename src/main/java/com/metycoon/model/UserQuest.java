package com.metycoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_quests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserQuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    private boolean completed = false;
    private LocalDateTime completionDate;

    public boolean isAvailableAgain() {
        if (!completed) {
            return true;  // 미완료 퀘스트는 수행 가능
        }

        LocalDateTime now = LocalDateTime.now();

        switch (quest.getRepeatType()) {
            case NONE:
                return false;  // 반복 없는 퀘스트는 다시 수행 불가
            case DAILY:
                // 다음날 0시 이후 가능
                return now.toLocalDate().isAfter(completionDate.toLocalDate());
            case WEEKLY:
                // 다음 주 월요일 0시 이후 가능
                return now.toLocalDate().minusDays(now.getDayOfWeek().getValue() - 1)
                        .isAfter(completionDate.toLocalDate()
                                .minusDays(completionDate.getDayOfWeek().getValue() - 1));
            case MONTHLY:
                // 다음 달 1일 0시 이후 가능
                return now.getMonth() != completionDate.getMonth() ||
                        now.getYear() != completionDate.getYear();
            default:
                return false;
        }
    }
}