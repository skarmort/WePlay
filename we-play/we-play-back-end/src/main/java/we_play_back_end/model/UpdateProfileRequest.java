package we_play_back_end.model;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateProfileRequest {

    @Size(max = 50)
    private String displayName;

    @Size(max = 200)
    private String bio;

    @Size(max = 8)
    private Set<String> sports;

    @Size(max = 50)
    private String activeSport;
}