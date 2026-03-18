package we_play_back_end.model;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank
    private String usernameOrEmail;
    
    @NotBlank
    private String password;
}
