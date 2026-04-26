package com.whitenights.common.email;

public interface EmailService {
    void sendVerificationEmail(String email, String token);
    void sendPasswordResetEmail(String email, String token);
    void sendSupportMessage(String fromEmail, String subject, String message);
}
