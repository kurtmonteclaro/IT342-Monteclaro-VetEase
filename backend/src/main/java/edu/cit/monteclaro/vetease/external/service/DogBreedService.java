package edu.cit.monteclaro.vetease.external.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class DogBreedService {

    private static final String BREEDS_URL = "https://dog.ceo/api/breeds/list/all";
    private static final List<String> FALLBACK_BREEDS = List.of(
        "Aspin",
        "Beagle",
        "Chihuahua",
        "Dachshund",
        "German Shepherd",
        "Golden Retriever",
        "Labrador Retriever",
        "Poodle",
        "Pomeranian",
        "Shih Tzu",
        "Siberian Husky"
    );

    private final RestClient restClient;

    public DogBreedService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public List<String> getDogBreeds() {
        try {
            DogBreedApiResponse response = restClient.get()
                .uri(BREEDS_URL)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(new ParameterizedTypeReference<DogBreedApiResponse>() {
                });

            if (response == null || response.message() == null || response.message().isEmpty()) {
                return FALLBACK_BREEDS;
            }

            TreeSet<String> breeds = new TreeSet<>();
            response.message().forEach((breed, subBreeds) -> addBreedNames(breeds, breed, subBreeds));
            return new ArrayList<>(breeds);
        } catch (RestClientException exception) {
            return FALLBACK_BREEDS;
        }
    }

    private void addBreedNames(TreeSet<String> breeds, String breed, List<String> subBreeds) {
        if (subBreeds == null || subBreeds.isEmpty()) {
            breeds.add(toTitleCase(breed));
            return;
        }

        for (String subBreed : subBreeds) {
            breeds.add("%s %s".formatted(toTitleCase(subBreed), toTitleCase(breed)));
        }
    }

    private String toTitleCase(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        String[] words = value.replace('-', ' ').split("\\s+");
        List<String> formattedWords = new ArrayList<>();
        for (String word : words) {
            if (!word.isBlank()) {
                formattedWords.add(word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase());
            }
        }
        return String.join(" ", formattedWords);
    }

    private record DogBreedApiResponse(
        Map<String, List<String>> message,
        String status
    ) {
        DogBreedApiResponse {
            if (message == null) {
                message = Collections.emptyMap();
            }
        }
    }
}
