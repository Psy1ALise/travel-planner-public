package com.laioffer.backend.controller;

import com.laioffer.backend.entity.PointType;
import org.locationtech.jts.geom.Point;

import java.time.LocalDate;
import java.time.LocalTime;

// 添加一个内部类来处理位置坐标
public record TripPointRequestBody(
        Long trip,
        String name,
        LocalDate date,
        Integer visitOrder,
        PointType pointType,
        Integer plannedDuration,
        LocalTime plannedTime,
        LocationCoordinate location,  // 改用 LocationCoordinate
        String locationName,  // 添加 locationName 字段
        String notes) {
    
    // 内部类用于接收前端发送的坐标
    public record LocationCoordinate(
            Double x,  // longitude
            Double y   // latitude
    ) {}
}
