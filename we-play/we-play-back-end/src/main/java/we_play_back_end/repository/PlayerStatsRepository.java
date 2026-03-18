package we_play_back_end.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import we_play_back_end.model.PlayerStats;

import java.util.Optional;

@Repository
public interface PlayerStatsRepository extends MongoRepository<PlayerStats, String> {

    Optional<PlayerStats> findByUserId(String oduserId);

    Optional<PlayerStats> findByUserIdAndSport(String oduserId, String odusport);
}
