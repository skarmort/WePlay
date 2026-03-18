package we_play_back_end.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import we_play_back_end.model.EventSummary;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventsController {

    @GetMapping
    public ResponseEntity<List<EventSummary>> getEvents() {
        List<EventSummary> events = List.of(
                new EventSummary("event-1", "City Hoops 3v3", "Basketball", "Downtown Courts", LocalDate.now().plusDays(10), "3v3"),
                new EventSummary("event-2", "Sunday Soccer League", "Soccer", "Riverside Field", LocalDate.now().plusDays(14), "5v5"),
                new EventSummary("event-3", "Boxing Skills Clinic", "Boxing", "West Gym", LocalDate.now().plusDays(21), "Workshop")
        );

        return ResponseEntity.ok(events);
    }
}