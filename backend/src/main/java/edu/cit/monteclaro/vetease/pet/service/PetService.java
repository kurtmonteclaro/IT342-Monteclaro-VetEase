package edu.cit.monteclaro.vetease.pet.service;

import edu.cit.monteclaro.vetease.auth.model.User;
import edu.cit.monteclaro.vetease.auth.service.CurrentUserService;
import edu.cit.monteclaro.vetease.common.ForbiddenOperationException;
import edu.cit.monteclaro.vetease.common.NotFoundException;
import edu.cit.monteclaro.vetease.pet.dto.PetDto;
import edu.cit.monteclaro.vetease.pet.dto.PetRequest;
import edu.cit.monteclaro.vetease.pet.model.Pet;
import edu.cit.monteclaro.vetease.pet.repository.PetRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final CurrentUserService currentUserService;

    public PetService(PetRepository petRepository, CurrentUserService currentUserService) {
        this.petRepository = petRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<PetDto> findMine() {
        User user = currentUserService.requireCurrentUser();
        return petRepository.findByOwnerIdOrderByNameAsc(user.getId()).stream().map(this::toDto).toList();
    }

    @Transactional
    public PetDto create(PetRequest request) {
        User owner = currentUserService.requireCurrentUser();
        Pet pet = new Pet();
        apply(pet, request);
        pet.setOwner(owner);
        return toDto(petRepository.save(pet));
    }

    @Transactional
    public PetDto update(Long id, PetRequest request) {
        Pet pet = requireOwnedPet(id);
        apply(pet, request);
        return toDto(petRepository.save(pet));
    }

    @Transactional
    public void delete(Long id) {
        petRepository.delete(requireOwnedPet(id));
    }

    @Transactional(readOnly = true)
    public Pet requireOwnedPet(Long id) {
        User user = currentUserService.requireCurrentUser();
        Pet pet = petRepository.findById(id).orElseThrow(() -> new NotFoundException("Pet not found"));
        if (!pet.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You can only manage your own pets");
        }
        return pet;
    }

    public PetDto toDto(Pet pet) {
        return new PetDto(
            pet.getId(),
            pet.getName(),
            pet.getSpecies(),
            pet.getBreed(),
            pet.getAge(),
            pet.getNotes(),
            pet.getVaccineHistory()
        );
    }

    private void apply(Pet pet, PetRequest request) {
        pet.setName(request.name().trim());
        pet.setSpecies(request.species().trim());
        pet.setBreed(request.breed().trim());
        pet.setAge(request.age());
        pet.setNotes(normalizeOptional(request.notes()));
        pet.setVaccineHistory(normalizeOptional(request.vaccineHistory()));
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
