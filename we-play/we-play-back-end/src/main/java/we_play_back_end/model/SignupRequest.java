package we_play_back_end.model;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class SignupRequest {
    
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
    
    @NotBlank
    @Size(max = 50)
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
}
