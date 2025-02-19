package com.laioffer.backend.controller;

import com.laioffer.backend.entity.Trip;
import com.laioffer.backend.entity.User;
import com.laioffer.backend.repository.UserRepository;
import com.laioffer.backend.service.TripManagementService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
public class TripManagementController {

    private final TripManagementService tripManagementService;
    private final UserRepository userRepository;

    public static record CreateRequest(Long userId, String name, String startDate, String endDate, BigDecimal total_Budget, String destination) {}

    public TripManagementController(TripManagementService tripManagementService, UserRepository userRepository) {
        this.tripManagementService = tripManagementService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createTrip(
            @RequestBody CreateRequest body
    ) throws IOException {
        return tripManagementService.createTrip(body.userId(), body.name(), body.startDate(), body.endDate(), body.total_Budget(), body.destination());
    }

    @GetMapping
    public ResponseEntity<?> getUserTrips(@RequestParam(required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID is required.");
        }

        try {
            Long userIdLong = Long.parseLong(userId);
            Optional<User> userOptional = userRepository.findById(userIdLong);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }

            List<Trip> trips = tripManagementService.getUserTrips(userIdLong);
            return ResponseEntity.ok(trips);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid User ID format.");
        }
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTripById(@PathVariable Long tripId) {
        Optional<Trip> tripOptional = tripManagementService.getTripById(tripId);
        if (tripOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found.");
        }
        return ResponseEntity.ok(tripOptional.get());
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId, @RequestParam(required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID is required.");
        }

        try {
            Long userIdLong = Long.parseLong(userId);
            boolean deleted = tripManagementService.deleteTrip(tripId, userIdLong);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found.");
            }
            return ResponseEntity.noContent().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid User ID format.");
        }
    }
}
