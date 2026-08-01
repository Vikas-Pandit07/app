package com.outloox.repository;

import com.outloox.entity.User;
import com.outloox.entity.enums.Role;
import com.outloox.entity.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsernameAndDeletedAtIsNull(String username);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    Optional<User> findByUsernameOrEmailAndDeletedAtIsNull(String username, String email);

    Optional<User> findByUsernameAndActiveTrueAndDeletedAtIsNull(String username);

    boolean existsByUsernameAndDeletedAtIsNull(String username);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    Long countByRoleAndDeletedAtIsNull(Role role);

    Page<User> findByRoleAndDeletedAtIsNull(Role role, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL AND u.createdAt >= :from")
    long countNewUsersFrom(@Param("from") LocalDateTime from);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime, u.lastLoginIp = :ip, u.loginAttempts = 0 WHERE u.userId = :userId")
    void updateLastLogin(@Param("userId") Integer userId, @Param("loginTime") LocalDateTime loginTime, @Param("ip") String ip);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.loginAttempts = u.loginAttempts + 1 WHERE u.userId = :userId")
    void incrementLoginAttempts(@Param("userId") Integer userId);
}