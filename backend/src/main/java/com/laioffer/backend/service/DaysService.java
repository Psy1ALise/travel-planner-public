package com.laioffer.backend.service;

import com.laioffer.backend.entity.Trip;
import com.laioffer.backend.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;

@Service
public class DaysService {

    private final TripRepository tripRepository;

    public DaysService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public long getDaysNumber(long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));
        return ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate());
    }
}
