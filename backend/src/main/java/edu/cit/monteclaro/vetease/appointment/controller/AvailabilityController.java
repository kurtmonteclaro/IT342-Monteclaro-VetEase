package edu.cit.monteclaro.vetease.appointment.controller;

import edu.cit.monteclaro.vetease.appointment.service.AvailabilityService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public List<LocalTime> list(@RequestParam LocalDate date, @RequestParam Long serviceId) {
        return availabilityService.getAvailableSlots(date, serviceId);
    }
}
