package com.laioffer.backend.service;

import com.laioffer.backend.entity.Trip;
import com.laioffer.backend.entity.User;
import com.laioffer.backend.repository.TripPointRepository;
import com.laioffer.backend.repository.TripRepository;
import com.laioffer.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TripManagementService {
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripPointRepository tripPointRepository;
    private final ImageStorageService imageStorageService;

    @Transactional(readOnly = true)
    public Optional<Trip> getTripById(Long tripId) {
        return tripRepository.findById(tripId);
    }

    @Transactional(readOnly = true)
    public List<Trip> getUserTrips(Long userId) {
        return tripRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    @Transactional
    public ResponseEntity<?> createTrip(Long userId,
                                        String name,
                                        String startDate,
                                        String endDate,
                                        BigDecimal total_budget,
                                        String destination) throws IOException {

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid User ID.");
        }

        LocalDate localStartDate = LocalDate.parse(startDate);
        LocalDate localEndDate = LocalDate.parse(endDate);

        if (localStartDate.isAfter(localEndDate)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Start date must be before end date.");
        }

        if (total_budget.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Total budget must be greater than 0.");
        }


        User user = userRepository.getById(userId);

        Trip trip = Trip.builder()
                .user(user)
                .name(name)
                .startDate(localStartDate)
                .endDate(localEndDate)
                .totalBudget(total_budget)
                .destination(destination)
                .build();
        tripRepository.save(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(trip);
    }

    @Transactional
    public boolean deleteTrip(Long tripId, Long userId) {
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (tripOptional.isEmpty()) {
            return false; // 让 Controller 返回 404 Not Found
        }

        Trip trip = tripOptional.get();
        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this trip");
        }

        tripPointRepository.deleteByTripId(tripId);
        tripRepository.delete(trip);
        return true;
    }
}
