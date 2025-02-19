package com.laioffer.backend.repository;

import com.laioffer.backend.entity.PointType;
import com.laioffer.backend.entity.TripPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripPointRepository extends JpaRepository<TripPoint, Long> {
    // Existing queries
    List<TripPoint> findByTripIdAndDate(Long tripId, LocalDate Date);
    List<TripPoint> findByTripIdOrderByDateAsc(Long tripId);

    // Get all trip points for a given trip
    List<TripPoint> findByTripId(Long tripId);

    // Get trip points by trip id and a specific point type (if needed)
    List<TripPoint> findByTripIdAndPointType(Long tripId, PointType pointType);

    // Get trip points for a specific day across all trips
    @Query("SELECT tp FROM TripPoint tp WHERE tp.date = :date ORDER BY tp.trip.id, tp.visitOrder")
    List<TripPoint> findByDay(@Param("date") LocalDate date);

    //remove all trip points by trip id
    @Modifying
    @Query("DELETE FROM TripPoint tp WHERE tp.trip.id = :tripId")
    void deleteByTripId(@Param("tripId") Long tripId);
}