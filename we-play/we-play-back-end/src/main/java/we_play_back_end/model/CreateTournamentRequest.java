package we_play_back_end.model;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class CreateTournamentRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotBlank
    private String sport;

    @NotBlank
    private String format; // 1v1, 2v2, 3v3, 5v5

    private String location;

    private Double latitude;

    private Double longitude;

    private LocalDate startDate;

    private LocalDate endDate;

    @Min(2)
    @Max(256)
    private int maxParticipants = 16;

    @Min(0)
    private double prizePot = 0.0;

    private String prizeDistribution = "winner-takes-all";

    private boolean isPublic = true;
}
