package com.outloox.repository;

import com.outloox.entity.Cart;
import com.outloox.entity.CartItem;
import com.outloox.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    int getTotalItemCount(int cartId);

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProductAndSizeAndColor(Cart cart, Product product, String size, String color);

    void deleteByCart(Cart cart);
}
