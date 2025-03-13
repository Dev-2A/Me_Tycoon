package com.metycoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    private int xpReward;
    private int coinReward;

    @Enumerated(EnumType.STRING)
    private RepeatType repeatType = RepeatType.NONE;

    public enum RepeatType {
        NONE("반복없음"),
        DAILY("매일 반복"),
        WEEKLY("매주 반복"),
        MONTHLY("매월 반복");

        private final String displayName;

        RepeatType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}