package edu.cit.monteclaro.vetease.pet.dto;

public record PetDto(
    Long id,
    String name,
    String species,
    String breed,
    Integer age,
    String notes,
    String vaccineHistory
) {
}
