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
    private final List<Map<String, Object>> applications = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> internships = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> experiences = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> candidates = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> initiatives = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> curriculumNotes = Collections.synchronizedList(new ArrayList<>());

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
    @PostMapping("/profile/skills")
    public ResponseEntity<?> addSkill(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Map<String, Object> body) { User user = authenticated(auth); if (user == null) return unauthorized(); String skill = text(body, "skill"); if (skill == null || skill.isBlank()) return ResponseEntity.badRequest().body(Map.of("detail", "skill is required.")); Map<String, Object> profile = profiles.get(user.id()); @SuppressWarnings("unchecked") List<String> skills = (List<String>) profile.get("declaredSkills"); if (!skills.contains(skill)) skills.add(skill); return ResponseEntity.ok(profile); }
    @DeleteMapping("/profile/skills/{skill}")
    public ResponseEntity<?> removeSkill(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable String skill) { User user = authenticated(auth); if (user == null) return unauthorized(); @SuppressWarnings("unchecked") List<String> skills = (List<String>) profiles.get(user.id()).get("declaredSkills"); skills.removeIf(item -> item.equalsIgnoreCase(skill)); return ResponseEntity.noContent().build(); }
    @PostMapping("/profile/documents")
    public ResponseEntity<?> addDocument(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Map<String, Object> body) { User user = authenticated(auth); if (user == null) return unauthorized(); String title = text(body, "title"); if (title == null || title.isBlank()) return ResponseEntity.badRequest().body(Map.of("detail", "title is required.")); Map<String, Object> document = new LinkedHashMap<>(body); document.put("id", UUID.randomUUID().toString()); document.put("verified", false); document.put("uploadedAt", Instant.now().toString()); @SuppressWarnings("unchecked") List<Map<String, Object>> documents = (List<Map<String, Object>>) profiles.get(user.id()).get("documents"); documents.add(document); return ResponseEntity.status(HttpStatus.CREATED).body(document); }
    @DeleteMapping("/profile/documents/{id}")
    public ResponseEntity<?> removeDocument(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable String id) { User user = authenticated(auth); if (user == null) return unauthorized(); @SuppressWarnings("unchecked") List<Map<String, Object>> documents = (List<Map<String, Object>>) profiles.get(user.id()).get("documents"); documents.removeIf(item -> id.equals(item.get("id"))); return ResponseEntity.noContent().build(); }

    @PostMapping("/candidates/{id}/shortlist")
    public ResponseEntity<?> shortlist(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable String id, @RequestBody Map<String, Object> body) { if (authenticated(auth) == null) return unauthorized(); return mutateCandidate(id, "shortlisted", body.get("shortlisted")); }
    @PostMapping("/candidates/{id}/scorecard")
    public ResponseEntity<?> scorecard(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable String id, @RequestBody Map<String, Object> body) { if (authenticated(auth) == null) return unauthorized(); Map<String, Object> result = new LinkedHashMap<>(body); result.put("id", id); return ResponseEntity.ok(result); }
    private ResponseEntity<?> mutateCandidate(String id, String key, Object value) { return ResponseEntity.ok(Map.of("id", id, key, value)); }

    @GetMapping("/applications")
    public ResponseEntity<?> listApplications(@RequestHeader(value = "Authorization", required = false) String auth) { User user = authenticated(auth); if (user == null) return unauthorized(); return ResponseEntity.ok(applications.stream().filter(item -> user.id().equals(item.get("userId"))).toList()); }

    @PostMapping("/applications")
    public ResponseEntity<?> createApplication(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Map<String, Object> body) { User user = authenticated(auth); if (user == null) return unauthorized(); String jobId = text(body, "jobId"); if (jobId == null) return ResponseEntity.badRequest().body(Map.of("detail", "jobId is required.")); Map<String, Object> application = new LinkedHashMap<>(body); application.put("id", UUID.randomUUID().toString()); application.put("userId", user.id()); application.put("studentName", user.displayName()); application.put("studentEmail", user.email()); application.put("stage", "Submitted"); application.put("appliedAt", Instant.now().toString()); applications.add(application); return ResponseEntity.status(HttpStatus.CREATED).body(application); }

    @GetMapping("/internships")
    public ResponseEntity<?> listInternships(@RequestHeader(value = "Authorization", required = false) String auth) { return authenticated(auth) == null ? unauthorized() : ResponseEntity.ok(internships); }
    @GetMapping("/experiences")
    public ResponseEntity<?> listExperiences(@RequestHeader(value = "Authorization", required = false) String auth) { return authenticated(auth) == null ? unauthorized() : ResponseEntity.ok(experiences); }
    @GetMapping("/candidates")
    public ResponseEntity<?> listCandidates(@RequestHeader(value = "Authorization", required = false) String auth) { return authenticated(auth) == null ? unauthorized() : ResponseEntity.ok(candidates); }
    @GetMapping("/requirements")
    public ResponseEntity<?> listRequirements(@RequestHeader(value = "Authorization", required = false) String auth) { return authenticated(auth) == null ? unauthorized() : ResponseEntity.ok(List.of()); }
    @GetMapping("/initiatives")
    public ResponseEntity<?> listInitiatives(@RequestHeader(value = "Authorization", required = false) String auth) { return authenticated(auth) == null ? unauthorized() : ResponseEntity.ok(initiatives); }
    @GetMapping("/curriculum/notes")
    public ResponseEntity<?> listCurriculumNotes(@RequestHeader(value = "Authorization", required = false) String auth) { return authenticated(auth) == null ? unauthorized() : ResponseEntity.ok(curriculumNotes); }

    @PostMapping("/initiatives")
    public ResponseEntity<?> createInitiative(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Map<String, Object> body) { User user = authenticated(auth); if (user == null) return unauthorized(); Map<String, Object> item = new LinkedHashMap<>(body); item.put("id", UUID.randomUUID().toString()); item.put("participants", 0); initiatives.add(item); return ResponseEntity.status(HttpStatus.CREATED).body(item); }
    @PostMapping("/curriculum/notes")
    public ResponseEntity<?> createCurriculumNote(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Map<String, Object> body) { User user = authenticated(auth); if (user == null) return unauthorized(); Map<String, Object> item = new LinkedHashMap<>(body); item.put("id", UUID.randomUUID().toString()); item.put("createdBy", user.id()); item.put("createdAt", Instant.now().toString()); curriculumNotes.add(item); return ResponseEntity.status(HttpStatus.CREATED).body(item); }

    private String text(Map<String, Object> body, String key) { Object value = body.get(key); return value == null ? null : value.toString().trim(); }

    private User authenticated(String auth) { return auth == null ? null : users.values().stream().filter(user -> user.id().equals(sessions.get(auth.replaceFirst("^Bearer ", "")))).findFirst().orElse(null); }
    private ResponseEntity<Map<String, String>> unauthorized() { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "Authentication required.")); }
    private Map<String, Object> issue(User user) { String token = UUID.randomUUID().toString(); sessions.put(token, user.id()); Map<String, Object> result = new LinkedHashMap<>(publicUser(user)); result.put("accessToken", token); return result; }
    private Map<String, Object> publicUser(User user) { return Map.of("id", user.id(), "email", user.email(), "displayName", user.displayName(), "roles", user.roles()); }
    private Map<String, Object> defaultProfile(User user) { return new LinkedHashMap<>(Map.of("displayName", user.displayName(), "email", user.email(), "program", "Computer Science · Batch 2028", "declaredSkills", List.of(), "documents", List.of())); }

    public record Credentials(String email, String password, String displayName) {}
    private record User(String id, String email, String displayName, String passwordHash, List<String> roles) {}
}
