package com.outloox.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.outloox.entity.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
	
	Cart findByUser_UserId(int userId);
}