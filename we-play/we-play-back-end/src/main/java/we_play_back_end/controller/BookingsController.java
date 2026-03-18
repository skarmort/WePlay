package we_play_back_end.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingsController {

    // In-memory storage for MVP (replace with repository in production)
    private static final List<Map<String, Object>> mockVenues = new ArrayList<>();
    private static final List<Map<String, Object>> mockBookings = new ArrayList<>();

    static {
        // Initialize mock venues
        mockVenues.add(createVenue("venue-1", "Central Sports Complex", "123 Main Street", "Soccer", "Indoor", 
                Arrays.asList("Parking", "Changing Rooms", "Showers", "Lighting"), 45.0, 4.5, 8));
        mockVenues.add(createVenue("venue-2", "Downtown Basketball Courts", "456 Oak Avenue", "Basketball", "Outdoor",
                Arrays.asList("Lighting", "Bleachers", "Water Fountain"), 30.0, 4.2, 5));
        mockVenues.add(createVenue("venue-3", "Riverside Tennis Club", "789 River Road", "Tennis", "Outdoor",
                Arrays.asList("Pro Shop", "Coaching", "Cafe", "Parking"), 50.0, 4.8, 12));
        mockVenues.add(createVenue("venue-4", "City Fitness Arena", "321 Fitness Blvd", "Boxing", "Indoor",
                Arrays.asList("Boxing Ring", "Heavy Bags", "Training Equipment", "Lockers"), 40.0, 4.4, 6));
        mockVenues.add(createVenue("venue-5", "Green Park Fields", "555 Park Lane", "Soccer", "Outdoor",
                Arrays.asList("Full Size Pitch", "Goals", "Parking", "Restrooms"), 35.0, 4.1, 10));
    }

    private static Map<String, Object> createVenue(String id, String name, String address, String sport, 
            String locationType, List<String> amenities, double pricePerHour, double rating, int availableSlots) {
        Map<String, Object> venue = new HashMap<>();
        venue.put("id", id);
        venue.put("name", name);
        venue.put("address", address);
        venue.put("sport", sport);
        venue.put("locationType", locationType);
        venue.put("amenities", amenities);
        venue.put("pricePerHour", pricePerHour);
        venue.put("rating", rating);
        venue.put("availableSlots", availableSlots);
        return venue;
    }

    @GetMapping("/venues")
    public ResponseEntity<List<Map<String, Object>>> getVenues(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String locationType) {
        
        List<Map<String, Object>> filtered = new ArrayList<>(mockVenues);
        
        if (sport != null && !sport.isBlank()) {
            filtered.removeIf(v -> !sport.equalsIgnoreCase((String) v.get("sport")));
        }
        
        if (locationType != null && !locationType.isBlank()) {
            filtered.removeIf(v -> !locationType.equalsIgnoreCase((String) v.get("locationType")));
        }
        
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/venues/{venueId}/availability")
    public ResponseEntity<List<Map<String, Object>>> getVenueAvailability(
            @PathVariable String venueId,
            @RequestParam String date) {
        
        // Generate mock time slots
        List<Map<String, Object>> slots = new ArrayList<>();
        LocalTime start = LocalTime.of(8, 0);
        LocalTime end = LocalTime.of(22, 0);
        
        Random random = new Random(venueId.hashCode() + date.hashCode());
        
        while (start.isBefore(end)) {
            Map<String, Object> slot = new HashMap<>();
            slot.put("time", start.toString());
            slot.put("available", random.nextDouble() > 0.3); // 70% chance available
            slots.add(slot);
            start = start.plusHours(1);
        }
        
        return ResponseEntity.ok(slots);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(
            @RequestBody Map<String, Object> bookingData,
            Authentication authentication) {
        
        String odId = authentication != null ? authentication.getName() : "anonymous";
        
        Map<String, Object> booking = new HashMap<>();
        booking.put("id", "booking-" + System.currentTimeMillis());
        booking.put("odId", odId);
        booking.put("venueId", bookingData.get("venueId"));
        booking.put("venueName", bookingData.get("venueName"));
        booking.put("date", bookingData.get("date"));
        booking.put("timeSlot", bookingData.get("timeSlot"));
        booking.put("duration", bookingData.get("duration"));
        booking.put("notes", bookingData.get("notes"));
        booking.put("status", "confirmed");
        booking.put("createdAt", LocalDate.now().toString());
        
        mockBookings.add(booking);
        
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyBookings(Authentication authentication) {
        String odId = authentication != null ? authentication.getName() : "anonymous";
        
        List<Map<String, Object>> userBookings = new ArrayList<>();
        for (Map<String, Object> booking : mockBookings) {
            if (odId.equals(booking.get("odId"))) {
                userBookings.add(booking);
            }
        }
        
        return ResponseEntity.ok(userBookings);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable String bookingId,
            Authentication authentication) {
        
        String odId = authentication != null ? authentication.getName() : "anonymous";
        
        boolean removed = mockBookings.removeIf(b -> 
                bookingId.equals(b.get("id")) && odId.equals(b.get("odId")));
        
        if (removed) {
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
