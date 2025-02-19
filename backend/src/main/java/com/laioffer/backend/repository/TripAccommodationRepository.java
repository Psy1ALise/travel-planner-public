package com.laioffer.backend.repository;

import com.laioffer.backend.entity.TripAccommodation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripAccommodationRepository extends JpaRepository<TripAccommodation, Long> {
    List<TripAccommodation> findByTripId(Long tripId);
    List<TripAccommodation> findByTripIdOrderByCheckInDate(Long tripId);

    @Query("SELECT ta FROM TripAccommodation ta WHERE ta.trip.id = :tripId " +
            "AND :date BETWEEN ta.checkInDate AND ta.checkOutDate")
    Optional<TripAccommodation> findByTripIdAndDate(Long tripId, LocalDate date);
}