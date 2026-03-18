package we_play_back_end.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import we_play_back_end.model.FeedItem;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    @GetMapping
    public ResponseEntity<List<FeedItem>> getFeed() {
        List<FeedItem> items = List.of(
                new FeedItem("feed-1", "Weekly Highlights", "Top plays across your selected sports.", "Mixed", LocalDateTime.now().minusHours(6)),
                new FeedItem("feed-2", "Local Scrimmage Updates", "New scrimmages available in your area.", "Basketball", LocalDateTime.now().minusDays(1)),
                new FeedItem("feed-3", "Training Tips", "Improve your agility with these drills.", "Soccer", LocalDateTime.now().minusDays(2))
        );

        return ResponseEntity.ok(items);
    }
}