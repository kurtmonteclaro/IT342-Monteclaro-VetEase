package edu.cit.monteclaro.vetease.external.controller;

import edu.cit.monteclaro.vetease.external.service.DogBreedService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/external")
public class ExternalApiController {

    private final DogBreedService dogBreedService;

    public ExternalApiController(DogBreedService dogBreedService) {
        this.dogBreedService = dogBreedService;
    }

    @GetMapping("/dog-breeds")
    public List<String> dogBreeds() {
        return dogBreedService.getDogBreeds();
    }
}
