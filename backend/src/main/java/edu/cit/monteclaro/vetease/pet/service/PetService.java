package edu.cit.monteclaro.vetease.pet.service;

import edu.cit.monteclaro.vetease.auth.model.User;
import edu.cit.monteclaro.vetease.auth.model.UserRole;
import edu.cit.monteclaro.vetease.auth.service.CurrentUserService;
import edu.cit.monteclaro.vetease.common.ForbiddenOperationException;
import edu.cit.monteclaro.vetease.common.NotFoundException;
import edu.cit.monteclaro.vetease.pet.dto.PetDto;
import edu.cit.monteclaro.vetease.pet.dto.PetRequest;
import edu.cit.monteclaro.vetease.pet.model.Pet;
import edu.cit.monteclaro.vetease.pet.repository.PetRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final CurrentUserService currentUserService;
    private final Path uploadDirectory;

    public PetService(
        PetRepository petRepository,
        CurrentUserService currentUserService,
        @Value("${vetease.upload-dir:uploads/pets}") String uploadDirectory
    ) {
        this.petRepository = petRepository;
        this.currentUserService = currentUserService;
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    @Transactional(readOnly = true)
    public List<PetDto> findMine() {
        requireClientUser();
        User user = currentUserService.requireCurrentUser();
        return petRepository.findByOwnerIdOrderByNameAsc(user.getId()).stream().map(this::toDto).toList();
    }

    @Transactional
    public PetDto create(PetRequest request) {
        requireClientUser();
        User owner = currentUserService.requireCurrentUser();
        Pet pet = new Pet();
        apply(pet, request);
        pet.setOwner(owner);
        return toDto(petRepository.save(pet));
    }

    @Transactional
    public PetDto update(Long id, PetRequest request) {
        requireClientUser();
        Pet pet = requireOwnedPet(id);
        apply(pet, request);
        return toDto(petRepository.save(pet));
    }

    @Transactional
    public void delete(Long id) {
        requireClientUser();
        petRepository.delete(requireOwnedPet(id));
    }

    @Transactional
    public PetDto uploadPhoto(Long id, MultipartFile file) {
        requireClientUser();
        Pet pet = requireOwnedPet(id);
        validatePhoto(file);

        try {
            Files.createDirectories(uploadDirectory);
            String extension = extensionFor(file.getContentType());
            String fileName = "pet-%d-%s.%s".formatted(pet.getId(), UUID.randomUUID(), extension);
            Path target = uploadDirectory.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            pet.setPhotoUrl("/uploads/pets/" + fileName);
            return toDto(petRepository.save(pet));
        } catch (IOException exception) {
            throw new edu.cit.monteclaro.vetease.common.BadRequestException("Could not store pet photo");
        }
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
            pet.getVaccineHistory(),
            pet.getPhotoUrl()
        );
    }

    private void validatePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new edu.cit.monteclaro.vetease.common.BadRequestException("Image file is required");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new edu.cit.monteclaro.vetease.common.BadRequestException("Image file must be 5MB or smaller");
        }
        String contentType = file.getContentType();
        if (!Set.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
            throw new edu.cit.monteclaro.vetease.common.BadRequestException("Only JPG, PNG, and WEBP images are allowed");
        }
    }

    private String extensionFor(String contentType) {
        return switch (String.valueOf(contentType).toLowerCase(Locale.ROOT)) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
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

    private void requireClientUser() {
        User user = currentUserService.requireCurrentUser();
        if (user.getRole() != UserRole.CLIENT) {
            throw new ForbiddenOperationException("Only pet owners can manage pets");
        }
    }
}
