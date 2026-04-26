package com.whitenights.tracker.api;

import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.UserRepository;
import com.whitenights.tracker.api.dto.TrackerEntryResponse;
import com.whitenights.tracker.api.dto.UpsertTrackerEntryRequest;
import com.whitenights.tracker.service.TrackerService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TrackerController {

    private final TrackerService trackerService;
    private final UserRepository userRepository;

    @GetMapping("/api/tracker")
    public List<TrackerEntryResponse> getMonth(
            @RequestParam String month,
            @AuthenticationPrincipal String email) {
        YearMonth yearMonth = YearMonth.parse(month);
        return trackerService.getMonth(resolveUser(email), yearMonth);
    }

    @PutMapping("/api/tracker/{date}")
    @ResponseStatus(HttpStatus.OK)
    public TrackerEntryResponse upsert(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody UpsertTrackerEntryRequest request,
            @AuthenticationPrincipal String email) {
        return trackerService.upsert(resolveUser(email), date, request.pagesRead());
    }

    @DeleteMapping("/api/tracker/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal String email) {
        trackerService.delete(resolveUser(email), date);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
