package com.whitenights.chat.repository;

import com.whitenights.chat.domain.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("""
            SELECT c FROM Chat c
            JOIN ChatMember m ON m.id.chatId = c.chatId
            WHERE m.id.userId = :userId
            ORDER BY c.createdAt DESC
            """)
    List<Chat> findByMember(@Param("userId") Long userId);

    @Query("""
            SELECT c FROM Chat c
            WHERE c.isGroup = false
              AND EXISTS (SELECT m FROM ChatMember m WHERE m.id.chatId = c.chatId AND m.id.userId = :userId1)
              AND EXISTS (SELECT m FROM ChatMember m WHERE m.id.chatId = c.chatId AND m.id.userId = :userId2)
            """)
    Optional<Chat> findExisting1v1(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    long count();
}
