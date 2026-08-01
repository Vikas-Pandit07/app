package com.outloox.service;

import com.outloox.dto.PaymentOrderRequest;
import com.outloox.dto.PaymentOrderResponse;
import com.outloox.dto.PaymentVerifyRequest;
import com.outloox.dto.PaymentVerifyResponse;
import com.outloox.entity.Order;
import com.outloox.entity.enums.OrderStatus;
import com.outloox.entity.enums.PaymentStatus;
import com.outloox.entity.User;
import com.outloox.exception.BadRequestException;
import com.outloox.exception.InvalidCredentialsException;
import com.outloox.exception.PaymentGatewayException;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.OrderRepository;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;
    private final UserService userService;
    private final OrderService orderService;
    private final EmailService emailService;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook-secret:}")
    private String razorpayWebhookSecret;

    public PaymentService(
            OrderRepository orderRepository,
            RazorpayClient razorpayClient,
            UserService userService,
            OrderService orderService,
            EmailService emailService
    ) {
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
        this.userService = userService;
        this.orderService = orderService;
        this.emailService = emailService;
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request) {
        User user = userService.getCurrentUser();

        Order order = orderRepository.findByOrderIdAndUserUserId(request.getOrderId(), user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new BadRequestException("Cash on delivery orders do not require a Razorpay payment order");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new InvalidCredentialsException("Order already paid");
        }

        long amountInPaise = amountInPaise(order);

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", "order_" + order.getOrderId());
        options.put("payment_capture", 1);

        try {
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);
            String razorpayOrderId = razorpayOrder.get("id");

            order.setRazorpayOrderId(razorpayOrderId);
            orderRepository.save(order);

            PaymentOrderResponse response = new PaymentOrderResponse();
            response.setKeyId(razorpayKeyId);
            response.setInternalOrderId(order.getOrderId());
            response.setRazorpayOrderId(razorpayOrderId);
            response.setAmount(amountInPaise);
            response.setCurrency("INR");
            return response;
        } catch (Exception e) {
            throw new PaymentGatewayException("Failed to create Razorpay order", e);
        }
    }

    @Transactional
    public PaymentVerifyResponse verifyPayment(PaymentVerifyRequest request) {
        User user = userService.getCurrentUser();

        Order order = orderRepository.findByOrderIdAndUserUserId(request.getInternalOrderId(), user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            PaymentVerifyResponse alreadyPaid = new PaymentVerifyResponse();
            alreadyPaid.setVerified(true);
            alreadyPaid.setMessage("Payment already verified");
            alreadyPaid.setOrderId(order.getOrderId());
            alreadyPaid.setPaymentStatus(order.getPaymentStatus());
            alreadyPaid.setOrderStatus(order.getOrderStatus());
            return alreadyPaid;
        }

        if (order.getRazorpayOrderId() == null || !order.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new InvalidCredentialsException("Invalid Razorpay order id");
        }

        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        String expectedSignature = generateHmacSha256(payload, razorpayKeySecret);

        if (!constantTimeEquals(expectedSignature, request.getRazorpaySignature())) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.PENDING);
            orderRepository.save(order);
            throw new InvalidCredentialsException("Payment signature verification failed");
        }

        try {
            Payment payment = razorpayClient.payments.fetch(request.getRazorpayPaymentId());
            String paymentStatus = payment.get("status");
            String paymentOrderId = payment.get("order_id");
            Number paidAmount = payment.get("amount");
            String currency = payment.get("currency");

            if (!order.getRazorpayOrderId().equals(paymentOrderId)) {
                throw new InvalidCredentialsException("Payment does not belong to this order");
            }

            if (paidAmount == null || paidAmount.longValue() != amountInPaise(order) || !"INR".equalsIgnoreCase(currency)) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setOrderStatus(OrderStatus.PENDING);
                orderRepository.save(order);
                throw new InvalidCredentialsException("Payment amount or currency mismatch");
            }

            if (!("captured".equalsIgnoreCase(paymentStatus) || "authorized".equalsIgnoreCase(paymentStatus))) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setOrderStatus(OrderStatus.PENDING);
                orderRepository.save(order);
                throw new InvalidCredentialsException("Payment is not captured/authorized");
            }
        } catch (InvalidCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new PaymentGatewayException("Unable to verify payment with Razorpay", ex);
        }

        orderService.deductStockForOrder(order);
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setRazorpaySignature(request.getRazorpaySignature());
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        emailService.sendPaymentSuccessEmail(order);

        PaymentVerifyResponse response = new PaymentVerifyResponse();
        response.setVerified(true);
        response.setMessage("Payment verified successfully");
        response.setOrderId(order.getOrderId());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setOrderStatus(order.getOrderStatus());
        return response;
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (razorpayWebhookSecret == null || razorpayWebhookSecret.isBlank()) {
            throw new PaymentGatewayException("Webhook secret is not configured");
        }

        String expectedSignature = generateHmacSha256(payload, razorpayWebhookSecret);
        if (!constantTimeEquals(expectedSignature, signature)) {
            throw new InvalidCredentialsException("Invalid webhook signature");
        }

        JSONObject event = new JSONObject(payload);
        String eventName = event.optString("event", "").toLowerCase(Locale.ROOT);
        JSONObject payloadObject = event.getJSONObject("payload");

        switch (eventName) {
            case "payment.captured" -> handlePaymentCaptured(payloadObject);
            case "payment.failed" -> handlePaymentFailed(payloadObject);
            case "refund.processed" -> handleRefundProcessed(payloadObject);
            default -> {
            }
        }
    }

    @Transactional
    public PaymentVerifyResponse refundPayment(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Only paid orders can be refunded");
        }

        if (order.getRazorpayPaymentId() == null || order.getRazorpayPaymentId().isBlank()) {
            throw new BadRequestException("Refund is only supported for online Razorpay payments");
        }

        try {
            razorpayClient.payments.refund(order.getRazorpayPaymentId(), new JSONObject());
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            order.setOrderStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);
            orderService.restoreStockForOrder(order);

            PaymentVerifyResponse response = new PaymentVerifyResponse();
            response.setVerified(true);
            response.setMessage("Refund initiated successfully");
            response.setOrderId(order.getOrderId());
            response.setPaymentStatus(order.getPaymentStatus());
            response.setOrderStatus(order.getOrderStatus());
            return response;
        } catch (Exception ex) {
            throw new PaymentGatewayException("Failed to initiate refund", ex);
        }
    }

    private void handlePaymentCaptured(JSONObject payloadObject) {
        JSONObject paymentEntity = payloadObject.getJSONObject("payment").getJSONObject("entity");
        String razorpayOrderId = paymentEntity.optString("order_id", null);
        String razorpayPaymentId = paymentEntity.optString("id", null);
        if (razorpayOrderId == null) {
            return;
        }

        orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                return;
            }
            orderService.deductStockForOrder(order);
            order.setRazorpayPaymentId(razorpayPaymentId);
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            emailService.sendPaymentSuccessEmail(order);
        });
    }

    private void handlePaymentFailed(JSONObject payloadObject) {
        JSONObject paymentEntity = payloadObject.getJSONObject("payment").getJSONObject("entity");
        String razorpayOrderId = paymentEntity.optString("order_id", null);
        if (razorpayOrderId == null) {
            return;
        }

        orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.PENDING);
            orderRepository.save(order);
        });
    }

    private void handleRefundProcessed(JSONObject payloadObject) {
        JSONObject refundEntity = payloadObject.getJSONObject("refund").getJSONObject("entity");
        String paymentId = refundEntity.optString("payment_id", null);
        if (paymentId == null) {
            return;
        }

        orderRepository.findByRazorpayPaymentId(paymentId).ifPresent(order -> {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            order.setOrderStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);
        });
    }

    private long amountInPaise(Order order) {
        return order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValueExact();
    }

    private boolean shouldRestoreStockForRefund(Order order) {
        return order.getOrderStatus() != OrderStatus.PENDING
                && order.getOrderStatus() != OrderStatus.CANCELLED
                && order.getOrderStatus() != OrderStatus.REFUNDED;
    }

    private String generateHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return toHex(hash);
        } catch (Exception e) {
            throw new PaymentGatewayException("Failed to compute signature", e);
        }
    }

    private String toHex(byte[] data) {
        StringBuilder builder = new StringBuilder(data.length * 2);
        for (byte b : data) {
            builder.append(String.format("%02x", b));
        }
        return builder.toString();
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
