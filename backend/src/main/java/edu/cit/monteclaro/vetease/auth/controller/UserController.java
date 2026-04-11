package edu.cit.monteclaro.vetease.auth.controller;

import edu.cit.monteclaro.vetease.auth.dto.UserDto;
import edu.cit.monteclaro.vetease.auth.service.AuthService;
import edu.cit.monteclaro.vetease.auth.service.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final CurrentUserService currentUserService;
    private final AuthService authService;

    public UserController(CurrentUserService currentUserService, AuthService authService) {
        this.currentUserService = currentUserService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public UserDto me() {
        return authService.toDto(currentUserService.requireCurrentUser());
    }
}
