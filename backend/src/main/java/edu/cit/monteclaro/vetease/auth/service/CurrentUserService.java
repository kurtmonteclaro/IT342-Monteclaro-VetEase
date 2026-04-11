package edu.cit.monteclaro.vetease.auth.service;

import edu.cit.monteclaro.vetease.auth.model.User;
import edu.cit.monteclaro.vetease.auth.repository.UserRepository;
import edu.cit.monteclaro.vetease.common.NotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new NotFoundException("Authenticated user was not found");
        }
        return userRepository.findByUsernameIgnoreCase(authentication.getName())
            .orElseThrow(() -> new NotFoundException("Authenticated user was not found"));
    }
}
