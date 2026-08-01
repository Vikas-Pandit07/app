package com.outloox.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.outloox.entity.PasswordResetToken;
import com.outloox.entity.User;

import jakarta.transaction.Transactional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer>{
	
	Optional<PasswordResetToken> findByToken(String token);
	Optional<PasswordResetToken> findByUser(User user);
	
	@Modifying
	@Transactional
	@Query("DELETE FROM PasswordResetToken t WHERE t.user = :user")
	void deleteByUser(@Param("user") User user);
}
