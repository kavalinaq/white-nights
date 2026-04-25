package com.whitenights.common.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ConsoleEmailService implements EmailService {

    @Override
    public void sendVerificationEmail(String email, String token) {
        log.info("Sending verification email to {}: token = {}", email, token);
        System.out.println("--------------------------------------------------");
        System.out.println("VERIFICATION EMAIL");
        System.out.println("To: " + email);
        System.out.println("Verify here: http://localhost:5173/verify?token=" + token);
        System.out.println("--------------------------------------------------");
    }

    @Override
    public void sendPasswordResetEmail(String email, String token) {
        log.info("Sending password reset email to {}: token = {}", email, token);
    }
}
