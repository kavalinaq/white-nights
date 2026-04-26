package com.whitenights.search.api.dto;

public record UserSearchResult(Long userId, String nickname, String avatarUrl, boolean isPrivate) {}
