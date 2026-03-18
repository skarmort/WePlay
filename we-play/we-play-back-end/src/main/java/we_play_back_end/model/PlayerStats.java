package we_play_back_end.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "player_stats")
public class PlayerStats {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String sport;

    // General stats
    private int matchesPlayed = 0;
    private int matchesWon = 0;
    private int tournamentsPlayed = 0;
    private int tournamentsWon = 0;

    // Sport-specific stats stored as flexible map
    private Map<String, Object> sportStats = new HashMap<>();

    // Common performance metrics
    private double avgSpeed = 0.0; // km/h or mph
    private double avgAgility = 0.0; // score 0-100
    private double endurance = 0.0; // score 0-100

    // Soccer-specific (example)
    private int goals = 0;
    private int assists = 0;
    private int passes = 0;
    private double passAccuracy = 0.0;

    // Basketball-specific (example)
    private int points = 0;
    private int rebounds = 0;
    private int steals = 0;
    private int blocks = 0;

    // Ratings
    private double consensusRating = 0.0;
    private double unverifiedRating = 0.0;
    private int totalRatingsReceived = 0;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
