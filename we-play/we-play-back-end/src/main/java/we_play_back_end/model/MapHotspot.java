package we_play_back_end.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MapHotspot {
    private String id;
    private String name;
    private String address;
    private String sport;
    private double longitude;
    private double latitude;
    private int activityLevel; // 0-100
    private int currentUsers;
    private int headingUsers;
    private String locationType;
}
