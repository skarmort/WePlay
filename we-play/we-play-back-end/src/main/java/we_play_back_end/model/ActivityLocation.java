package we_play_back_end.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "activity_locations")
public class ActivityLocation {

    @Id
    private String id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 300)
    private String address;

    private String sport;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private double[] coordinates; // [longitude, latitude]

    private int activityLevel = 0; // 0-100 scale

    private int currentUsers = 0;

    private int headingUsers = 0; // users heading to this location

    private String locationType = "public"; // public, gym, field, court, arena

    private boolean isActive = true;

    @CreatedDate
    private LocalDateTime lastActivityAt;
}
