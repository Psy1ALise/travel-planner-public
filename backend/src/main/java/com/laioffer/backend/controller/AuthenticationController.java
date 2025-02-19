package com.laioffer.backend.controller;


import com.laioffer.backend.security.JwtHandler;
import com.laioffer.backend.service.AuthenticationService;
import com.laioffer.backend.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JwtHandler jwtHandler;

    public AuthenticationController(AuthenticationService authService, JwtHandler jwtHandler) {
        this.authenticationService = authService;
        this.jwtHandler = jwtHandler;
    }

    public static record RegisterRequest(String username, String email, String password) {}
    public static record LoginRequest(String username, String password) {}
    public static record LoginResponse(String token) {}
    public static record UpdateInfoRequest(Long id, String username, String email, String password) {}
    public static record UserResponse(Long id, String username, String email, String imageUrl,String token) {}
    public static record UpdatePasswordReqeust(Long id, String oldPassword, String newPassword) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(
            @RequestBody RegisterRequest body
    ) {
        authenticationService.register(body.username(), body.email(), body.password());
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest body) {
        String token = authenticationService.login(body.username(), body.password());
        return new LoginResponse(token);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal User user) {
        return new UserResponse(user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getImageUrl(),
                jwtHandler.generateToken(user.getUsername())
        );
    }

    @PutMapping("/updateInfo")
    public ResponseEntity<UserResponse> update(@RequestBody UpdateInfoRequest body) {
        User user = authenticationService.updateInfo(body.id(), body.username(), body.email(), body.password());
        UserResponse userResponse = getCurrentUser(user);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/updatePassword")
    public ResponseEntity<UserResponse> updatePassword(@RequestBody UpdatePasswordReqeust body) {
        User user = authenticationService.updatePassword(body.id(), body.oldPassword(), body.newPassword() );
        UserResponse userResponse = new UserResponse(user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getImageUrl(),
                jwtHandler.generateToken(user.getUsername())
                );
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/updateAvatar")
    public ResponseEntity<UserResponse> updateAvatar(@RequestParam("image") MultipartFile image,
                                                     @RequestParam("username") String username) {
        User user = authenticationService.updateAvatar(username, image);
        UserResponse userResponse = getCurrentUser(user);
        return ResponseEntity.ok(userResponse);
    }

}
