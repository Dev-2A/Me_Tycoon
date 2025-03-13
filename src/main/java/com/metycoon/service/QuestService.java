package com.metycoon.service;

import com.metycoon.dto.request.CompleteQuestRequest;
import com.metycoon.dto.request.QuestCreateRequest;
import com.metycoon.dto.response.CompleteQuestResponse;
import com.metycoon.dto.response.QuestHistoryResponse;
import com.metycoon.dto.response.QuestResponse;
import com.metycoon.exception.CustomException;
import com.metycoon.model.Quest;
import com.metycoon.model.User;
import com.metycoon.model.UserQuest;
import com.metycoon.repository.QuestRepository;
import com.metycoon.repository.UserQuestRepository;
import com.metycoon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestService {

    private final QuestRepository questRepository;
    private final UserQuestRepository userQuestRepository;
    private final UserRepository userRepository;

    public List<QuestResponse> getAllQuests() {
        return questRepository.findAll().stream()
                .map(this::mapToQuestResponse)
                .collect(Collectors.toList());
    }

    public QuestResponse getQuestById(Long id) {
        Quest quest = questRepository.findById(id)
                .orElseThrow(() -> new CustomException("퀘스트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return mapToQuestResponse(quest);
    }

    @Transactional
    public QuestResponse createQuest(QuestCreateRequest request) {
        Quest quest = Quest.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .xpReward(request.getXpReward())
                .coinReward(request.getCoinReward())
                .repeatType(request.getRepeatType())
                .build();

        Quest savedQuest = questRepository.save(quest);
        return mapToQuestResponse(savedQuest);
    }

    @Transactional
    public CompleteQuestResponse completeQuest(User user, CompleteQuestRequest request) {
        Quest quest = questRepository.findById(request.getQuestId())
                .orElseThrow(() -> new CustomException("퀘스트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        UserQuest userQuest = userQuestRepository.findByUserAndQuest(user, quest)
                .orElse(UserQuest.builder()
                        .user(user)
                        .quest(quest)
                        .build());

        if (userQuest.isCompleted() && !userQuest.isAvailableAgain()) {
            throw new CustomException("이 퀘스트는 이미 완료했으며 아직 재수행할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }

        userQuest.setCompleted(true);
        userQuest.setCompletionDate(LocalDateTime.now());
        userQuestRepository.save(userQuest);

        // 사용자에게 보상 지급
        user.setXp(user.getXp() + quest.getXpReward());
        user.setCoins(user.getCoins() + quest.getCoinReward());

        // 레벨업 확인
        boolean leveledUp = user.levelUp();

        userRepository.save(user);

        // 다음 수행 가능 시간 계산
        LocalDateTime nextAvailable = null;

        switch (quest.getRepeatType()) {
            case DAILY -> {
                LocalDateTime now = LocalDateTime.now();
                nextAvailable = now.toLocalDate().plusDays(1).atStartOfDay();
            }
            case WEEKLY -> {
                LocalDateTime now = LocalDateTime.now();
                int daysUntilMonday = 8 - now.getDayOfWeek().getValue(); // 다음주 월요일까지의 일수
                nextAvailable = now.toLocalDate().plusDays(daysUntilMonday).atStartOfDay();
            }
            case MONTHLY -> {
                LocalDateTime now = LocalDateTime.now();
                nextAvailable = now.toLocalDate().withDayOfMonth(1).plusMonths(1).atStartOfDay();
            }
        }

        return CompleteQuestResponse.builder()
                .message("퀘스트를 성공적으로 완료했습니다!")
                .xpReward(quest.getXpReward())
                .coinReward(quest.getCoinReward())
                .totalXp(user.getXp())
                .totalCoins(user.getCoins())
                .level(user.getLevel())
                .leveledUp(leveledUp)
                .repeatType(quest.getRepeatType().getDisplayName())
                .nextAvailable(nextAvailable)
                .build();
    }

    public QuestHistoryResponse getQuestHistory(User user) {
        List<UserQuest> completedQuests = userQuestRepository.findByUserAndCompleted(user, true);

        List<QuestHistoryResponse.CompletedQuestDTO> completedQuestDTOs = completedQuests.stream()
                .map(uq -> QuestHistoryResponse.CompletedQuestDTO.builder()
                        .title(uq.getQuest().getTitle())
                        .completedAt(uq.getCompletionDate() != null
                                ? uq.getCompletionDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                                : null)
                        .xpReward(uq.getQuest().getXpReward())
                        .coinReward(uq.getQuest().getCoinReward())
                        .build())
                .collect(Collectors.toList());

        return QuestHistoryResponse.builder()
                .completedQuests(completedQuestDTOs)
                .build();
    }

    private QuestResponse mapToQuestResponse(Quest quest) {
        return QuestResponse.builder()
                .id(quest.getId())
                .title(quest.getTitle())
                .description(quest.getDescription())
                .xpReward(quest.getXpReward())
                .coinReward(quest.getCoinReward())
                .repeatType(quest.getRepeatType().getDisplayName())
                .build();
    }
}