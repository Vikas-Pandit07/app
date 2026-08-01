package com.outloox.service;

import com.outloox.dto.ForgotPasswordRequest;
import com.outloox.dto.ResetPasswordRequest;
import com.outloox.entity.PasswordResetToken;
import com.outloox.entity.User;
import com.outloox.exception.InvalidCredentialsException;
import com.outloox.repository.PasswordResetTokenRepository;
import com.outloox.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);

        // Prevent account enumeration by returning success even when the account is missing.
        if (user == null) {
            return;
        }

        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        sendResetEmail(user.getEmail(), resetToken.getToken());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("Passwords do not match");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset token has expired");
        }

        if (resetToken.isUsed()) {
            throw new InvalidCredentialsException("Reset token already used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    private void sendResetEmail(String toEmail, String token) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("OUTLOOX - Password Reset");
            message.setText(
                    "Hello,\n\n" +
                            "You requested to reset your OUTLOOX account password.\n\n" +
                            "Reset your password using the link below:\n" +
                            resetLink + "\n\n" +
                            "This link will expire in 24 hours.\n\n" +
                            "If you did not request this reset, you can safely ignore this email.\n\n" +
                            "Regards,\nOUTLOOX Team"
            );
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send password reset email", ex);
        }
    }
}
