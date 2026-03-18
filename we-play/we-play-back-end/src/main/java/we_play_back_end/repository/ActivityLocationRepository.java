package we_play_back_end.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import we_play_back_end.model.ActivityLocation;

import java.util.List;

@Repository
public interface ActivityLocationRepository extends MongoRepository<ActivityLocation, String> {

    List<ActivityLocation> findBySport(String sport);

    List<ActivityLocation> findByIsActiveTrue();

    List<ActivityLocation> findByActivityLevelGreaterThan(int level);

    List<ActivityLocation> findByLocationType(String locationType);
}
