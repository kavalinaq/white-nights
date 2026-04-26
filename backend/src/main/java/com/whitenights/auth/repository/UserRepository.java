package com.whitenights.auth.repository;

import com.whitenights.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    @Query("""
            SELECT u FROM User u
            WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :q, '%'))
              AND u.isBlocked = false
              AND (:cursor IS NULL OR u.userId < :cursor)
            ORDER BY u.userId DESC
            """)
    List<User> searchByNickname(
            @Param("q") String q,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);
}
