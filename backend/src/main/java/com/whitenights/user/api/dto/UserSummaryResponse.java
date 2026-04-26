package com.whitenights.user.api.dto;

public record UserSummaryResponse(
    Long userId,
    String nickname,
    String avatarUrl
) {}
