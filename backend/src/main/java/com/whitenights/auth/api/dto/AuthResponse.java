package com.whitenights.auth.api.dto;

import com.whitenights.auth.domain.UserRole;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    UserDto user
) {
    public record UserDto(
        Long id,
        String nickname,
        String email,
        UserRole role
    ) {}
}
