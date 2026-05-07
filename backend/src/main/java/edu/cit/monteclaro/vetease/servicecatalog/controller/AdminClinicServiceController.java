package edu.cit.monteclaro.vetease.servicecatalog.controller;

import edu.cit.monteclaro.vetease.servicecatalog.dto.ClinicServiceDto;
import edu.cit.monteclaro.vetease.servicecatalog.dto.ClinicServiceRequest;
import edu.cit.monteclaro.vetease.servicecatalog.service.ClinicServiceCatalogService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/services")
public class AdminClinicServiceController {

    private final ClinicServiceCatalogService clinicServiceCatalogService;

    public AdminClinicServiceController(ClinicServiceCatalogService clinicServiceCatalogService) {
        this.clinicServiceCatalogService = clinicServiceCatalogService;
    }

    @GetMapping
    public List<ClinicServiceDto> list() {
        return clinicServiceCatalogService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClinicServiceDto create(@Valid @RequestBody ClinicServiceRequest request) {
        return clinicServiceCatalogService.create(request);
    }

    @PutMapping("/{id}")
    public ClinicServiceDto update(@PathVariable Long id, @Valid @RequestBody ClinicServiceRequest request) {
        return clinicServiceCatalogService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ClinicServiceDto deactivate(@PathVariable Long id) {
        return clinicServiceCatalogService.deactivate(id);
    }
}
