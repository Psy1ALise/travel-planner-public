package com.laioffer.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.laioffer.backend.serialization.PointSerializer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;

// POI.java
@Entity
@Table(name = "poi")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class POI {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "geometry(Point,4326)")
    @JsonSerialize(using = PointSerializer.class)
    private Point location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private POIType poiType;  // Our app's type (ATTRACTION, ACCOMMODATION, etc.)

    @Column(nullable = false)
    private String category;  // Google Places category

    private String notes;    // User's personal notes

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}