package com.laioffer.backend.repository;

import com.laioffer.backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserId(Long userId);
    List<Trip> findByUserIdOrderByStartDateDesc(Long userId);
    Optional<Trip> findById(Long tripId);
}