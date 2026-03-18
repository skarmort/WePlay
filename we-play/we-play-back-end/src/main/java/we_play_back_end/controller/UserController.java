package we_play_back_end.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import we_play_back_end.model.*;
import we_play_back_end.repository.UserRepository;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUserProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = getAuthenticatedUser();

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName().trim());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        if (request.getSports() != null) {
            Set<String> cleanedSports = request.getSports().stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toSet());
            user.setSports(cleanedSports);

            if (request.getActiveSport() != null && !cleanedSports.contains(request.getActiveSport())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Active sport must be one of your selected sports."));
            }
        }

        if (request.getActiveSport() != null) {
            String activeSport = request.getActiveSport().trim();
            if (user.getSports() == null || user.getSports().isEmpty() || !user.getSports().contains(activeSport)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Active sport must be one of your selected sports."));
            }
            user.setActiveSport(activeSport);
        }

        userRepository.save(Objects.requireNonNull(user, "User must be present"));

        return ResponseEntity.ok(toProfileResponse(user));
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

    private UserProfileResponse toProfileResponse(User user) {
        List<String> roles = user.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
                user.getBio(),
                user.getSports(),
                user.getActiveSport(),
                roles
        );
    }
}