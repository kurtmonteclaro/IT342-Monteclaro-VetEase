package edu.cit.monteclaro.vetease.appointment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateAppointmentRequest(
    @NotNull(message = "Pet is required")
    Long petId,
    @NotNull(message = "Service is required")
    Long serviceId,
    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or later")
    LocalDate date,
    @NotNull(message = "Time is required")
    LocalTime time,
    String notes
) {
}
