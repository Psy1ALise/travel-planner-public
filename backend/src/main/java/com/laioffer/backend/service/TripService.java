package com.laioffer.backend.service;

import com.laioffer.backend.entity.Trip;
import com.laioffer.backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    @Transactional(readOnly = true)
    public List<Trip> getUserTrips(Long userId) {
        return tripRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    @Transactional
    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
    }
    
}