package edu.cit.monteclaro.vetease.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.cit.monteclaro.vetease.auth.dto.AuthResponse;
import edu.cit.monteclaro.vetease.auth.exception.EmailAlreadyRegisteredException;
import edu.cit.monteclaro.vetease.auth.exception.InvalidCredentialsException;
import edu.cit.monteclaro.vetease.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void registerReturnsCreated() throws Exception {
        when(authService.register(any())).thenReturn(new AuthResponse(1L, "Jane Doe", "jane@example.com", "Registration successful"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Jane Doe",
                      "email": "jane@example.com",
                      "password": "Password123"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void registerReturnsConflictForDuplicateEmail() throws Exception {
        when(authService.register(any())).thenThrow(new EmailAlreadyRegisteredException("Email is already registered"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Jane Doe",
                      "email": "jane@example.com",
                      "password": "Password123"
                    }
                    """))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    void loginReturnsUnauthorizedForInvalidCredentials() throws Exception {
        when(authService.login(any())).thenThrow(new InvalidCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "jane@example.com",
                      "password": "bad-password"
                    }
                    """))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void loginReturnsSuccess() throws Exception {
        when(authService.login(any())).thenReturn(new AuthResponse(1L, "Jane Doe", "jane@example.com", "Login successful"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "jane@example.com",
                      "password": "Password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Login successful"));
    }
}
