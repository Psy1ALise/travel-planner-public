package com.laioffer.backend.controller;

import com.laioffer.backend.entity.TripPoint;
import com.laioffer.backend.service.TripPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trip-points")
@RequiredArgsConstructor
public class TripPointController {

    private final TripPointService tripPointService;

    // Get a trip point by id
    @GetMapping("/{id}")
    public ResponseEntity<TripPoint> getTripPoint(@PathVariable Long id) {
        TripPoint tripPoint = tripPointService.getTripPointById(id);
        return ResponseEntity.ok(tripPoint);
    }

    // Get all trip points for a given trip
    // Can provide either one of tripId or day, or both
    @GetMapping
    public ResponseEntity<List<TripPoint>> getTripPoints(
            @RequestParam(required = false) Long tripId,
            @RequestParam(required = false) LocalDate date) {
        if (tripId == null && date == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either tripId or dayNumber must be provided");
        }

        List<TripPoint> tripPoints;
        if (tripId != null) {
            // If dayNumber is provided, filter by trip and day
            if (date != null) {
                tripPoints = tripPointService.getTripPointsByTripIdAndDay(tripId, date);
            } else {
                tripPoints = tripPointService.getTripPointsByTripId(tripId);
            }
        } else {
            // If only dayNumber is provided, return trip points for that day (across all trips)
            tripPoints = tripPointService.getTripPointsByDay(date);
        }
        return ResponseEntity.ok(tripPoints);
    }

    // Create a new trip point
    @PostMapping
    public TripPoint createTripPoint(@RequestBody TripPointRequestBody body) {
        return tripPointService.createTripPoint(body);
    }

    // Update an existing trip point
    @PutMapping("/{id}")
    public ResponseEntity<TripPoint> updateTripPoint(@PathVariable Long id, @RequestBody TripPointRequestBody body) {
        TripPoint updated = tripPointService.updateTripPoint(id, body);
        return ResponseEntity.ok(updated);
    }

    // Delete a trip point
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTripPoint(@PathVariable Long id) {
        tripPointService.deleteTripPoint(id);
        return ResponseEntity.noContent().build();
    }
}