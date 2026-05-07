package edu.cit.monteclaro.vetease.servicecatalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClinicServiceRequest(
    @NotBlank(message = "Service name is required")
    String name,
    @NotBlank(message = "Description is required")
    String description,
    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    Integer durationMinutes,
    Boolean active
) {
}
