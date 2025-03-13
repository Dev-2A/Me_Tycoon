package com.metycoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    private int level = 1;
    private int xp = 0;
    private int coins = 0;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    // UserDetails 인터페이스 구현 메서드
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // 레벨업 로직
    public boolean levelUp() {
        int levelUpXp = level * 100;  // 레벨업에 필요한 경험치
        boolean leveledUp = false;

        while (xp >= levelUpXp) {
            level++;
            xp -= levelUpXp;
            coins += 50;  // 레벨업 보상: 50코인
            levelUpXp = level * 100;
            leveledUp = true;
        }

        return leveledUp;
    }
}