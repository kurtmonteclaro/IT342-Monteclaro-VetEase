package edu.cit.monteclaro.vetease.appointment.dto;

import edu.cit.monteclaro.vetease.appointment.model.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentDto(
    Long id,
    LocalDate date,
    LocalTime time,
    AppointmentStatus status,
    String notes,
    PetSummaryDto pet,
    ServiceSummaryDto service,
    UserSummaryDto client
) {
    public record PetSummaryDto(Long id, String name) {}
    public record ServiceSummaryDto(Long id, String name) {}
    public record UserSummaryDto(Long id, String username, String firstName, String lastName) {}
}
