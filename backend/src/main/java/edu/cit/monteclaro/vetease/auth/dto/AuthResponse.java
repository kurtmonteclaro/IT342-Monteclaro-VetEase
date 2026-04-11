package edu.cit.monteclaro.vetease.auth.dto;

public record AuthResponse(
    String accessToken,
    UserDto user,
    String message
) {
}
