package com.metycoon.controller;

import com.metycoon.dto.request.CompleteQuestRequest;
import com.metycoon.dto.request.QuestCreateRequest;
import com.metycoon.dto.response.CompleteQuestResponse;
import com.metycoon.dto.response.QuestHistoryResponse;
import com.metycoon.dto.response.QuestResponse;
import com.metycoon.model.User;
import com.metycoon.service.QuestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;

    @GetMapping
    public ResponseEntity<List<QuestResponse>> getAllQuests() {
        return ResponseEntity.ok(questService.getAllQuests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestResponse> getQuestById(@PathVariable Long id) {
        return ResponseEntity.ok(questService.getQuestById(id));
    }

    @PostMapping
    public ResponseEntity<QuestResponse> createQuest(@RequestBody @Valid QuestCreateRequest request) {
        return ResponseEntity.ok(questService.createQuest(request));
    }

    @PostMapping("/complete")
    public ResponseEntity<CompleteQuestResponse> completeQuest(
            @AuthenticationPrincipal User user,
            @RequestBody CompleteQuestRequest request) {
        return ResponseEntity.ok(questService.completeQuest(user, request));
    }

    @GetMapping("/history")
    public ResponseEntity<QuestHistoryResponse> getQuestHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(questService.getQuestHistory(user));
    }
}