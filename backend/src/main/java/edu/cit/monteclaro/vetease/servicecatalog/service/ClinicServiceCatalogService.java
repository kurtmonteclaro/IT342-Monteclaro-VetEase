package edu.cit.monteclaro.vetease.servicecatalog.service;

import edu.cit.monteclaro.vetease.common.NotFoundException;
import edu.cit.monteclaro.vetease.servicecatalog.dto.ClinicServiceDto;
import edu.cit.monteclaro.vetease.servicecatalog.model.ClinicService;
import edu.cit.monteclaro.vetease.servicecatalog.repository.ClinicServiceRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClinicServiceCatalogService {

    private final ClinicServiceRepository clinicServiceRepository;

    public ClinicServiceCatalogService(ClinicServiceRepository clinicServiceRepository) {
        this.clinicServiceRepository = clinicServiceRepository;
    }

    @Transactional(readOnly = true)
    public List<ClinicServiceDto> findActive() {
        return clinicServiceRepository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ClinicService requireActive(Long id) {
        ClinicService clinicService = clinicServiceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Service not found"));
        if (!clinicService.isActive()) {
            throw new NotFoundException("Service is not active");
        }
        return clinicService;
    }

    public ClinicServiceDto toDto(ClinicService clinicService) {
        return new ClinicServiceDto(
            clinicService.getId(),
            clinicService.getName(),
            clinicService.getDescription(),
            clinicService.getDurationMinutes(),
            clinicService.isActive()
        );
    }
}
