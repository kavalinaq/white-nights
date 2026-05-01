package com.whitenights.chat.ws;

import com.whitenights.auth.repository.UserRepository;
import com.whitenights.chat.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final PresenceService presenceService;
    private final UserRepository userRepository;

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        if (sha.getUser() != null) {
            userRepository.findByEmail(sha.getUser().getName())
                    .ifPresent(u -> presenceService.userConnected(u.getUserId()));
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        if (sha.getUser() != null) {
            userRepository.findByEmail(sha.getUser().getName())
                    .ifPresent(u -> presenceService.userDisconnected(u.getUserId()));
        }
    }
}
