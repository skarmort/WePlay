package we_play_back_end.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class FeedItem {
    private String id;
    private String title;
    private String summary;
    private String sport;
    private LocalDateTime createdAt;
}