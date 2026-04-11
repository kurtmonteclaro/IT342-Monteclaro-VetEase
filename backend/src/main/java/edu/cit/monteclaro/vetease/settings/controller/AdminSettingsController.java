package edu.cit.monteclaro.vetease.settings.controller;

import edu.cit.monteclaro.vetease.settings.dto.BlockedDateDto;
import edu.cit.monteclaro.vetease.settings.dto.ClinicSettingsDto;
import edu.cit.monteclaro.vetease.settings.service.ClinicSettingsService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminSettingsController {

    private final ClinicSettingsService clinicSettingsService;

    public AdminSettingsController(ClinicSettingsService clinicSettingsService) {
        this.clinicSettingsService = clinicSettingsService;
    }

    @GetMapping("/settings")
    public ClinicSettingsDto getSettings() {
        return clinicSettingsService.getSettings();
    }

    @PutMapping("/settings")
    public ClinicSettingsDto updateSettings(@RequestBody ClinicSettingsDto request) {
        return clinicSettingsService.updateSettings(request);
    }

    @GetMapping("/blocked-dates")
    public List<BlockedDateDto> listBlockedDates() {
        return clinicSettingsService.listBlockedDates();
    }

    @PostMapping("/blocked-dates")
    public BlockedDateDto addBlockedDate(@RequestParam LocalDate date) {
        return clinicSettingsService.addBlockedDate(date);
    }

    @DeleteMapping("/blocked-dates/{id}")
    public void removeBlockedDate(@PathVariable Long id) {
        clinicSettingsService.removeBlockedDate(id);
    }
}
