package com.outloox.service;

import com.outloox.dto.RegisterRequest;
import com.outloox.dto.RegisterResponse;
import com.outloox.entity.Cart;
import com.outloox.entity.enums.Role;
import com.outloox.entity.User;
import com.outloox.exception.UserAlreadyExistsException;
import com.outloox.repository.CartRepository;
import com.outloox.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public RegisterService(
            UserRepository userRepository,
            CartRepository cartRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsernameAndDeletedAtIsNull(username)) {
            throw new UserAlreadyExistsException("Username already taken. Please try a different one.");
        }

        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new UserAlreadyExistsException("Email already registered. Please try to login.");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        Cart cart = new Cart();
        cart.setUser(savedUser);
        cartRepository.save(cart);

        emailService.sendWelcomeEmail(savedUser);

        RegisterResponse response = new RegisterResponse();
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());
        return response;
    }
}
