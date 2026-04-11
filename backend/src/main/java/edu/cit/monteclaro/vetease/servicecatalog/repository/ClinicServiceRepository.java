package edu.cit.monteclaro.vetease.servicecatalog.repository;

import edu.cit.monteclaro.vetease.servicecatalog.model.ClinicService;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicServiceRepository extends JpaRepository<ClinicService, Long> {

    List<ClinicService> findByActiveTrueOrderByNameAsc();
}
