package edu.cit.monteclaro.vetease.pet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record PetRequest(
    @NotBlank(message = "Pet name is required")
    String name,
    @NotBlank(message = "Species is required")
    String species,
    @NotBlank(message = "Breed is required")
    String breed,
    @Min(value = 0, message = "Age must be zero or higher")
    Integer age,
    String notes,
    String vaccineHistory
) {
}
