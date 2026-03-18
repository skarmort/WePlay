package we_play_back_end.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import we_play_back_end.model.*;
import we_play_back_end.repository.ActivityLocationRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/map")
public class MapController {

    @Autowired
    private ActivityLocationRepository locationRepository;

    @GetMapping("/hotspots")
    public ResponseEntity<List<MapHotspot>> getHotspots(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) Integer minActivity) {

        List<ActivityLocation> locations;

        if (minActivity != null && minActivity > 0) {
            locations = locationRepository.findByActivityLevelGreaterThan(minActivity);
        } else {
            locations = locationRepository.findByIsActiveTrue();
        }

        // Filter by sport if provided
        if (sport != null && !sport.isBlank()) {
            locations = locations.stream()
                    .filter(loc -> sport.equalsIgnoreCase(loc.getSport()) || "mixed".equalsIgnoreCase(loc.getSport()))
                    .collect(Collectors.toList());
        }

        List<MapHotspot> hotspots = locations.stream()
                .map(this::toHotspot)
                .collect(Collectors.toList());

        return ResponseEntity.ok(hotspots);
    }

    @GetMapping("/hotspots/{id}")
    public ResponseEntity<?> getHotspot(@PathVariable String id) {
        return locationRepository.findById(id)
                .map(loc -> ResponseEntity.ok(toHotspot(loc)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/heading/{locationId}")
    public ResponseEntity<?> setHeadingToLocation(@PathVariable String locationId) {
        // In a full implementation, this would track the user's heading status
        // For MVP, we just increment the heading count
        return locationRepository.findById(locationId)
                .map(location -> {
                    location.setHeadingUsers(location.getHeadingUsers() + 1);
                    locationRepository.save(location);
                    return ResponseEntity.ok(new MessageResponse("Heading status updated."));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/arrived/{locationId}")
    public ResponseEntity<?> arrivedAtLocation(@PathVariable String locationId) {
        // In a full implementation, this would use geolocation verification
        // For MVP, we update counts
        return locationRepository.findById(locationId)
                .map(location -> {
                    if (location.getHeadingUsers() > 0) {
                        location.setHeadingUsers(location.getHeadingUsers() - 1);
                    }
                    location.setCurrentUsers(location.getCurrentUsers() + 1);
                    // Update activity level based on current users
                    int newActivity = Math.min(100, location.getCurrentUsers() * 10);
                    location.setActivityLevel(newActivity);
                    locationRepository.save(location);
                    return ResponseEntity.ok(new MessageResponse("Arrival confirmed."));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/left/{locationId}")
    public ResponseEntity<?> leftLocation(@PathVariable String locationId) {
        return locationRepository.findById(locationId)
                .map(location -> {
                    if (location.getCurrentUsers() > 0) {
                        location.setCurrentUsers(location.getCurrentUsers() - 1);
                    }
                    int newActivity = Math.min(100, location.getCurrentUsers() * 10);
                    location.setActivityLevel(newActivity);
                    locationRepository.save(location);
                    return ResponseEntity.ok(new MessageResponse("Departure confirmed."));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private MapHotspot toHotspot(ActivityLocation loc) {
        double longitude = 0.0;
        double latitude = 0.0;
        if (loc.getCoordinates() != null && loc.getCoordinates().length >= 2) {
            longitude = loc.getCoordinates()[0];
            latitude = loc.getCoordinates()[1];
        }

        return new MapHotspot(
                loc.getId(),
                loc.getName(),
                loc.getAddress(),
                loc.getSport(),
                longitude,
                latitude,
                loc.getActivityLevel(),
                loc.getCurrentUsers(),
                loc.getHeadingUsers(),
                loc.getLocationType()
        );
    }
}
