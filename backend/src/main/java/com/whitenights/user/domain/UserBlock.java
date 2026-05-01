package com.whitenights.user.domain;

import com.whitenights.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBlock {

    @EmbeddedId
    private UserBlockId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("blockerId")
    @JoinColumn(name = "blocker_id")
    private User blocker;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("blockedId")
    @JoinColumn(name = "blocked_id")
    private User blocked;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class UserBlockId implements Serializable {
        @Column(name = "blocker_id")
        private Long blockerId;

        @Column(name = "blocked_id")
        private Long blockedId;
    }
}
