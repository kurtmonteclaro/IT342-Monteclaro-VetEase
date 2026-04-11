package edu.cit.monteclaro.vetease.auth.service;

import edu.cit.monteclaro.vetease.auth.dto.AuthResponse;
import edu.cit.monteclaro.vetease.auth.dto.LoginRequest;
import edu.cit.monteclaro.vetease.auth.dto.RegisterRequest;
import edu.cit.monteclaro.vetease.auth.dto.UserDto;
import edu.cit.monteclaro.vetease.auth.exception.EmailAlreadyRegisteredException;
import edu.cit.monteclaro.vetease.auth.exception.InvalidCredentialsException;
import edu.cit.monteclaro.vetease.auth.model.User;
import edu.cit.monteclaro.vetease.auth.model.UserRole;
import edu.cit.monteclaro.vetease.auth.repository.UserRepository;
import edu.cit.monteclaro.vetease.common.ConflictException;
import edu.cit.monteclaro.vetease.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedUsername = request.username().trim().toLowerCase();
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new ConflictException("Username is already registered");
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyRegisteredException("Email is already registered");
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setDisplayName("%s %s".formatted(request.firstName().trim(), request.lastName().trim()).trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role() == null ? UserRole.CLIENT : request.role());

        User saved = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(saved), toDto(saved), "Registration successful");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedUsername = request.username().trim().toLowerCase();
        User user = userRepository.findByUsernameIgnoreCase(normalizedUsername)
            .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return new AuthResponse(jwtService.generateToken(user), toDto(user), "Login successful");
    }

    public UserDto toDto(User user) {
        return new UserDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName() != null ? user.getFirstName() : user.getDisplayName(),
            user.getLastName() != null ? user.getLastName() : "",
            user.getRole() != null ? user.getRole() : UserRole.CLIENT
        );
    }
}
