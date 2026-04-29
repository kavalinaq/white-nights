package com.whitenights.chat.service;

import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.UserRepository;
import com.whitenights.chat.api.dto.ChatResponse;
import com.whitenights.chat.api.dto.MessageResponse;
import com.whitenights.chat.domain.Chat;
import com.whitenights.chat.domain.ChatMember;
import com.whitenights.chat.domain.ChatMemberRole;
import com.whitenights.chat.domain.Message;
import com.whitenights.chat.repository.ChatMemberRepository;
import com.whitenights.chat.repository.ChatRepository;
import com.whitenights.chat.repository.MessageRepository;
import com.whitenights.common.exception.types.ForbiddenException;
import com.whitenights.common.exception.types.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ChatResponse> getChats(User user) {
        return chatRepository.findByMember(user.getUserId()).stream()
                .map(c -> toChatResponse(c, user))
                .toList();
    }

    @Transactional
    public ChatResponse createChat(Long peerId, String name, List<Long> memberIds, User creator) {
        if (peerId != null) {
            return chatRepository.findExisting1v1(creator.getUserId(), peerId)
                    .map(c -> toChatResponse(c, creator))
                    .orElseGet(() -> create1v1(peerId, creator));
        }
        return createGroup(name, memberIds, creator);
    }

    public List<MessageResponse> getMessages(Long chatId, Long cursor, int limit, User user) {
        requireMember(chatId, user);
        return messageRepository.findByChatWithCursor(chatId, cursor, PageRequest.of(0, Math.min(limit, 50)))
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public void addMember(Long chatId, Long userId, User requester) {
        Chat chat = requireChat(chatId);
        requireOwner(chatId, requester);
        User newMember = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (!chatMemberRepository.existsByIdChatIdAndIdUserId(chatId, userId)) {
            chatMemberRepository.save(ChatMember.builder()
                    .id(new ChatMember.ChatMemberId(chatId, userId))
                    .chat(chat)
                    .user(newMember)
                    .role(ChatMemberRole.member)
                    .build());
        }
    }

    @Transactional
    public void removeMember(Long chatId, Long userId, User requester) {
        requireOwner(chatId, requester);
        chatMemberRepository.deleteById(new ChatMember.ChatMemberId(chatId, userId));
    }

    @Transactional
    public void deleteChat(Long chatId, User user) {
        requireMember(chatId, user);
        messageRepository.deleteByChatChatId(chatId);
        chatMemberRepository.deleteByIdChatId(chatId);
        chatRepository.deleteById(chatId);
    }

    @Transactional
    public void deleteMessage(Long messageId, User user) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        if (!message.getSender().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("Access denied");
        }
        message.setDeleted(true);
        messageRepository.save(message);
    }

    public MessageResponse saveAndBuildResponse(Long chatId, String text, User sender) {
        Chat chat = requireChat(chatId);
        requireMember(chatId, sender);
        Message message = messageRepository.save(Message.builder()
                .chat(chat)
                .sender(sender)
                .text(text)
                .build());
        return toMessageResponse(message);
    }

    private ChatResponse create1v1(Long peerId, User creator) {
        User peer = userRepository.findById(peerId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (!peer.isVerified()) {
            throw new ForbiddenException("Cannot start a chat with an unverified user");
        }
        Chat chat = chatRepository.save(Chat.builder().createdBy(creator).isGroup(false).build());
        addMemberRow(chat, creator, ChatMemberRole.member);
        addMemberRow(chat, peer, ChatMemberRole.member);
        return toChatResponse(chat, creator);
    }

    private ChatResponse createGroup(String name, List<Long> memberIds, User creator) {
        Chat chat = chatRepository.save(Chat.builder().createdBy(creator).name(name).isGroup(true).build());
        addMemberRow(chat, creator, ChatMemberRole.owner);
        if (memberIds != null) {
            memberIds.stream()
                    .distinct()
                    .filter(id -> !id.equals(creator.getUserId()))
                    .map(id -> userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id)))
                    .forEach(u -> addMemberRow(chat, u, ChatMemberRole.member));
        }
        return toChatResponse(chat, creator);
    }

    private void addMemberRow(Chat chat, User user, ChatMemberRole role) {
        chatMemberRepository.save(ChatMember.builder()
                .id(new ChatMember.ChatMemberId(chat.getChatId(), user.getUserId()))
                .chat(chat)
                .user(user)
                .role(role)
                .build());
    }

    private Chat requireChat(Long chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new NotFoundException("Chat not found"));
    }

    private void requireMember(Long chatId, User user) {
        if (!chatMemberRepository.existsByIdChatIdAndIdUserId(chatId, user.getUserId())) {
            throw new ForbiddenException("Not a member of this chat");
        }
    }

    private void requireOwner(Long chatId, User user) {
        ChatMember member = chatMemberRepository
                .findById(new ChatMember.ChatMemberId(chatId, user.getUserId()))
                .orElseThrow(() -> new ForbiddenException("Not a member of this chat"));
        if (member.getRole() != ChatMemberRole.owner) {
            throw new ForbiddenException("Only the owner can perform this action");
        }
    }

    private ChatResponse toChatResponse(Chat chat, User viewer) {
        List<ChatMember> members = chatMemberRepository.findByIdChatId(chat.getChatId());
        List<Message> latest = messageRepository.findLatestMessage(chat.getChatId(), PageRequest.of(0, 1));
        MessageResponse lastMsg = latest.isEmpty() ? null : toMessageResponse(latest.get(0));

        String displayName = chat.isGroup() ? chat.getName()
                : members.stream()
                .filter(m -> !m.getId().getUserId().equals(viewer.getUserId()))
                .findFirst()
                .map(m -> m.getUser().getNickname())
                .orElse("Unknown");

        return new ChatResponse(chat.getChatId(), displayName, chat.isGroup(), members.size(), lastMsg);
    }

    public MessageResponse toMessageResponse(Message m) {
        return new MessageResponse(
                m.getMessageId(),
                m.getChat().getChatId(),
                m.getSender() != null ? m.getSender().getUserId() : null,
                m.getSender() != null ? m.getSender().getNickname() : null,
                m.isDeleted() ? null : m.getText(),
                m.isDeleted(),
                m.getSentAt()
        );
    }
}
