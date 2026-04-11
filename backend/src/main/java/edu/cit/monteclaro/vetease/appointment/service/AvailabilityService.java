package edu.cit.monteclaro.vetease.appointment.service;

import edu.cit.monteclaro.vetease.appointment.model.Appointment;
import edu.cit.monteclaro.vetease.appointment.model.AppointmentStatus;
import edu.cit.monteclaro.vetease.appointment.repository.AppointmentRepository;
import edu.cit.monteclaro.vetease.common.NotFoundException;
import edu.cit.monteclaro.vetease.servicecatalog.model.ClinicService;
import edu.cit.monteclaro.vetease.servicecatalog.repository.ClinicServiceRepository;
import edu.cit.monteclaro.vetease.settings.model.ClinicSettings;
import edu.cit.monteclaro.vetease.settings.service.ClinicSettingsService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AvailabilityService {

    private final ClinicSettingsService clinicSettingsService;
    private final ClinicServiceRepository clinicServiceRepository;
    private final AppointmentRepository appointmentRepository;

    public AvailabilityService(
        ClinicSettingsService clinicSettingsService,
        ClinicServiceRepository clinicServiceRepository,
        AppointmentRepository appointmentRepository
    ) {
        this.clinicSettingsService = clinicSettingsService;
        this.clinicServiceRepository = clinicServiceRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional(readOnly = true)
    public List<LocalTime> getAvailableSlots(LocalDate date, Long serviceId) {
        ClinicService clinicService = clinicServiceRepository.findById(serviceId)
            .orElseThrow(() -> new NotFoundException("Service not found"));

        if (!clinicService.isActive() || clinicSettingsService.isBlocked(date)) {
            return List.of();
        }

        ClinicSettings settings = clinicSettingsService.getSettingsEntity();
        Set<LocalTime> takenTimes = appointmentRepository
            .findByDateAndServiceIdAndStatusIn(date, serviceId, EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED))
            .stream()
            .map(Appointment::getTime)
            .collect(Collectors.toSet());

        java.util.ArrayList<LocalTime> slots = new java.util.ArrayList<>();
        for (LocalTime current = settings.getOpeningTime();
             !current.plusMinutes(clinicService.getDurationMinutes()).isAfter(settings.getClosingTime());
             current = current.plusMinutes(settings.getSlotMinutes())) {
            if (!takenTimes.contains(current)) {
                slots.add(current);
            }
        }
        return slots;
    }
}
