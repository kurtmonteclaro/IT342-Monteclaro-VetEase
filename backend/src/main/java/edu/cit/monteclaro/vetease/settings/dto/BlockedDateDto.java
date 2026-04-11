package edu.cit.monteclaro.vetease.settings.dto;

import java.time.LocalDate;

public record BlockedDateDto(
    Long id,
    LocalDate date
) {
}
