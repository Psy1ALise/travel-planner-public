package com.laioffer.backend.service;

import com.laioffer.backend.entity.POI;
import com.laioffer.backend.repository.POIRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class POIService {
    private final POIRepository poiRepository;

    @Transactional(readOnly = true)
    public POI getPOIById(Long id) {
        return poiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("POI not found"));
    }

    @Transactional(readOnly = true)
    public List<POI> getNearbyPOIs(double lat, double lng, double radiusInMeters) {
        return poiRepository.findNearbyPOIs(lat, lng, radiusInMeters);
    }

    @Transactional
    public POI createPOI(POI poi) {
        return poiRepository.save(poi);
    }
}