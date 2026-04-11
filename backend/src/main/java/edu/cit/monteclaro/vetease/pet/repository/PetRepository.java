package edu.cit.monteclaro.vetease.pet.repository;

import edu.cit.monteclaro.vetease.pet.model.Pet;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwnerIdOrderByNameAsc(Long ownerId);
}
