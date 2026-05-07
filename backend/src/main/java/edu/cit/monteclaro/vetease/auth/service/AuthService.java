package edu.cit.monteclaro.vetease.auth.service;

import edu.cit.monteclaro.vetease.auth.dto.AuthResponse;
import edu.cit.monteclaro.vetease.auth.dto.GoogleOAuthRequest;
import edu.cit.monteclaro.vetease.auth.dto.LoginRequest;
import edu.cit.monteclaro.vetease.auth.dto.RegisterRequest;
import edu.cit.monteclaro.vetease.auth.dto.UserDto;
import edu.cit.monteclaro.vetease.auth.exception.EmailAlreadyRegisteredException;
import edu.cit.monteclaro.vetease.auth.exception.InvalidCredentialsException;
import edu.cit.monteclaro.vetease.auth.model.User;
import edu.cit.monteclaro.vetease.auth.model.UserRole;
import edu.cit.monteclaro.vetease.auth.repository.UserRepository;
import edu.cit.monteclaro.vetease.common.ConflictException;
import edu.cit.monteclaro.vetease.common.BadRequestException;
import edu.cit.monteclaro.vetease.notification.EmailService;
import edu.cit.monteclaro.vetease.auth.security.JwtService;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final RestClient restClient;
    private final String googleClientId;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        EmailService emailService,
        RestClient.Builder restClientBuilder,
        @Value("${google.oauth.client-id:}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.restClient = restClientBuilder.build();
        this.googleClientId = googleClientId;
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
        emailService.sendWelcomeEmail(saved);
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

    @Transactional
    public AuthResponse googleOAuth(GoogleOAuthRequest request) {
        GoogleProfile profile = verifyGoogleToken(request.idToken());
        User user = userRepository.findByEmailIgnoreCase(profile.email())
            .orElseGet(() -> createGoogleUser(profile));
        return new AuthResponse(jwtService.generateToken(user), toDto(user), "Google login successful");
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

    private User createGoogleUser(GoogleProfile profile) {
        User user = new User();
        user.setEmail(profile.email().toLowerCase());
        user.setUsername(uniqueUsername(profile.email().substring(0, profile.email().indexOf("@"))));
        user.setFirstName(profile.firstName());
        user.setLastName(profile.lastName());
        String displayName = "%s %s".formatted(profile.firstName(), profile.lastName()).trim();
        user.setDisplayName(displayName.isBlank() ? profile.email() : displayName);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(UserRole.CLIENT);
        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved);
        return saved;
    }

    private String uniqueUsername(String baseUsername) {
        String normalized = baseUsername.toLowerCase().replaceAll("[^a-z0-9_.-]", "");
        if (normalized.length() < 3) {
            normalized = "google_user";
        }
        String candidate = normalized;
        int suffix = 1;
        while (userRepository.existsByUsernameIgnoreCase(candidate)) {
            candidate = normalized + suffix;
            suffix++;
        }
        return candidate;
    }

    private GoogleProfile verifyGoogleToken(String idToken) {
        try {
            Map<String, Object> tokenInfo = restClient.get()
                .uri("https://oauth2.googleapis.com/tokeninfo?id_token={idToken}", idToken)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });

            if (tokenInfo == null || !"true".equals(String.valueOf(tokenInfo.get("email_verified")))) {
                throw new BadRequestException("Google email is not verified");
            }
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(String.valueOf(tokenInfo.get("aud")))) {
                throw new BadRequestException("Google token audience does not match this application");
            }

            String email = String.valueOf(tokenInfo.get("email"));
            String firstName = String.valueOf(tokenInfo.getOrDefault("given_name", "Google"));
            String lastName = String.valueOf(tokenInfo.getOrDefault("family_name", "User"));
            if (email == null || email.isBlank() || "null".equals(email)) {
                throw new BadRequestException("Google token did not include an email");
            }
            return new GoogleProfile(email, firstName, lastName);
        } catch (HttpClientErrorException exception) {
            throw new BadRequestException("Google rejected the ID token. Check your OAuth client ID and authorized origins.");
        } catch (RestClientResponseException exception) {
            throw new BadRequestException("Google token verification failed. Check your OAuth client ID and try signing in again.");
        } catch (RestClientException exception) {
            throw new BadRequestException("Could not verify Google token");
        }
    }

    private record GoogleProfile(String email, String firstName, String lastName) {}
}
