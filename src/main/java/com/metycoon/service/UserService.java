package com.metycoon.service;

import com.metycoon.dto.response.UserResponse;
import com.metycoon.exception.CustomException;
import com.metycoon.model.User;
import com.metycoon.model.UserQuest;
import com.metycoon.repository.UserQuestRepository;
import com.metycoon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserQuestRepository userQuestRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
    }

    public UserResponse getUserInfo(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .level(user.getLevel())
                .xp(user.getXp())
                .coins(user.getCoins())
                .build();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    public UserResponse getUserStats(User user) {
        long completedQuestsCount = userQuestRepository.findByUserAndCompleted(user, true).size();

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .level(user.getLevel())
                .xp(user.getXp())
                .coins(user.getCoins())
                .build();
    }
}