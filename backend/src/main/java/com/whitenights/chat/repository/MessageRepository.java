package com.whitenights.chat.repository;

import com.whitenights.chat.domain.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
            SELECT m FROM Message m
            WHERE m.chat.chatId = :chatId
              AND (:cursor IS NULL OR m.messageId < :cursor)
            ORDER BY m.messageId DESC
            """)
    List<Message> findByChatWithCursor(
            @Param("chatId") Long chatId,
            @Param("cursor") Long cursor,
            Pageable pageable);

    @Query("""
            SELECT m FROM Message m
            WHERE m.chat.chatId = :chatId
            ORDER BY m.messageId DESC
            """)
    List<Message> findLatestMessage(@Param("chatId") Long chatId, Pageable pageable);
}
