package com.whitenights.search.service;

import com.whitenights.auth.domain.User;
import com.whitenights.auth.repository.UserRepository;
import com.whitenights.post.api.dto.PostSummaryResponse;
import com.whitenights.post.domain.Post;
import com.whitenights.post.repository.PostRepository;
import com.whitenights.post.service.PostService;
import com.whitenights.search.api.dto.SearchResponse;
import com.whitenights.search.api.dto.UserSearchResult;
import com.whitenights.tag.api.dto.TagResponse;
import com.whitenights.tag.domain.Tag;
import com.whitenights.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private static final int GROUPED_LIMIT = 5;
    private static final int MAX_PAGE_SIZE = 50;

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final PostService postService;

    public SearchResponse search(String q, int limit) {
        int cap = Math.min(limit, GROUPED_LIMIT);
        PageRequest page = PageRequest.of(0, cap);

        List<UserSearchResult> users = userRepository
                .searchByNickname(q, null, page)
                .stream()
                .map(this::toUserResult)
                .toList();

        List<PostSummaryResponse> posts = postRepository
                .searchPosts(q, null, page)
                .stream()
                .map(p -> postService.toSummary(p, false, false))
                .toList();

        List<TagResponse> tags = tagRepository
                .searchByName(q, null, page)
                .stream()
                .map(t -> new TagResponse(t.getTagId(), t.getName()))
                .toList();

        return new SearchResponse(users, posts, tags);
    }

    public List<UserSearchResult> searchUsers(String q, Long cursor, int limit) {
        return userRepository
                .searchByNickname(q, cursor, PageRequest.of(0, Math.min(limit, MAX_PAGE_SIZE)))
                .stream()
                .map(this::toUserResult)
                .toList();
    }

    public List<PostSummaryResponse> searchPosts(String q, Long cursor, int limit, User viewer) {
        List<Post> posts = postRepository.searchPosts(
                q, cursor, PageRequest.of(0, Math.min(limit, MAX_PAGE_SIZE)));
        return posts.stream()
                .map(p -> postService.toSummary(p, false, false))
                .toList();
    }

    public List<TagResponse> searchTags(String q, Long cursor, int limit) {
        return tagRepository
                .searchByName(q, cursor, PageRequest.of(0, Math.min(limit, MAX_PAGE_SIZE)))
                .stream()
                .map(t -> new TagResponse(t.getTagId(), t.getName()))
                .toList();
    }

    private UserSearchResult toUserResult(User u) {
        return new UserSearchResult(u.getUserId(), u.getNickname(), u.getAvatarUrl(), u.isPrivate());
    }
}
