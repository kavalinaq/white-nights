package com.whitenights.chat.api.dto;

import java.time.LocalDateTime;

public record MessageResponse(
        Long messageId,
        Long chatId,
        Long senderId,
        String senderNickname,
        String text,
        boolean isDeleted,
        LocalDateTime sentAt
) {}
