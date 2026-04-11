package edu.cit.monteclaro.vetease.pet.controller;

import edu.cit.monteclaro.vetease.pet.dto.PetDto;
import edu.cit.monteclaro.vetease.pet.dto.PetRequest;
import edu.cit.monteclaro.vetease.pet.service.PetService;
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
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<PetDto> list() {
        return petService.findMine();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PetDto create(@Valid @RequestBody PetRequest request) {
        return petService.create(request);
    }

    @PutMapping("/{id}")
    public PetDto update(@PathVariable Long id, @Valid @RequestBody PetRequest request) {
        return petService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        petService.delete(id);
    }
}
