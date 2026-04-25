package com.whitenights.auth.api;

import com.whitenights.auth.api.dto.AuthResponse;
import com.whitenights.auth.api.dto.LoginRequest;
import com.whitenights.auth.api.dto.RegisterRequest;
import com.whitenights.auth.service.AuthService;
import com.whitenights.common.exception.types.TooManyRequestsException;
import com.whitenights.common.ratelimit.RateLimitingService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RateLimitingService rateLimitingService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest request, HttpServletRequest servletRequest, HttpServletResponse response) {
        checkRateLimit(servletRequest, "login:" + request.email());
        AuthResponse authResponse = authService.login(request);
        setRefreshTokenCookie(response, authResponse.refreshToken());
        return authResponse;
    }

    @PostMapping("/verify")
    public void verify(@RequestParam String token) {
        authService.verify(token);
    }

    @PostMapping("/password/reset-request")
    public void requestPasswordReset(@RequestBody @Valid com.whitenights.auth.api.dto.PasswordResetRequest request, HttpServletRequest servletRequest) {
        checkRateLimit(servletRequest, "reset-request:" + request.email());
        authService.requestPasswordReset(request.email());
    }

    @PostMapping("/password/reset")
    public void resetPassword(@RequestBody @Valid com.whitenights.auth.api.dto.ResetPassword request, HttpServletRequest servletRequest) {
        checkRateLimit(servletRequest, "reset:" + servletRequest.getRemoteAddr());
        authService.resetPassword(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@CookieValue(name = "refresh_token") String token, HttpServletResponse response) {
        AuthResponse authResponse = authService.refresh(token);
        setRefreshTokenCookie(response, authResponse.refreshToken());
        return authResponse;
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = "refresh_token", required = false) String token, HttpServletResponse response) {
        if (token != null) {
            authService.logout(token);
        }
        clearRefreshTokenCookie(response);
    }

    private void checkRateLimit(HttpServletRequest request, String key) {
        String ipKey = "ip:" + request.getRemoteAddr();
        if (!rateLimitingService.resolveBucket(ipKey).tryConsume(1)) {
            throw new TooManyRequestsException("Too many requests from this IP");
        }
        if (!rateLimitingService.resolveBucket(key).tryConsume(1)) {
            throw new TooManyRequestsException("Too many requests for this account/action");
        }
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("refresh_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/api/auth");
        cookie.setMaxAge(14 * 24 * 60 * 60); // 14 days
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
