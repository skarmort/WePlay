package we_play_back_end.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import we_play_back_end.model.Tournament;

import java.util.List;

@Repository
public interface TournamentRepository extends MongoRepository<Tournament, String> {

    List<Tournament> findBySport(String sport);

    List<Tournament> findByStatus(String status);

    List<Tournament> findByCreatorId(String creatorId);

    List<Tournament> findBySportAndStatus(String sport, String status);

    List<Tournament> findByIsPublicTrue();

    List<Tournament> findByParticipantIdsContaining(String oduserId);
}
