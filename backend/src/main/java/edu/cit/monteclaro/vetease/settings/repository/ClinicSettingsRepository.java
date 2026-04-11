package edu.cit.monteclaro.vetease.settings.repository;

import edu.cit.monteclaro.vetease.settings.model.ClinicSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Long> {
}
