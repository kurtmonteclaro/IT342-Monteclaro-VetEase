package edu.cit.monteclaro.vetease.appointment.service;

import edu.cit.monteclaro.vetease.appointment.dto.AppointmentDto;
import edu.cit.monteclaro.vetease.appointment.dto.CreateAppointmentRequest;
import edu.cit.monteclaro.vetease.appointment.model.Appointment;
import edu.cit.monteclaro.vetease.appointment.model.AppointmentStatus;
import edu.cit.monteclaro.vetease.appointment.repository.AppointmentRepository;
import edu.cit.monteclaro.vetease.auth.model.User;
import edu.cit.monteclaro.vetease.auth.service.CurrentUserService;
import edu.cit.monteclaro.vetease.common.BadRequestException;
import edu.cit.monteclaro.vetease.common.ConflictException;
import edu.cit.monteclaro.vetease.common.ForbiddenOperationException;
import edu.cit.monteclaro.vetease.common.NotFoundException;
import edu.cit.monteclaro.vetease.pet.model.Pet;
import edu.cit.monteclaro.vetease.pet.service.PetService;
import edu.cit.monteclaro.vetease.servicecatalog.model.ClinicService;
import edu.cit.monteclaro.vetease.servicecatalog.service.ClinicServiceCatalogService;
import edu.cit.monteclaro.vetease.settings.model.ClinicSettings;
import edu.cit.monteclaro.vetease.settings.service.ClinicSettingsService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CurrentUserService currentUserService;
    private final PetService petService;
    private final ClinicServiceCatalogService clinicServiceCatalogService;
    private final ClinicSettingsService clinicSettingsService;
    private final AvailabilityService availabilityService;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        CurrentUserService currentUserService,
        PetService petService,
        ClinicServiceCatalogService clinicServiceCatalogService,
        ClinicSettingsService clinicSettingsService,
        AvailabilityService availabilityService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.currentUserService = currentUserService;
        this.petService = petService;
        this.clinicServiceCatalogService = clinicServiceCatalogService;
        this.clinicSettingsService = clinicSettingsService;
        this.availabilityService = availabilityService;
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> findMine() {
        User user = currentUserService.requireCurrentUser();
        return appointmentRepository.findByClientIdOrderByDateAscTimeAsc(user.getId()).stream().map(this::toDto).toList();
    }

    @Transactional
    public AppointmentDto create(CreateAppointmentRequest request) {
        User user = currentUserService.requireCurrentUser();
        Pet pet = petService.requireOwnedPet(request.petId());
        ClinicService service = clinicServiceCatalogService.requireActive(request.serviceId());

        validateSlot(request.date(), request.time(), service);

        Appointment appointment = new Appointment();
        appointment.setClient(user);
        appointment.setPet(pet);
        appointment.setService(service);
        appointment.setDate(request.date());
        appointment.setTime(request.time());
        appointment.setNotes(normalizeOptional(request.notes()));
        appointment.setStatus(AppointmentStatus.PENDING);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto cancelMine(Long id) {
        Appointment appointment = requireOwnedAppointment(id);
        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("This appointment can no longer be cancelled");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto rescheduleMine(Long id, LocalDate date, LocalTime time) {
        Appointment appointment = requireOwnedAppointment(id);
        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("This appointment can no longer be rescheduled");
        }
        validateSlot(date, time, appointment.getService());
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setStatus(AppointmentStatus.PENDING);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> findToday() {
        return appointmentRepository
            .findByDateAndStatusInOrderByTimeAsc(LocalDate.now(), EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED))
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> findPending() {
        return appointmentRepository.findByStatusAndDateGreaterThanEqualOrderByDateAscTimeAsc(AppointmentStatus.PENDING, LocalDate.now())
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public AppointmentDto confirm(Long id) {
        Appointment appointment = requireAppointment(id);
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BadRequestException("Only pending appointments can be confirmed");
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto complete(Long id) {
        Appointment appointment = requireAppointment(id);
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BadRequestException("Only confirmed appointments can be completed");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto adminCancel(Long id) {
        Appointment appointment = requireAppointment(id);
        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("This appointment can no longer be cancelled");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(appointment));
    }

    private Appointment requireAppointment(Long id) {
        return appointmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Appointment not found"));
    }

    private Appointment requireOwnedAppointment(Long id) {
        User user = currentUserService.requireCurrentUser();
        Appointment appointment = requireAppointment(id);
        if (!appointment.getClient().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You can only manage your own appointments");
        }
        return appointment;
    }

    private void validateSlot(LocalDate date, LocalTime time, ClinicService service) {
        if (clinicSettingsService.isBlocked(date)) {
            throw new ConflictException("Selected date is blocked");
        }

        ClinicSettings settings = clinicSettingsService.getSettingsEntity();
        if (time.isBefore(settings.getOpeningTime()) || time.plusMinutes(service.getDurationMinutes()).isAfter(settings.getClosingTime())) {
            throw new BadRequestException("Selected time is outside clinic hours");
        }

        if (!availabilityService.getAvailableSlots(date, service.getId()).contains(time)) {
            throw new ConflictException("Selected slot is no longer available");
        }
    }

    public AppointmentDto toDto(Appointment appointment) {
        return new AppointmentDto(
            appointment.getId(),
            appointment.getDate(),
            appointment.getTime(),
            appointment.getStatus(),
            appointment.getNotes(),
            new AppointmentDto.PetSummaryDto(appointment.getPet().getId(), appointment.getPet().getName()),
            new AppointmentDto.ServiceSummaryDto(appointment.getService().getId(), appointment.getService().getName()),
            new AppointmentDto.UserSummaryDto(
                appointment.getClient().getId(),
                appointment.getClient().getUsername(),
                appointment.getClient().getFirstName(),
                appointment.getClient().getLastName()
            )
        );
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
