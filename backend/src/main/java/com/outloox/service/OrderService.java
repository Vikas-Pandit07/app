package com.outloox.service;

import com.outloox.dto.AddressResponse;
import com.outloox.dto.CheckoutRequest;
import com.outloox.dto.CheckoutResponse;
import com.outloox.dto.OrderItemResponse;
import com.outloox.dto.OrderResponse;
import com.outloox.entity.Address;
import com.outloox.entity.Cart;
import com.outloox.entity.CartItem;
import com.outloox.entity.Order;
import com.outloox.entity.OrderItem;
import com.outloox.entity.enums.OrderStatus;
import com.outloox.entity.enums.PaymentStatus;
import com.outloox.entity.Product;
import com.outloox.entity.ProductImage;
import com.outloox.entity.User;
import com.outloox.exception.InvalidCredentialsException;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.AddressRepository;
import com.outloox.repository.CartItemRepository;
import com.outloox.repository.OrderItemRepository;
import com.outloox.repository.OrderRepository;
import com.outloox.repository.ProductImageRepository;
import com.outloox.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class OrderService {

    private static final BigDecimal FREE_SHIPPING_LIMIT = BigDecimal.valueOf(999);
    private static final BigDecimal SHIPPING_CHARGE = BigDecimal.valueOf(99);

    private final CartService cartService;
    private final UserService userService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final EmailService emailService;

    public OrderService(
            CartService cartService,
            UserService userService,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            AddressRepository addressRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            EmailService emailService
    ) {
        this.cartService = cartService;
        this.userService = userService;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.addressRepository = addressRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.emailService = emailService;
    }

    @Transactional
    public CheckoutResponse createOrder(CheckoutRequest request) {
        User user = userService.getCurrentUser();
        Cart cart = cartService.getOrCreateCart(user);
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new InvalidCredentialsException("Cart is empty");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidCredentialsException("Address does not belong to user");
        }

        BigDecimal subtotal = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingCharge = subtotal.compareTo(FREE_SHIPPING_LIMIT) >= 0 ? BigDecimal.ZERO : SHIPPING_CHARGE;
        BigDecimal totalAmount = subtotal.add(shippingCharge);

        String paymentMethod = request.getPaymentMethod().trim().toUpperCase(Locale.ROOT);
        boolean isCashOnDelivery = "COD".equals(paymentMethod);

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setAddress(address);
        order.setOrderStatus(isCashOnDelivery ? OrderStatus.PROCESSING : OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setPaymentMethod(paymentMethod);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingCharge(shippingCharge);
        order.setTaxAmount(BigDecimal.ZERO);

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setSize(normalizeVariantValue(cartItem.getSize()));
            orderItem.setColor(normalizeVariantValue(cartItem.getColor()));
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            orderItemRepository.save(orderItem);
        }

        if (isCashOnDelivery) {
            deductStockForOrder(savedOrder);
        }

        cartService.clearCart();

        emailService.sendOrderConfirmationEmail(savedOrder);

        CheckoutResponse response = new CheckoutResponse();
        response.setOrderId(savedOrder.getOrderId());
        response.setTotalAmount(savedOrder.getTotalAmount());
        response.setOrderStatus(savedOrder.getOrderStatus().name());
        response.setPaymentStatus(savedOrder.getPaymentStatus().name());
        response.setMessage(isCashOnDelivery ? "Order placed successfully" : "Order created. Complete payment to confirm it.");
        return response;
    }

    @Transactional
    public void deductStockForOrder(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderId(order.getOrderId());
        for (OrderItem orderItem : orderItems) {
            Product product = productRepository.findByIdForUpdate(orderItem.getProduct().getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (orderItem.getQuantity() > product.getStock()) {
                throw new InvalidCredentialsException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - orderItem.getQuantity());
            productRepository.save(product);
        }
    }

    @Transactional
    public void restoreStockForOrder(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderId(order.getOrderId());
        for (OrderItem orderItem : orderItems) {
            Product product = productRepository.findByIdForUpdate(orderItem.getProduct().getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepository.save(product);
        }
    }

    public List<OrderResponse> getUserOrders() {
        User user = userService.getCurrentUser();
        return orderRepository.findByUserUserId(user.getUserId()).stream().map(this::buildOrderResponse).toList();
    }

    public OrderResponse getOrderById(Integer orderId) {
        User user = userService.getCurrentUser();
        Order order = orderRepository.findByOrderIdAndUserUserId(orderId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return buildOrderResponse(order);
    }

    private OrderResponse buildOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setTotalAmount(order.getTotalAmount());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setOrderDate(order.getOrderDate());

        Address address = order.getAddress();
        AddressResponse addressResponse = new AddressResponse();
        addressResponse.setAddressId(address.getAddressId());
        addressResponse.setFullName(address.getFullName());
        addressResponse.setPhone(address.getPhone());
        addressResponse.setAddressLine(address.getAddressLine());
        addressResponse.setCity(address.getCity());
        addressResponse.setState(address.getState());
        addressResponse.setPinCode(address.getPinCode());
        addressResponse.setCountry(address.getCountry());
        addressResponse.setDefault(address.isDefault());
        response.setShippingAddress(addressResponse);

        List<OrderItemResponse> items = orderItemRepository.findByOrderOrderId(order.getOrderId())
                .stream()
                .map(this::buildOrderItemResponse)
                .toList();
        response.setItems(items);
        return response;
    }

    private OrderItemResponse buildOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setOrderItemId(orderItem.getOrderItemId());
        response.setProductId(orderItem.getProduct().getProductId());
        response.setProductName(orderItem.getProduct().getName());
        response.setProductImage(getPrimaryProductImage(orderItem.getProduct().getProductId()));
        response.setSize(normalizeVariantValue(orderItem.getSize()));
        response.setColor(normalizeVariantValue(orderItem.getColor()));
        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice());
        response.setTotalPrice(orderItem.getTotalPrice());
        return response;
    }

    private String getPrimaryProductImage(Integer productId) {
        List<ProductImage> images = productImageRepository.findByProduct_ProductId(productId);
        return images.isEmpty() ? null : images.get(0).getImageUrl();
    }

    private String normalizeVariantValue(String value) {
        if (value == null || value.isBlank()) {
            return "Standard";
        }
        return value.trim();
    }
}
