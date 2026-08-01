package com.outloox.service;

import com.outloox.dto.ChangePasswordRequest;
import com.outloox.dto.ProfileResponse;
import com.outloox.dto.UpdateProfileRequest;
import com.outloox.entity.User;
import com.outloox.exception.InvalidCredentialsException;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.exception.UserAlreadyExistsException;
import com.outloox.repository.UserRepository;
import com.outloox.security.JwtService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new InvalidCredentialsException("User not authenticated");
        }

        return userRepository.findByUsernameAndActiveTrueAndDeletedAtIsNull(auth.getName())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Integer getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public boolean isAdmin() {
        return "ADMIN".equals(getCurrentUser().getRole().name());
    }

    public ProfileResponse getProfile() {
        User user = getCurrentUser();

        ProfileResponse response = new ProfileResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        DateTimeFormatter fmt = DateTimeFormatter.ISO_DATE;
        response.setJoinDate(user.getCreatedAt() != null
                ? "Member since " + user.getCreatedAt().toLocalDate().format(fmt)
                : "");
        return response;
    }

    public Optional<String> updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (!user.getUsername().equals(username) && userRepository.existsByUsernameAndDeletedAtIsNull(username)) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        if (!user.getEmail().equals(email) && userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        boolean usernameChanged = !user.getUsername().equals(username);
        user.setUsername(username);
        user.setEmail(email);
        userRepository.save(user);

        if (!usernameChanged) {
            return Optional.empty();
        }

        return Optional.of(jwtService.generateToken(user.getUsername()));
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public Map<String, Object> checkRole() {
        User user = getCurrentUser();
        return Map.of(
                "authenticated", true,
                "username", user.getUsername(),
                "isAdmin", "ADMIN".equals(user.getRole().name())
        );
    }
}
