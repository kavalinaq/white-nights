package com.whitenights.auth.repository;

import com.whitenights.auth.domain.RefreshToken;
import com.whitenights.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
    void deleteByToken(String token);
}
