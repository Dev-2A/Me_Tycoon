package com.metycoon.service;

import com.metycoon.dto.request.AuthRequest.LoginRequest;
import com.metycoon.dto.request.AuthRequest.RegisterRequest;
import com.metycoon.dto.response.AuthResponse;
import com.metycoon.dto.response.UserResponse;
import com.metycoon.exception.CustomException;
import com.metycoon.model.User;
import com.metycoon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 사용자명이나 이메일이 이미 사용 중인지 확인
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("이미 사용 중인 사용자명입니다.", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("이미 사용 중인 이메일입니다.", HttpStatus.BAD_REQUEST);
        }

        // 새 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        // JWT 토큰 생성
        String token = jwtService.generateToken(user);

        // 응답 구성
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 인증 시도
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();

        // JWT 토큰 생성
        String token = jwtService.generateToken(user);

        // 응답 구성
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
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