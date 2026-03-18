package we_play_back_end.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class TournamentResponse {
    private String id;
    private String name;
    private String description;
    private String sport;
    private String format;
    private String location;
    private Double latitude;
    private Double longitude;
    private LocalDate startDate;
    private LocalDate endDate;
    private int maxParticipants;
    private int currentParticipants;
    private double prizePot;
    private String prizeDistribution;
    private String status;
    private String creatorId;
    private boolean isPublic;
    private List<String> participantIds;
}
