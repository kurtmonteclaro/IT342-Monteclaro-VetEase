package edu.cit.monteclaro.vetease.auth.service;

import edu.cit.monteclaro.vetease.auth.dto.AuthResponse;
import edu.cit.monteclaro.vetease.auth.dto.LoginRequest;
import edu.cit.monteclaro.vetease.auth.dto.RegisterRequest;
import edu.cit.monteclaro.vetease.auth.exception.EmailAlreadyRegisteredException;
import edu.cit.monteclaro.vetease.auth.exception.InvalidCredentialsException;
import edu.cit.monteclaro.vetease.auth.model.User;
import edu.cit.monteclaro.vetease.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyRegisteredException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);
        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), "Registration successful");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), "Login successful");
    }
}
