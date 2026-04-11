package edu.cit.monteclaro.vetease.settings.dto;

import java.time.LocalTime;

public record ClinicSettingsDto(
    LocalTime openingTime,
    LocalTime closingTime,
    Integer slotMinutes
) {
}
