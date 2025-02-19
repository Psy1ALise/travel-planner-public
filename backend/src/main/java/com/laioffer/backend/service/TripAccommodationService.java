package com.laioffer.backend.service;

import com.laioffer.backend.entity.TripAccommodation;
import com.laioffer.backend.repository.TripAccommodationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripAccommodationService {
    private final TripAccommodationRepository accommodationRepository;

    @Transactional(readOnly = true)
    public TripAccommodation getAccommodationForDate(Long tripId, LocalDate date) {
        return accommodationRepository.findByTripIdAndDate(tripId, date)
                .orElseThrow(() -> new RuntimeException("No accommodation found for this date"));
    }

    @Transactional(readOnly = true)
    public List<TripAccommodation> getTripAccommodations(Long tripId) {
        return accommodationRepository.findByTripIdOrderByCheckInDate(tripId);
    }

    @Transactional
    public TripAccommodation addAccommodation(TripAccommodation accommodation) {
        return accommodationRepository.save(accommodation);
    }
}