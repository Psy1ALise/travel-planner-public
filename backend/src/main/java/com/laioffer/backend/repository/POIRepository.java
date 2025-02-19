package com.laioffer.backend.repository;

import com.laioffer.backend.entity.POI;
import com.laioffer.backend.entity.POIType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface POIRepository extends JpaRepository<POI, Long> {
    // Find active POI by ID
    @Query("SELECT p FROM POI p WHERE p.id = :id AND p.isActive = true")
    Optional<POI> findActiveById(@Param("id") Long id);

    // Find all active POIs
    @Query("SELECT p FROM POI p WHERE p.isActive = true")
    List<POI> findAllActive();

    // Soft delete
    @Query("UPDATE POI p SET p.isActive = false, p.deletedAt = CURRENT_TIMESTAMP WHERE p.id = :id")
    void softDelete(@Param("id") Long id);

    // Save new POI with location
    @Query(value = "INSERT INTO poi (name, location, poi_type, category, is_active) " +
            "VALUES (:name, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :poiType, :category, true) " +
            "RETURNING *", nativeQuery = true)
    POI saveWithLocation(
            @Param("name") String name,
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("poiType") String poiType, //
            @Param("category") String category
    );

    // Find nearby active POIs within radius
    @Query(value = "SELECT * FROM poi " +
            "WHERE is_active = true " +
            "AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :radiusInMeters)",
            nativeQuery = true)
    List<POI> findNearbyPOIs(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusInMeters") double radiusInMeters
    );

    // Find active POIs by type
    @Query("SELECT p FROM POI p WHERE p.poiType = :type AND p.isActive = true")
    List<POI> findActiveByType(@Param("type") POIType type);

    // TODO
}