package edu.cit.monteclaro.vetease.auth.dto;

public record AuthResponse(
    Long id,
    String name,
    String email,
    String message
) {
}
