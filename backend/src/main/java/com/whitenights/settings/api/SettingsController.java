package com.whitenights.settings.api;

import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.UserRepository;
import com.whitenights.post.api.dto.PostSummaryResponse;
import com.whitenights.settings.api.dto.ChangePasswordRequest;
import com.whitenights.settings.api.dto.SupportRequest;
import com.whitenights.settings.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;
    private final UserRepository userRepository;

    @GetMapping("/api/users/me/saved")
    public List<PostSummaryResponse> getSavedPosts(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal String email) {
        return settingsService.getSavedPosts(resolveUser(email), cursor, limit);
    }

    @PostMapping("/api/users/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @RequestBody @Valid ChangePasswordRequest request,
            @AuthenticationPrincipal String email) {
        settingsService.changePassword(resolveUser(email), request.currentPassword(), request.newPassword());
    }

    @PostMapping("/api/support")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendSupport(
            @RequestBody @Valid SupportRequest request,
            @AuthenticationPrincipal String email) {
        settingsService.sendSupportMessage(resolveUser(email), request.subject(), request.message());
    }

    @DeleteMapping("/api/users/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@AuthenticationPrincipal String email) {
        settingsService.deleteAccount(resolveUser(email));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
