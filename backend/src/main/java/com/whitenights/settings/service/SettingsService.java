package com.whitenights.settings.service;

import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.RefreshTokenRepository;
import com.whitenights.auth.repository.UserRepository;
import com.whitenights.common.email.EmailService;
import com.whitenights.common.exception.types.UnauthorizedException;
import com.whitenights.post.api.dto.PostSummaryResponse;
import com.whitenights.post.domain.Post;
import com.whitenights.post.service.InteractionService;
import com.whitenights.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final InteractionService interactionService;
    private final PostService postService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${support.email}")
    private String supportEmail;

    public List<PostSummaryResponse> getSavedPosts(User user, Long cursor, int limit) {
        List<InteractionService.PostSummaryHelper> helpers =
                interactionService.getSavedPosts(user.getUserId(), cursor, limit);

        if (helpers.isEmpty()) return List.of();

        List<Post> posts = helpers.stream().map(InteractionService.PostSummaryHelper::post).toList();
        Set<Long> postIds = posts.stream().map(Post::getPostId).collect(Collectors.toSet());
        Set<Long> likedIds = interactionService.getLikedPostIds(user.getUserId(), postIds);

        return posts.stream()
                .map(p -> postService.toSummary(p, likedIds.contains(p.getPostId()), true))
                .toList();
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
    }

    public void sendSupportMessage(User user, String subject, String message) {
        emailService.sendSupportMessage(user.getEmail(), subject, message);
    }

    @Transactional
    public void deleteAccount(User user) {
        refreshTokenRepository.deleteByUser(user);
        userRepository.delete(user);
    }
}
