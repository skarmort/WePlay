package we_play_back_end.repository;


import we_play_back_end.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends MongoRepository<Role, String> {
    
    Optional<Role> findByName(Role.ERole name);
}
