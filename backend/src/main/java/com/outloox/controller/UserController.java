package com.outloox.controller;

import com.outloox.dto.ChangePasswordRequest;
import com.outloox.dto.UpdateProfileRequest;
import com.outloox.security.AuthCookieFactory;
import com.outloox.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}", allowCredentials = "true")
public class UserController {

    private final UserService userService;
    private final AuthCookieFactory authCookieFactory;

    public UserController(UserService userService, AuthCookieFactory authCookieFactory) {
        this.userService = userService;
        this.authCookieFactory = authCookieFactory;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletResponse response
    ) {
        Optional<String> maybeNewToken = userService.updateProfile(request);
        maybeNewToken.ifPresent(token -> response.addHeader(HttpHeaders.SET_COOKIE, authCookieFactory.buildAuthCookie(token).toString()));
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/check-role")
    public ResponseEntity<?> checkRole() {
        return ResponseEntity.ok(userService.checkRole());
    }
}
