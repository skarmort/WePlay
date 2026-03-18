package we_play_back_end.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tournaments")
public class Tournament {

    @Id
    private String id;

    @NotBlank
    @Size(min = 3, max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotBlank
    private String sport;

    @NotBlank
    private String format; // 1v1, 2v2, 3v3, 5v5, etc.

    private String location;

    private double latitude;

    private double longitude;

    private LocalDate startDate;

    private LocalDate endDate;

    @Min(0)
    private int maxParticipants = 16;

    @Min(0)
    private double prizePot = 0.0;

    private String prizeDistribution = "winner-takes-all"; // winner-takes-all, podium, custom

    private String status = "draft"; // draft, open, in-progress, completed, cancelled

    private String creatorId;

    private List<String> participantIds = new ArrayList<>();

    private boolean isPublic = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
