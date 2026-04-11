package edu.cit.monteclaro.vetease.config;

import edu.cit.monteclaro.vetease.servicecatalog.model.ClinicService;
import edu.cit.monteclaro.vetease.servicecatalog.repository.ClinicServiceRepository;
import edu.cit.monteclaro.vetease.settings.model.ClinicSettings;
import edu.cit.monteclaro.vetease.settings.repository.ClinicSettingsRepository;
import java.time.LocalTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ClinicServiceRepository clinicServiceRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;

    public DataSeeder(ClinicServiceRepository clinicServiceRepository, ClinicSettingsRepository clinicSettingsRepository) {
        this.clinicServiceRepository = clinicServiceRepository;
        this.clinicSettingsRepository = clinicSettingsRepository;
    }

    @Override
    public void run(String... args) {
        seedServices();
        seedSettings();
    }

    private void seedServices() {
        if (clinicServiceRepository.count() > 0) {
            return;
        }

        clinicServiceRepository.saveAll(List.of(
            service("Check-up", "Routine health assessment for pets.", 30),
            service("Vaccination", "Scheduled vaccine administration and reminders.", 30),
            service("Grooming", "Basic hygiene and grooming session.", 60),
            service("Deworming", "Parasite prevention and treatment visit.", 30),
            service("Consultation", "General consultation for symptoms or concerns.", 45)
        ));
    }

    private void seedSettings() {
        if (clinicSettingsRepository.existsById(1L)) {
            return;
        }

        ClinicSettings settings = new ClinicSettings();
        settings.setId(1L);
        settings.setOpeningTime(LocalTime.of(9, 0));
        settings.setClosingTime(LocalTime.of(17, 0));
        settings.setSlotMinutes(30);
        clinicSettingsRepository.save(settings);
    }

    private ClinicService service(String name, String description, int durationMinutes) {
        ClinicService clinicService = new ClinicService();
        clinicService.setName(name);
        clinicService.setDescription(description);
        clinicService.setDurationMinutes(durationMinutes);
        clinicService.setActive(true);
        return clinicService;
    }
}
