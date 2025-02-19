package com.laioffer.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "trip_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TripPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;

    @Column(columnDefinition = "geometry(Point,4326)")
    @JsonSerialize(using = PointSerializer.class)
    private Point location;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "visit_order")
    private Integer visitOrder;

    @Column(name = "point_type")
    @Enumerated(EnumType.STRING)
    private PointType pointType;

    @Column(name = "planned_duration")
    private Integer plannedDuration;

    @Column(name = "planned_time")
    private LocalTime plannedTime;

    private String notes;

    @Column(name = "location_name")
    private String locationName;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
}

/*
方法2：
 Query : find by trip id group by day number and order by visit order
*/