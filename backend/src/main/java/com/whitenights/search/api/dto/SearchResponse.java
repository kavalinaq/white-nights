package com.whitenights.search.api.dto;

import com.whitenights.post.api.dto.PostSummaryResponse;
import com.whitenights.tag.api.dto.TagResponse;

import java.util.List;

public record SearchResponse(
        List<UserSearchResult> users,
        List<PostSummaryResponse> posts,
        List<TagResponse> tags
) {}
