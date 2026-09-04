package in.sihconnect.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class UserEntity {
    @Id private UUID id;
    @Column(nullable = false, unique = true, length = 320) private String email;
    @Column(name = "display_name", nullable = false) private String displayName;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(nullable = false) private String roles;
    @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
    protected UserEntity() {}
    public UserEntity(UUID id, String email, String displayName, String passwordHash, String roles) { this.id = id; this.email = email; this.displayName = displayName; this.passwordHash = passwordHash; this.roles = roles; }
    public UUID getId() { return id; } public String getEmail() { return email; } public String getDisplayName() { return displayName; } public String getPasswordHash() { return passwordHash; } public String getRoles() { return roles; }
}
