package com.laioffer.backend.service;

import com.laioffer.backend.entity.User;
import com.laioffer.backend.exception.CustomException;
import com.laioffer.backend.repository.UserRepository;
import com.laioffer.backend.security.JwtHandler;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtHandler jwtHandler;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtHandler jwtHandler,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            ImageStorageService imageStorageService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtHandler = jwtHandler;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.imageStorageService = imageStorageService;
    }

    public void register(String username, String email, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new CustomException("Username already exists!", HttpStatus.BAD_REQUEST.value());
        }

        if (userRepository.existsByEmail(email)) {
            throw new CustomException("Email already exists!", HttpStatus.BAD_REQUEST.value());
        }
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(username, email, encodedPassword,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVA_HrQLjkHiJ2Ag5RGuwbFeDKRLfldnDasw&s");

        userRepository.save(user);
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new CustomException("Username not found!", HttpStatus.BAD_REQUEST.value());
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new CustomException("Invalid password!", HttpStatus.BAD_REQUEST.value());
        }

        return jwtHandler.generateToken(username);
    }

    public User updateInfo(Long id, String username, String email, String rawPassword){
        User user = userRepository.findById(id).orElseThrow(() -> new CustomException("User not found!", HttpStatus.NOT_FOUND.value()));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new CustomException("Invalid password!", HttpStatus.BAD_REQUEST.value());
        }

        if (!Objects.equals(user.getUsername(), username)){
            if (userRepository.existsByUsername(username)) {
                throw new CustomException("Username already exists!", HttpStatus.BAD_REQUEST.value());
            }
        }

        if (!Objects.equals(user.getEmail(), email)){
            if (userRepository.existsByEmail(email)) {
                throw new CustomException("Email already exists!", HttpStatus.BAD_REQUEST.value());
            }
        }

        user.setUsername(username);
        user.setEmail(email);

        return userRepository.save(user);
    }

    public User updatePassword(Long id, String oldPassword, String newPassword){
        User user = userRepository.findById(id).orElseThrow(() -> new CustomException("User not found!", HttpStatus.NOT_FOUND.value()));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new CustomException("Invalid old password!", HttpStatus.BAD_REQUEST.value());
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public User updateAvatar(String username, MultipartFile image) {
        User user = userRepository.findByUsername(username);

        if (image == null || image.isEmpty()) {
            throw new CustomException("Invalid image", HttpStatus.BAD_REQUEST.value());
        }

        String imageUrl = imageStorageService.upload(image);
        user.setImageUrl(imageUrl);
        return userRepository.save(user);
    }
}
