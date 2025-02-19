package com.laioffer.backend.service;

import com.laioffer.backend.controller.TripPointRequestBody;
import com.laioffer.backend.entity.PointType;
import com.laioffer.backend.entity.Trip;
import com.laioffer.backend.entity.TripPoint;
import com.laioffer.backend.repository.TripPointRepository;
import com.laioffer.backend.repository.TripRepository;
import jakarta.persistence.EnumType;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TripPointService {
    private final TripPointRepository tripPointRepository;
    private final TripRepository tripRepository;
    
    // 创建一个 GeometryFactory，使用 SRID 4326 (WGS84)
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional(readOnly = true)
    public TripPoint getTripPointById(Long id) {
        return tripPointRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TripPoint not found"));
    }

    @Transactional(readOnly = true)
    public List<TripPoint> getTripPointsByTripId(Long tripId) {
        return tripPointRepository.findByTripIdOrderByDateAsc(tripId);
    }

    @Transactional(readOnly = true)
    public List<TripPoint> getTripPointsByTripIdAndDay(Long tripId, LocalDate date) {
        return tripPointRepository.findByTripIdAndDate(tripId, date);
    }

    @Transactional(readOnly = true)
    public List<TripPoint> getTripPointsByDay(LocalDate date) {
        return tripPointRepository.findByDay(date);
    }

    @Transactional
    public TripPoint createTripPoint(TripPointRequestBody requestBody) {
        Trip trip = tripRepository.findById(requestBody.trip())
            .orElseThrow(() -> new RuntimeException("Trip not found"));

        // 从请求体中获取坐标并创建 Point
        Point location = null;
        if (requestBody.location() != null) {
            location = geometryFactory.createPoint(
                new Coordinate(
                    requestBody.location().x(),  // longitude
                    requestBody.location().y()   // latitude
                )
            );
        }

        // 创建 TripPoint
        TripPoint tripPoint = TripPoint.builder()
                .name(requestBody.name())
                .trip(trip)
                .date(requestBody.date())
                .location(location)
                .locationName(requestBody.locationName())
                .visitOrder(requestBody.visitOrder())
                .pointType(requestBody.pointType())
                .plannedDuration(requestBody.plannedDuration())
                .plannedTime(requestBody.plannedTime())
                .notes(requestBody.notes())
                .build();

        return tripPointRepository.save(tripPoint);
    }

    @Transactional
    public TripPoint updateTripPoint(Long id, TripPointRequestBody requestBody) {
        TripPoint existing = tripPointRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TripPoint not found"));

        // 从请求体中获取坐标并创建新的 Point
        if (requestBody.location() != null) {
            Point location = geometryFactory.createPoint(
                new Coordinate(
                    requestBody.location().x(),
                    requestBody.location().y()
                )
            );
            existing.setLocation(location);
        }

        existing.setName(requestBody.name());
        existing.setDate(requestBody.date());
        existing.setVisitOrder(requestBody.visitOrder());
        existing.setPointType(requestBody.pointType());
        existing.setPlannedDuration(requestBody.plannedDuration());
        existing.setPlannedTime(requestBody.plannedTime());
        existing.setNotes(requestBody.notes());
        existing.setLocationName(requestBody.locationName());

        return tripPointRepository.save(existing);
    }

    @Transactional
    public void deleteTripPoint(Long id) {
        if (!tripPointRepository.existsById(id)) {
            throw new RuntimeException("TripPoint not found");
        }
        tripPointRepository.deleteById(id);
    }
}
