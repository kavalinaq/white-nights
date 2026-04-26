package com.whitenights.tracker.domain;

import com.whitenights.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "reading_tracker")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackerEntry {

    @EmbeddedId
    private TrackerEntryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "pages_read")
    private Integer pagesRead;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TrackerEntryId implements Serializable {
        @Column(name = "user_id")
        private Long userId;

        @Column(name = "date")
        private LocalDate date;
    }
}
