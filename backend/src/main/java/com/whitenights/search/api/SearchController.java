package com.whitenights.search.api;

import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.UserRepository;
import com.whitenights.post.api.dto.PostSummaryResponse;
import com.whitenights.search.api.dto.SearchResponse;
import com.whitenights.search.api.dto.UserSearchResult;
import com.whitenights.search.service.SearchService;
import com.whitenights.tag.api.dto.TagResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    private final UserRepository userRepository;

    @GetMapping("/api/search")
    public SearchResponse search(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int limit) {
        validateQuery(q);
        return searchService.search(q, limit);
    }

    @GetMapping("/api/search/users")
    public List<UserSearchResult> searchUsers(
            @RequestParam String q,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int limit) {
        validateQuery(q);
        return searchService.searchUsers(q, cursor, limit);
    }

    @GetMapping("/api/search/posts")
    public List<PostSummaryResponse> searchPosts(
            @RequestParam String q,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal String email) {
        validateQuery(q);
        User viewer = email != null ? userRepository.findByEmail(email).orElse(null) : null;
        return searchService.searchPosts(q, cursor, limit, viewer);
    }

    @GetMapping("/api/search/tags")
    public List<TagResponse> searchTags(
            @RequestParam String q,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int limit) {
        validateQuery(q);
        return searchService.searchTags(q, cursor, limit);
    }

    private void validateQuery(String q) {
        if (q == null || q.isBlank()) {
            throw new IllegalArgumentException("Search query must not be empty");
        }
    }
}
