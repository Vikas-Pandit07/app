package com.outloox.service;

import com.outloox.dto.AddToCartRequest;
import com.outloox.dto.CartItemResponse;
import com.outloox.dto.CartSummaryResponse;
import com.outloox.entity.Cart;
import com.outloox.entity.CartItem;
import com.outloox.entity.Product;
import com.outloox.entity.ProductImage;
import com.outloox.entity.User;
import com.outloox.exception.InvalidCredentialsException;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.CartItemRepository;
import com.outloox.repository.CartRepository;
import com.outloox.repository.ProductImageRepository;
import com.outloox.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private static final BigDecimal FREE_SHIPPING_LIMIT = BigDecimal.valueOf(999);
    private static final BigDecimal SHIPPING_CHARGE = BigDecimal.valueOf(99);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final ProductImageRepository productImageRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserService userService,
            ProductImageRepository productImageRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userService = userService;
        this.productImageRepository = productImageRepository;
    }

    private User getCurrentUser() {
        return userService.getCurrentUser();
    }

    public Cart getOrCreateCart(User user) {
        Cart cart = cartRepository.findByUser_UserId(user.getUserId());
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart = cartRepository.save(cart);
        }
        return cart;
    }

    @Transactional
    public void addToCart(AddToCartRequest request) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String size = normalizeVariantValue(request.getSize());
        String color = normalizeVariantValue(request.getColor());
        int requestedQuantity = request.getQuantity();

        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProductAndSizeAndColor(cart, product, size, color);
        int currentQuantity = existingItem.map(CartItem::getQuantity).orElse(0);

        if (currentQuantity + requestedQuantity > product.getStock()) {
            throw new InvalidCredentialsException("Requested quantity exceeds available stock");
        }

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + requestedQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setSize(size);
            newItem.setColor(color);
            newItem.setQuantity(requestedQuantity);
            cartItemRepository.save(newItem);
        }
    }

    public List<CartItemResponse> getCartItems() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        return cartItemRepository.findByCart(cart).stream().map(this::convertToResponse).toList();
    }

    public CartSummaryResponse getCartSummary() {
        List<CartItemResponse> items = getCartItems();
        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_LIMIT) >= 0 ? BigDecimal.ZERO : SHIPPING_CHARGE;

        CartSummaryResponse summary = new CartSummaryResponse();
        summary.setItems(items);
        summary.setSubtotal(subtotal);
        summary.setShipping(shipping);
        summary.setTotal(subtotal.add(shipping));
        summary.setItemCount(items.stream().mapToInt(CartItemResponse::getQuantity).sum());
        return summary;
    }

    @Transactional
    public void updateQuantity(Integer cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        User user = getCurrentUser();
        if (!item.getCart().getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidCredentialsException("Not authorized to modify this cart");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return;
        }

        if (quantity > item.getProduct().getStock()) {
            throw new InvalidCredentialsException("Requested quantity exceeds available stock");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    @Transactional
    public void removeCartItem(Integer cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        User user = getCurrentUser();
        if (!item.getCart().getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidCredentialsException("Not authorized to remove this cart item");
        }

        cartItemRepository.delete(item);
    }

    public int getCartItemCount() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser_UserId(user.getUserId());
        if (cart == null) {
            return 0;
        }
        return cartItemRepository.findByCart(cart).stream().mapToInt(CartItem::getQuantity).sum();
    }

    private CartItemResponse convertToResponse(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setCartItemId(item.getCartItemId());
        response.setProductId(item.getProduct().getProductId());
        response.setProductName(item.getProduct().getName());
        response.setSize(normalizeVariantValue(item.getSize()));
        response.setColor(normalizeVariantValue(item.getColor()));
        response.setPrice(item.getProduct().getPrice());
        response.setQuantity(item.getQuantity());
        response.setTotalPrice(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

        List<ProductImage> images = productImageRepository.findByProduct_ProductId(item.getProduct().getProductId());
        response.setProductImage(images.isEmpty()
                ? "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600"
                : images.get(0).getImageUrl());
        return response;
    }

    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        cartItemRepository.deleteAll(cartItems);
    }

    private String normalizeVariantValue(String value) {
        if (value == null || value.isBlank()) {
            return "Standard";
        }
        return value.trim();
    }
}
