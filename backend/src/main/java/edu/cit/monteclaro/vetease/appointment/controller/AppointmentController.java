package edu.cit.monteclaro.vetease.appointment.controller;

import edu.cit.monteclaro.vetease.appointment.dto.AppointmentDto;
import edu.cit.monteclaro.vetease.appointment.dto.CreateAppointmentRequest;
import edu.cit.monteclaro.vetease.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/mine")
    public List<AppointmentDto> mine() {
        return appointmentService.findMine();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentDto create(@Valid @RequestBody CreateAppointmentRequest request) {
        return appointmentService.create(request);
    }

    @PostMapping("/{id}/cancel")
    public AppointmentDto cancel(@PathVariable Long id) {
        return appointmentService.cancelMine(id);
    }

    @PostMapping("/{id}/reschedule")
    public AppointmentDto reschedule(@PathVariable Long id, @RequestParam LocalDate date, @RequestParam LocalTime time) {
        return appointmentService.rescheduleMine(id, date, time);
    }
}
