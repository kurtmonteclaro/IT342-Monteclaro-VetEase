package edu.cit.monteclaro.vetease.servicecatalog.controller;

import edu.cit.monteclaro.vetease.servicecatalog.dto.ClinicServiceDto;
import edu.cit.monteclaro.vetease.servicecatalog.service.ClinicServiceCatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/services")
public class ClinicServiceController {

    private final ClinicServiceCatalogService clinicServiceCatalogService;

    public ClinicServiceController(ClinicServiceCatalogService clinicServiceCatalogService) {
        this.clinicServiceCatalogService = clinicServiceCatalogService;
    }

    @GetMapping
    public List<ClinicServiceDto> list() {
        return clinicServiceCatalogService.findActive();
    }
}
