package edu.cit.monteclaro.vetease.servicecatalog.dto;

public record ClinicServiceDto(
    Long id,
    String name,
    String description,
    Integer durationMinutes,
    boolean active
) {
}
