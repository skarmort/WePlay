package we_play_back_end.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PlayerStatsResponse {
    private String oduserId;
    private String odusport;

    // General
    private int matchesPlayed;
    private int matchesWon;
    private int tournamentsPlayed;
    private int tournamentsWon;
    private double winRate;

    // Performance
    private double avgSpeed;
    private double avgAgility;
    private double endurance;

    // Sport-specific highlights
    private int goals;
    private int assists;
    private int passes;
    private double passAccuracy;
    private int points;
    private int rebounds;
    private int steals;
    private int blocks;

    // Ratings
    private double consensusRating;
    private double unverifiedRating;
    private int totalRatingsReceived;
}
