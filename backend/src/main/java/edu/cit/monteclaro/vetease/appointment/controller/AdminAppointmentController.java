package edu.cit.monteclaro.vetease.appointment.controller;

import edu.cit.monteclaro.vetease.appointment.dto.AppointmentDto;
import edu.cit.monteclaro.vetease.appointment.service.AppointmentService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/appointments")
public class AdminAppointmentController {

    private final AppointmentService appointmentService;

    public AdminAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/today")
    public List<AppointmentDto> today() {
        return appointmentService.findToday();
    }

    @GetMapping("/pending")
    public List<AppointmentDto> pending() {
        return appointmentService.findPending();
    }

    @PostMapping("/{id}/confirm")
    public AppointmentDto confirm(@PathVariable Long id) {
        return appointmentService.confirm(id);
    }

    @PostMapping("/{id}/complete")
    public AppointmentDto complete(@PathVariable Long id) {
        return appointmentService.complete(id);
    }

    @PostMapping("/{id}/cancel")
    public AppointmentDto cancel(@PathVariable Long id) {
        return appointmentService.adminCancel(id);
    }
}
