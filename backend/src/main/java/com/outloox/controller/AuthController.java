package com.outloox.controller;

import com.outloox.dto.ForgotPasswordRequest;
import com.outloox.dto.LoginRequest;
import com.outloox.dto.LoginResponse;
import com.outloox.dto.RegisterRequest;
import com.outloox.dto.RegisterResponse;
import com.outloox.dto.ResetPasswordRequest;
import com.outloox.security.AuthCookieFactory;
import com.outloox.service.AuthService;
import com.outloox.service.PasswordResetService;
import com.outloox.service.RegisterService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final RegisterService registerService;
    private final PasswordResetService passwordResetService;
    private final AuthCookieFactory authCookieFactory;

    public AuthController(
            AuthService authService,
            RegisterService registerService,
            PasswordResetService passwordResetService,
            AuthCookieFactory authCookieFactory
    ) {
        this.authService = authService;
        this.registerService = registerService;
        this.passwordResetService = passwordResetService;
        this.authCookieFactory = authCookieFactory;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginResponse login = authService.login(request);
        response.addHeader(HttpHeaders.SET_COOKIE, authCookieFactory.buildAuthCookie(login.getToken()).toString());
        return ResponseEntity.ok(login);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(registerService.register(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(HttpServletRequest request) {
        return ResponseEntity.ok(authService.verifyToken(extractJwtToken(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, authCookieFactory.buildLogoutCookie().toString());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "If the email exists, a password reset email has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    private String extractJwtToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if ("JWT_TOKEN".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
