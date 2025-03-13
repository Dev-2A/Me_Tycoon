package com.metycoon.controller;

import com.metycoon.dto.response.UserResponse;
import com.metycoon.model.User;
import com.metycoon.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getUserInfo(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserInfo(user));
    }

    @GetMapping("/stats")
    public ResponseEntity<UserResponse> getUserStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserStats(user));
    }
}