package com.whitenights.post.repository;

import com.whitenights.post.domain.Post;
import com.whitenights.auth.domain.User;
import com.whitenights.user.domain.FollowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    long countByUser(User user);

    @Query("""
            SELECT p FROM Post p
            JOIN p.tags t
            WHERE LOWER(t.name) = LOWER(:tagName)
              AND p.isBlocked = false
              AND (:cursor IS NULL OR p.postId < :cursor)
            ORDER BY p.postId DESC
            """)
    List<Post> findByTagName(
            @Param("tagName") String tagName,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            WHERE p.user = :user
              AND p.isBlocked = false
              AND (:cursor IS NULL OR p.postId < :cursor)
            ORDER BY p.postId DESC
            """)
    List<Post> findByUserWithCursor(
            @Param("user") User user,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            WHERE (LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(p.author) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))
              AND p.isBlocked = false
              AND (:cursor IS NULL OR p.postId < :cursor)
            ORDER BY p.postId DESC
            """)
    List<Post> searchPosts(
            @Param("q") String q,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            WHERE p.user IN (
                SELECT f.followee FROM Follow f
                WHERE f.follower = :viewer AND f.status = :status
            )
              AND p.isBlocked = false
              AND (:cursor IS NULL OR p.postId < :cursor)
            ORDER BY p.postId DESC
            """)
    List<Post> findFeedPosts(
            @Param("viewer") User viewer,
            @Param("status") FollowStatus status,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);
}
