package com.whitenights.user.repository;

import com.whitenights.user.domain.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBlockRepository extends JpaRepository<UserBlock, UserBlock.UserBlockId> {
}
