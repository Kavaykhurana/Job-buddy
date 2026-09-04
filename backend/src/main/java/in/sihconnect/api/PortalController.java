package in.sihconnect.api;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class PortalController {
    private final PasswordEncoder encoder;
    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, String> sessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> profiles = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> jobs = Collections.synchronizedList(new ArrayList<>());

    public PortalController(PasswordEncoder encoder) {
        this.encoder = encoder;
        seed();
    }

    private void seed() {
        jobs.add(new LinkedHashMap<>(Map.of("id", "job-001", "title", "Software Engineer", "organization", "Quantum Systems", "location", "Bengaluru", "type", "Full-time", "required", List.of("Java", "SQL"), "preferred", List.of("Spring Boot"))));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Credentials input) {
        if (input.email() == null || input.password() == null || input.password().length() < 12 || input.displayName() == null) return ResponseEntity.badRequest().body(Map.of("detail", "Display name, email, and a 12-character password are required."));
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        if (users.containsKey(email)) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("detail", "An account with this email already exists."));
        User user = new User(UUID.randomUUID().toString(), email, input.displayName().trim(), encoder.encode(input.password()), List.of("STUDENT"));
        users.put(email, user); profiles.put(user.id(), defaultProfile(user));
        return ResponseEntity.status(HttpStatus.CREATED).body(issue(user));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Credentials input) {
        User user = input.email() == null ? null : users.get(input.email().trim().toLowerCase(Locale.ROOT));
        if (user == null || input.password() == null || !encoder.matches(input.password(), user.passwordHash())) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "Invalid email or password."));
        return ResponseEntity.ok(issue(user));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String auth) { if (auth != null) sessions.remove(auth.replaceFirst("^Bearer ", "")); return ResponseEntity.noContent().build(); }

    @GetMapping("/auth/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String auth) { User user = authenticated(auth); return user == null ? unauthorized() : ResponseEntity.ok(publicUser(user)); }

    @GetMapping("/jobs")
    public ResponseEntity<?> listJobs(@RequestHeader(value = "Authorization", required = false) String auth) { return authenticated(auth) == null ? unauthorized() : ResponseEntity.ok(jobs); }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestHeader(value = "Authorization", required = false) String auth) { User user = authenticated(auth); return user == null ? unauthorized() : ResponseEntity.ok(profiles.get(user.id())); }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Map<String, Object> body) { User user = authenticated(auth); if (user == null) return unauthorized(); Map<String, Object> profile = profiles.get(user.id()); body.forEach((key, value) -> { if (Set.of("displayName", "phone", "program", "declaredSkills").contains(key)) profile.put(key, value); }); return ResponseEntity.ok(profile); }

    private User authenticated(String auth) { return auth == null ? null : users.values().stream().filter(user -> user.id().equals(sessions.get(auth.replaceFirst("^Bearer ", "")))).findFirst().orElse(null); }
    private ResponseEntity<Map<String, String>> unauthorized() { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "Authentication required.")); }
    private Map<String, Object> issue(User user) { String token = UUID.randomUUID().toString(); sessions.put(token, user.id()); Map<String, Object> result = new LinkedHashMap<>(publicUser(user)); result.put("accessToken", token); return result; }
    private Map<String, Object> publicUser(User user) { return Map.of("id", user.id(), "email", user.email(), "displayName", user.displayName(), "roles", user.roles()); }
    private Map<String, Object> defaultProfile(User user) { return new LinkedHashMap<>(Map.of("displayName", user.displayName(), "email", user.email(), "program", "Computer Science · Batch 2028", "declaredSkills", List.of(), "documents", List.of())); }

    public record Credentials(String email, String password, String displayName) {}
    private record User(String id, String email, String displayName, String passwordHash, List<String> roles) {}
}
