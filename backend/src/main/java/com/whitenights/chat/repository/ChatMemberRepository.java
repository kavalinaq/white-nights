package com.whitenights.chat.repository;

import com.whitenights.chat.domain.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMemberRepository extends JpaRepository<ChatMember, ChatMember.ChatMemberId> {

    List<ChatMember> findByIdChatId(Long chatId);

    boolean existsByIdChatIdAndIdUserId(Long chatId, Long userId);
}
