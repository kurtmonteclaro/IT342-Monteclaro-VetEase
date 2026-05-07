package edu.cit.monteclaro.vetease.servicecatalog.service;

import edu.cit.monteclaro.vetease.common.ConflictException;
import edu.cit.monteclaro.vetease.common.NotFoundException;
import edu.cit.monteclaro.vetease.servicecatalog.dto.ClinicServiceDto;
import edu.cit.monteclaro.vetease.servicecatalog.dto.ClinicServiceRequest;
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
    public List<ClinicServiceDto> findAll() {
        return clinicServiceRepository.findAllByOrderByNameAsc().stream().map(this::toDto).toList();
    }

    @Transactional
    public ClinicServiceDto create(ClinicServiceRequest request) {
        if (clinicServiceRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new ConflictException("Service name is already used");
        }
        ClinicService clinicService = new ClinicService();
        apply(clinicService, request);
        return toDto(clinicServiceRepository.save(clinicService));
    }

    @Transactional
    public ClinicServiceDto update(Long id, ClinicServiceRequest request) {
        ClinicService clinicService = clinicServiceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Service not found"));
        apply(clinicService, request);
        return toDto(clinicServiceRepository.save(clinicService));
    }

    @Transactional
    public ClinicServiceDto deactivate(Long id) {
        ClinicService clinicService = clinicServiceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Service not found"));
        clinicService.setActive(false);
        return toDto(clinicServiceRepository.save(clinicService));
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

    private void apply(ClinicService clinicService, ClinicServiceRequest request) {
        clinicService.setName(request.name().trim());
        clinicService.setDescription(request.description().trim());
        clinicService.setDurationMinutes(request.durationMinutes());
        clinicService.setActive(request.active() == null || request.active());
    }
}
