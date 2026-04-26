package com.whitenights.chat.api.dto;

import java.util.List;

public record CreateChatRequest(
        Long peerId,        // for 1:1 chat
        String name,        // for group chat
        List<Long> memberIds // for group chat
) {}
