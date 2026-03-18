package we_play_back_end.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import we_play_back_end.model.*;
import we_play_back_end.repository.TournamentRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    @Autowired
    private TournamentRepository tournamentRepository;

    @GetMapping
    public ResponseEntity<List<TournamentResponse>> getAllTournaments(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String status) {

        List<Tournament> tournaments;

        if (sport != null && status != null) {
            tournaments = tournamentRepository.findBySportAndStatus(sport, status);
        } else if (sport != null) {
            tournaments = tournamentRepository.findBySport(sport);
        } else if (status != null) {
            tournaments = tournamentRepository.findByStatus(status);
        } else {
            tournaments = tournamentRepository.findByIsPublicTrue();
        }

        List<TournamentResponse> responses = tournaments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTournament(@PathVariable String id) {
        return tournamentRepository.findById(id)
                .map(t -> ResponseEntity.ok(toResponse(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<TournamentResponse>> getMyTournaments() {
        User user = getAuthenticatedUser();
        List<Tournament> tournaments = tournamentRepository.findByCreatorId(user.getId());

        List<TournamentResponse> responses = tournaments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/joined")
    public ResponseEntity<List<TournamentResponse>> getJoinedTournaments() {
        User user = getAuthenticatedUser();
        List<Tournament> tournaments = tournamentRepository.findByParticipantIdsContaining(user.getId());

        List<TournamentResponse> responses = tournaments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<?> createTournament(@Valid @RequestBody CreateTournamentRequest request) {
        User user = getAuthenticatedUser();

        Tournament tournament = new Tournament();
        tournament.setName(request.getName().trim());
        tournament.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        tournament.setSport(request.getSport().trim());
        tournament.setFormat(request.getFormat().trim());
        tournament.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        tournament.setLatitude(request.getLatitude() != null ? request.getLatitude() : 0.0);
        tournament.setLongitude(request.getLongitude() != null ? request.getLongitude() : 0.0);
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setMaxParticipants(request.getMaxParticipants());
        tournament.setPrizePot(request.getPrizePot());
        tournament.setPrizeDistribution(request.getPrizeDistribution());
        tournament.setPublic(request.isPublic());
        tournament.setCreatorId(user.getId());
        tournament.setStatus("draft");

        Tournament saved = tournamentRepository.save(tournament);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTournament(
            @PathVariable String id,
            @Valid @RequestBody CreateTournamentRequest request) {

        User user = getAuthenticatedUser();

        return tournamentRepository.findById(id)
                .map(tournament -> {
                    if (!tournament.getCreatorId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new MessageResponse("You can only edit your own tournaments."));
                    }

                    if ("in-progress".equals(tournament.getStatus()) || "completed".equals(tournament.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("Cannot edit tournament that is in progress or completed."));
                    }

                    tournament.setName(request.getName().trim());
                    tournament.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
                    tournament.setSport(request.getSport().trim());
                    tournament.setFormat(request.getFormat().trim());
                    tournament.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
                    tournament.setLatitude(request.getLatitude() != null ? request.getLatitude() : 0.0);
                    tournament.setLongitude(request.getLongitude() != null ? request.getLongitude() : 0.0);
                    tournament.setStartDate(request.getStartDate());
                    tournament.setEndDate(request.getEndDate());
                    tournament.setMaxParticipants(request.getMaxParticipants());
                    tournament.setPrizePot(request.getPrizePot());
                    tournament.setPrizeDistribution(request.getPrizeDistribution());
                    tournament.setPublic(request.isPublic());

                    Tournament saved = tournamentRepository.save(tournament);
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishTournament(@PathVariable String id) {
        User user = getAuthenticatedUser();

        return tournamentRepository.findById(id)
                .map(tournament -> {
                    if (!tournament.getCreatorId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new MessageResponse("You can only publish your own tournaments."));
                    }

                    if (!"draft".equals(tournament.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("Only draft tournaments can be published."));
                    }

                    tournament.setStatus("open");
                    Tournament saved = tournamentRepository.save(tournament);
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinTournament(@PathVariable String id) {
        User user = getAuthenticatedUser();

        return tournamentRepository.findById(id)
                .map(tournament -> {
                    if (!"open".equals(tournament.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("Tournament is not open for registration."));
                    }

                    if (tournament.getParticipantIds().contains(user.getId())) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("You have already joined this tournament."));
                    }

                    if (tournament.getParticipantIds().size() >= tournament.getMaxParticipants()) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("Tournament is full."));
                    }

                    tournament.getParticipantIds().add(user.getId());
                    Tournament saved = tournamentRepository.save(tournament);
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveTournament(@PathVariable String id) {
        User user = getAuthenticatedUser();

        return tournamentRepository.findById(id)
                .map(tournament -> {
                    if (!"open".equals(tournament.getStatus()) && !"draft".equals(tournament.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("Cannot leave a tournament that has started."));
                    }

                    if (!tournament.getParticipantIds().contains(user.getId())) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("You are not a participant in this tournament."));
                    }

                    tournament.getParticipantIds().remove(user.getId());
                    Tournament saved = tournamentRepository.save(tournament);
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable String id) {
        User user = getAuthenticatedUser();

        return tournamentRepository.findById(id)
                .map(tournament -> {
                    if (!tournament.getCreatorId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new MessageResponse("You can only delete your own tournaments."));
                    }

                    if ("in-progress".equals(tournament.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body(new MessageResponse("Cannot delete a tournament in progress."));
                    }

                    tournamentRepository.delete(tournament);
                    return ResponseEntity.ok(new MessageResponse("Tournament deleted successfully."));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        // Handle case where principal is a String (username) - shouldn't happen but fallback
        if (principal instanceof String) {
            throw new org.springframework.security.access.AccessDeniedException("Invalid authentication state");
        }
        throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
    }

    private TournamentResponse toResponse(Tournament t) {
        return new TournamentResponse(
                t.getId(),
                t.getName(),
                t.getDescription(),
                t.getSport(),
                t.getFormat(),
                t.getLocation(),
                t.getLatitude(),
                t.getLongitude(),
                t.getStartDate(),
                t.getEndDate(),
                t.getMaxParticipants(),
                t.getParticipantIds().size(),
                t.getPrizePot(),
                t.getPrizeDistribution(),
                t.getStatus(),
                t.getCreatorId(),
                t.isPublic(),
                t.getParticipantIds()
        );
    }
}
