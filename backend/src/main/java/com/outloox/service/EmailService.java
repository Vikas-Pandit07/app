package com.outloox.service;

import com.outloox.entity.Order;
import com.outloox.entity.enums.OrderStatus;
import com.outloox.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String frontendUrl;
    private final String mailFrom;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${spring.mail.from:${spring.mail.username:}}") String mailFrom
    ) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
        this.mailFrom = mailFrom;
    }

    public void sendWelcomeEmail(User user) {
        sendEmail(
                user.getEmail(),
                "Welcome to OUTLOOX",
                "Hello " + user.getUsername() + ",\n\n" +
                        "Welcome to OUTLOOX. Your account is ready and you can now explore the latest drops, save addresses, and track your orders.\n\n" +
                        "Visit: " + frontendUrl + "\n\n" +
                        "Regards,\nOUTLOOX Team"
        );
    }

    public void sendOrderConfirmationEmail(Order order) {
        String body = "Hello " + order.getUser().getUsername() + ",\n\n" +
                "Your OUTLOOX order #" + order.getOrderId() + " has been placed successfully.\n" +
                "Order total: ₹" + order.getTotalAmount() + "\n" +
                "Payment method: " + order.getPaymentMethod() + "\n" +
                "Current status: " + order.getOrderStatus().name() + "\n\n" +
                "You can track your order from your account: " + frontendUrl + "/profile\n\n" +
                "Regards,\nOUTLOOX Team";

        sendEmail(order.getUser().getEmail(), "OUTLOOX Order Confirmation #" + order.getOrderId(), body);
    }

    public void sendPaymentSuccessEmail(Order order) {
        String body = "Hello " + order.getUser().getUsername() + ",\n\n" +
                "We have received your payment for OUTLOOX order #" + order.getOrderId() + ".\n" +
                "Payment status: PAID\n" +
                "Amount: ₹" + order.getTotalAmount() + "\n\n" +
                "You can track your order from your account: " + frontendUrl + "/profile\n\n" +
                "Regards,\nOUTLOOX Team";

        sendEmail(order.getUser().getEmail(), "OUTLOOX Payment Received #" + order.getOrderId(), body);
    }

    public void sendShippingEmail(Order order) {
        String body = "Hello " + order.getUser().getUsername() + ",\n\n" +
                "Good news — your OUTLOOX order #" + order.getOrderId() + " has been shipped.\n" +
                "Current status: " + order.getOrderStatus().name() + "\n\n" +
                "Track your order here: " + frontendUrl + "/profile\n\n" +
                "Regards,\nOUTLOOX Team";

        sendEmail(order.getUser().getEmail(), "OUTLOOX Shipping Update #" + order.getOrderId(), body);
    }

    public void sendOrderStatusEmail(Order order, OrderStatus previousStatus) {
        if (previousStatus != OrderStatus.SHIPPED && order.getOrderStatus() == OrderStatus.SHIPPED) {
            sendShippingEmail(order);
        }
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            log.info("Sending email from {} to {} with subject {}", mailFrom, to, subject);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send email to {} with subject {}. Continuing without email.", to, subject, ex);
        }
    }
}
