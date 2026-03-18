package we_play_back_end.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String bio;
    private Set<String> sports;
    private String activeSport;
    private List<String> roles;
}