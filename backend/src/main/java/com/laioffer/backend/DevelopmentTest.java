//import org.locationtech.jts.geom.Coordinate;//package com.laioffer.backend;
//
//import com.laioffer.backend.entity.POI;
//import com.laioffer.backend.entity.Trip;
//import com.laioffer.backend.entity.TripPoint;
//import com.laioffer.backend.entity.User;
//import com.laioffer.backend.repository.POIRepository;
//import com.laioffer.backend.repository.TripPointRepository;
//import com.laioffer.backend.repository.TripRepository;
//import com.laioffer.backend.repository.UserRepository;
//import com.laioffer.backend.entity.PointType;
//import com.laioffer.backend.entity.POIType;
//import org.locationtech.jts.geom.Coordinate;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.boot.ApplicationArguments;
//import org.springframework.boot.ApplicationRunner;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//
//import org.locationtech.jts.geom.GeometryFactory;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.util.List;
//
//@Component
//public class DevelopmentTest implements ApplicationRunner {
//
//    private final UserRepository userRepository;
//    private final TripRepository tripRepository;
//    private final TripPointRepository tripPointRepository;
//    private final POIRepository poiRepository;
//
//    public DevelopmentTest(UserRepository userRepository, TripRepository tripRepository,
//                           TripPointRepository tripPointRepository, POIRepository poiRepository) {
//        this.userRepository = userRepository;
//        this.tripRepository = tripRepository;
//        this.tripPointRepository = tripPointRepository;
//        this.poiRepository = poiRepository;
//    }
//    @Override
//    public void run(ApplicationArguments args) throws Exception {
//        // Create Users
//        User alice = User.builder()
//                .username("alice")
//                .email("alice@example.com")
//                .password("securepassword")
//                .build();
//
//        User bob = User.builder()
//                .username("bob")
//                .email("bob@example.com")
//                .password("anotherpassword")
//                .build();
//        userRepository.save(alice);
//        userRepository.save(bob);
//
//        // Create Trips
//        Trip tripParis = Trip.builder()
//                .user(alice)
//                .name("Trip to Paris")
//                .startDate(LocalDate.of(2025, 5, 1))
//                .endDate(LocalDate.of(2025, 5, 10))
//                .totalBudget(new BigDecimal("1500.00"))
//                .destination("Paris")
//                .build();
//
//        Trip tripLondon = Trip.builder()
//                .user(alice)
//                .name("Trip to London")
//                .startDate(LocalDate.of(2025, 6, 1))
//                .endDate(LocalDate.of(2025, 6, 7))
//                .totalBudget(new BigDecimal("1200.00"))
//                .destination("London")
//                .build();
//        Trip tripNY = Trip.builder()
//                .user(bob)
//                .name("Trip to New York")
//                .startDate(LocalDate.of(2025, 7, 1))
//                .endDate(LocalDate.of(2025, 7, 10))
//                .totalBudget(new BigDecimal("2000.00"))
//                .destination("NY")
//                .build();
//        tripRepository.save(tripParis);
//        tripRepository.save(tripLondon);
//        tripRepository.save(tripNY);
//
//        // Create POIs with realistic coordinates
////        GeometryFactory geometryFactory = new GeometryFactory();
//location(geometryFactory.createPoint(new Coordinate(2.2945, 48.8584)))
////        POI poiEiffel = POI.builder()
////                .name("Eiffel Tower")
////                .location(geometryFactory.createPoint(new Coordinate(2.2945, 48.8584)))
////                .poiType(POIType.ATTRACTION)
////                .category("Landmark")
////                .build();
////        POI poiLouvre = POI.builder()
////                .name("Louvre Museum")
////                .location(geometryFactory.createPoint(new Coordinate(2.3364, 48.8606)))
////                .poiType(POIType.ATTRACTION)
////                .category("Museum")
////                .build();
////        POI poiBuckingham = POI.builder()
////                .name("Buckingham Palace")
////                .location(geometryFactory.createPoint(new Coordinate(-0.1419, 51.5014)))
////                .poiType(POIType.ATTRACTION)
////                .category("Landmark")
////                .build();
////        POI poiCentralPark = POI.builder()
////                .name("Central Park")
////                .location(geometryFactory.createPoint(new Coordinate(-73.9654, 40.7829)))
////                .poiType(POIType.ATTRACTION)
////                .category("Park")
////                .build();
////        poiRepository.save(poiEiffel);
////        poiRepository.save(poiLouvre);
////        poiRepository.save(poiBuckingham);
////        poiRepository.save(poiCentralPark);
////
////         // Create TripPoints for Paris trip (Alice)
////         // Day 1: Two points
////         TripPoint parisTP1 = TripPoint.builder()
////                 .name("place A")
////                 .trip(tripParis)
////             //    .poi(poiEiffel)
////                 .date(LocalDate.of(2025, 6, 1))
////                 .visitOrder(1)
////                 .pointType(PointType.VISIT)
////                 .plannedDuration(60)
////                 .plannedTime(LocalTime.of(10, 0))
////                 .notes("the first visit point")
////                 .build();
////         TripPoint parisTP2 = TripPoint.builder()
////                 .name("place B")
////                 .trip(tripParis)
////               //  .poi(poiLouvre)
////                 .date(LocalDate.of(2025, 6, 1))
////                 .visitOrder(2)
////                 .pointType(PointType.VISIT)
////                 .plannedDuration(90)
////                 .plannedTime(LocalTime.of(14, 0))
////                 .build();
////         // Day 2: One point
////         TripPoint parisTP3 = TripPoint.builder()
////                 .name("place C")
////                 .trip(tripParis)
////             //   .poi(poiEiffel)
////                 .date(LocalDate.of(2025, 6, 1))
////                 .visitOrder(1)
////                 .pointType(PointType.VISIT)
////                 .plannedDuration(30)
////                 .plannedTime(LocalTime.of(9, 0))
////                 .build();
////         tripPointRepository.save(parisTP1);
////         tripPointRepository.save(parisTP2);
////         tripPointRepository.save(parisTP3);
////
////         // Create TripPoints for London trip (Alice)
////         // Single day trip with one point
////         TripPoint londonTP1 = TripPoint.builder()
////                 .name("place D")
////                 .trip(tripLondon)
////                 //.poi(poiBuckingham)
////                 .date(LocalDate.of(2025, 6, 1))
////                 .visitOrder(1)
////                 .pointType(PointType.VISIT)
////                 .plannedDuration(45)
////                 .plannedTime(LocalTime.of(11, 0))
////                 .build();
////         tripPointRepository.save(londonTP1);
////
////         // Create TripPoints for New York trip (Bob)
////         // Day 1: One point (Central Park)
////         TripPoint nyTP1 = TripPoint.builder()
////                 .name("place E")
////                 .trip(tripNY)
////                // .poi(poiCentralPark)
//////                 .dayNumber(1)
////                 .date(LocalDate.of(2025, 6, 1))
////                 .visitOrder(1)
////                 .pointType(PointType.VISIT)
////                 .plannedDuration(120)
////                 .plannedTime(LocalTime.of(8, 30))
////                 .build();
////         // Day 2: Two points (both Central Park for demonstration)
////         TripPoint nyTP2 = TripPoint.builder()
////                 .name("place F")
////                 .trip(tripNY)
////               //  .poi(poiCentralPark)
////                 .date(LocalDate.of(2025, 6, 1))
////                 .visitOrder(1)
////                 .pointType(PointType.VISIT)
////                 .plannedDuration(60)
////                 .plannedTime(LocalTime.of(10, 0))
////                 .build();
////         TripPoint nyTP3 = TripPoint.builder()
////                 .name("place G")
////                 .trip(tripNY)
////               //  .poi(poiCentralPark)
////                 .date(LocalDate.of(2025, 6, 1))
////                 .visitOrder(2)
////                 .pointType(PointType.VISIT)
////                 .plannedDuration(45)
////                 .plannedTime(LocalTime.of(14, 30))
////                 .build();
////         tripPointRepository.save(nyTP1);
////         tripPointRepository.save(nyTP2);
////         tripPointRepository.save(nyTP3);
//     }
//}