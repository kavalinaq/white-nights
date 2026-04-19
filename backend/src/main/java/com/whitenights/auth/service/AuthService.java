package com.whitenights.auth.service;

import com.whitenights.auth.api.dto.RegisterRequest;
import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByNickname(request.nickname())) {
            throw new RuntimeException("Nickname already exists");
        }

        User user = User.builder()
                .nickname(request.nickname())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .isVerified(false) // Verification flow to be implemented later
                .build();

        userRepository.save(user);
    }
}
