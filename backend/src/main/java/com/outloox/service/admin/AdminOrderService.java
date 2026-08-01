package com.outloox.service.admin;

import com.outloox.dto.AddressResponse;
import com.outloox.dto.OrderItemResponse;
import com.outloox.dto.admin.AdminOrderResponse;
import com.outloox.entity.Address;
import com.outloox.entity.Order;
import com.outloox.entity.OrderItem;
import com.outloox.entity.enums.OrderStatus;
import com.outloox.entity.enums.PaymentStatus;
import com.outloox.entity.ProductImage;
import com.outloox.exception.BadRequestException;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.OrderItemRepository;
import com.outloox.repository.OrderRepository;
import com.outloox.repository.ProductImageRepository;
import com.outloox.service.EmailService;
import com.outloox.service.OrderService;
import com.outloox.service.PaymentService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final ProductImageRepository productImageRepository;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final EmailService emailService;
    private final OrderItemRepository orderItemRepository;

    public AdminOrderService(
            OrderRepository orderRepository,
            ProductImageRepository productImageRepository,
            OrderService orderService,
            PaymentService paymentService,
            EmailService emailService,
            OrderItemRepository orderItemRepository
    ) {
        this.orderRepository = orderRepository;
        this.productImageRepository = productImageRepository;
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.emailService = emailService;
        this.orderItemRepository = orderItemRepository;
    }

    public List<AdminOrderResponse> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "orderDate")).stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public AdminOrderResponse updateOrderStatus(Integer orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus previousStatus = order.getOrderStatus();
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        validateTransition(previousStatus, newStatus);

        if (newStatus == OrderStatus.CANCELLED && shouldRestoreStock(order)) {
            orderService.restoreStockForOrder(order);
        }

        if (newStatus == OrderStatus.REFUNDED) {
            if (order.getPaymentStatus() == PaymentStatus.PAID && order.getRazorpayPaymentId() != null && !order.getRazorpayPaymentId().isBlank()) {
                paymentService.refundPayment(order.getOrderId());
                order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found after refund"));
            } else {
                if (shouldRestoreStock(order)) {
                    orderService.restoreStockForOrder(order);
                }
                order.setPaymentStatus(PaymentStatus.REFUNDED);
                order.setOrderStatus(OrderStatus.REFUNDED);
                order = orderRepository.save(order);
            }
            return mapToResponse(order);
        }

        order.setOrderStatus(newStatus);
        Order saved = orderRepository.save(order);
        emailService.sendOrderStatusEmail(saved, previousStatus);
        return mapToResponse(saved);
    }

    private void validateTransition(OrderStatus current, OrderStatus target) {
        if (current == target) {
            return;
        }

        Set<OrderStatus> allowedTargets = switch (current) {
            case PENDING -> EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.CANCELLED);
            case CONFIRMED -> EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.REFUNDED);
            case PROCESSING -> EnumSet.of(OrderStatus.PACKED, OrderStatus.CANCELLED, OrderStatus.REFUNDED);
            case PACKED -> EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDED);
            case SHIPPED -> EnumSet.of(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.REFUNDED);
            case OUT_FOR_DELIVERY -> EnumSet.of(OrderStatus.DELIVERED, OrderStatus.REFUNDED);
            case DELIVERED -> EnumSet.of(OrderStatus.REFUNDED, OrderStatus.RETURN_REQUESTED);
            case CANCELLED, REFUNDED, RETURN_REQUESTED, RETURN_APPROVED, RETURN_RECEIVED -> EnumSet.noneOf(OrderStatus.class);
        };

        if (!allowedTargets.contains(target)) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + target);
        }
    }

    private boolean shouldRestoreStock(Order order) {
        return order.getOrderStatus() != OrderStatus.PENDING
                && order.getOrderStatus() != OrderStatus.CANCELLED
                && order.getOrderStatus() != OrderStatus.REFUNDED;
    }

    private AdminOrderResponse mapToResponse(Order order) {
        AdminOrderResponse response = new AdminOrderResponse();
        response.setOrderId(order.getOrderId());
        response.setCustomerUsername(order.getUser().getUsername());
        response.setCustomerEmail(order.getUser().getEmail());
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
        response.setAddress(addressResponse);

        List<OrderItemResponse> items = orderItemRepository.findByOrderOrderId(order.getOrderId())
                .stream()
                .map(this::mapItemToResponse)
                .toList();
        response.setItems(items);
        return response;
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setOrderItemId(item.getOrderItemId());
        response.setProductId(item.getProduct().getProductId());
        response.setProductName(item.getProduct().getName());
        response.setSize(normalizeVariantValue(item.getSize()));
        response.setColor(normalizeVariantValue(item.getColor()));
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setTotalPrice(item.getTotalPrice());

        List<ProductImage> images = productImageRepository.findByProduct_ProductId(item.getProduct().getProductId());
        if (!images.isEmpty()) {
            response.setProductImage(images.get(0).getImageUrl());
        }

        return response;
    }

    private String normalizeVariantValue(String value) {
        if (value == null || value.isBlank()) {
            return "Standard";
        }
        return value.trim();
    }
}
