package we_play_back_end.model;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "roles")
public class Role {
    
    @Id
    private String id;
    
    private ERole name;
    
    public enum ERole {
        ROLE_USER,
        ROLE_ADMIN,
        ROLE_MODERATOR
    }
}
