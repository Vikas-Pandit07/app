package com.outloox.controller;

import com.outloox.dto.PaymentOrderRequest;
import com.outloox.dto.PaymentOrderResponse;
import com.outloox.dto.PaymentVerifyRequest;
import com.outloox.dto.PaymentVerifyResponse;
import com.outloox.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(@Valid @RequestBody PaymentOrderRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentOrder(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerifyResponse> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(
            @RequestBody String payload,
            @RequestHeader(name = "X-Razorpay-Signature", required = false) String signature
    ) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/refund/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentVerifyResponse> refund(@PathVariable Integer orderId) {
        return ResponseEntity.ok(paymentService.refundPayment(orderId));
    }
}
