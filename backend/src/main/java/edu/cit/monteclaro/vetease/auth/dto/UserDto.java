package edu.cit.monteclaro.vetease.auth.dto;

import edu.cit.monteclaro.vetease.auth.model.UserRole;

public record UserDto(
    Long id,
    String username,
    String email,
    String firstName,
    String lastName,
    UserRole role
) {
}
