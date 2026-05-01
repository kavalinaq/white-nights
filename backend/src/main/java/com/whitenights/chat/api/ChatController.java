package com.whitenights.chat.api;

import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.UserRepository;
import com.whitenights.chat.api.dto.AddMemberRequest;
import com.whitenights.chat.api.dto.ChatResponse;
import com.whitenights.chat.api.dto.CreateChatRequest;
import com.whitenights.chat.api.dto.MessageResponse;
import com.whitenights.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/chats")
    public List<ChatResponse> getChats(@AuthenticationPrincipal String email) {
        return chatService.getChats(resolveUser(email));
    }

    @PostMapping("/api/chats")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatResponse createChat(
            @RequestBody CreateChatRequest request,
            @AuthenticationPrincipal String email) {
        return chatService.createChat(request.peerId(), request.name(), request.memberIds(), resolveUser(email));
    }

    @DeleteMapping("/api/chats/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChat(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        chatService.deleteChat(id, resolveUser(email));
    }

    @GetMapping("/api/chats/{id}/messages")
    public List<MessageResponse> getMessages(
            @PathVariable Long id,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal String email) {
        return chatService.getMessages(id, cursor, limit, resolveUser(email));
    }

    @PostMapping("/api/chats/{id}/members")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addMember(
            @PathVariable Long id,
            @RequestBody @Valid AddMemberRequest request,
            @AuthenticationPrincipal String email) {
        chatService.addMember(id, request.userId(), resolveUser(email));
    }

    @DeleteMapping("/api/chats/{id}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal String email) {
        chatService.removeMember(id, userId, resolveUser(email));
    }

    @PostMapping("/api/chats/{id}/upload-image")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal String email) {
        User user = resolveUser(email);
        MessageResponse response = chatService.saveImageMessage(id, file, user);
        messagingTemplate.convertAndSend("/topic/chat/" + id, response);
        return response;
    }

    @DeleteMapping("/api/messages/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        chatService.deleteMessage(id, resolveUser(email));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
