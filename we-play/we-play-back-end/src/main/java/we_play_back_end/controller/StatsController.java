package we_play_back_end.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import we_play_back_end.model.*;
import we_play_back_end.repository.PlayerStatsRepository;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private PlayerStatsRepository statsRepository;

    @GetMapping("/me")
    public ResponseEntity<PlayerStatsResponse> getMyStats() {
        User user = getAuthenticatedUser();

        PlayerStats stats = statsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Create empty stats for new users
                    PlayerStats newStats = new PlayerStats();
                    newStats.setUserId(user.getId());
                    newStats.setSport(user.getActiveSport() != null ? user.getActiveSport() : "General");
                    return statsRepository.save(newStats);
                });

        return ResponseEntity.ok(toResponse(stats));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable String userId) {
        return statsRepository.findByUserId(userId)
                .map(stats -> ResponseEntity.ok(toResponse(stats)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}/{sport}")
    public ResponseEntity<?> getUserStatsBySport(
            @PathVariable String userId,
            @PathVariable String sport) {
        return statsRepository.findByUserIdAndSport(userId, sport)
                .map(stats -> ResponseEntity.ok(toResponse(stats)))
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

    private PlayerStatsResponse toResponse(PlayerStats stats) {
        double winRate = stats.getMatchesPlayed() > 0
                ? (double) stats.getMatchesWon() / stats.getMatchesPlayed() * 100
                : 0.0;

        return new PlayerStatsResponse(
                stats.getUserId(),
                stats.getSport(),
                stats.getMatchesPlayed(),
                stats.getMatchesWon(),
                stats.getTournamentsPlayed(),
                stats.getTournamentsWon(),
                Math.round(winRate * 10.0) / 10.0,
                stats.getAvgSpeed(),
                stats.getAvgAgility(),
                stats.getEndurance(),
                stats.getGoals(),
                stats.getAssists(),
                stats.getPasses(),
                stats.getPassAccuracy(),
                stats.getPoints(),
                stats.getRebounds(),
                stats.getSteals(),
                stats.getBlocks(),
                stats.getConsensusRating(),
                stats.getUnverifiedRating(),
                stats.getTotalRatingsReceived()
        );
    }
}
