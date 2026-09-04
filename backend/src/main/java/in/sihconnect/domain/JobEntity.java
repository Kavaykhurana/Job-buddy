package in.sihconnect.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job")
public class JobEntity {
    @Id private UUID id;
    @Column(name = "owner_id") private UUID ownerId;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private String organization;
    private String location; private String type; @Column(columnDefinition = "text") private String summary;
    @Column(name = "required", columnDefinition = "jsonb", nullable = false) private String required = "[]";
    @Column(name = "preferred", columnDefinition = "jsonb", nullable = false) private String preferred = "[]";
    @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
    protected JobEntity() {}
    public JobEntity(UUID id, String title, String organization) { this.id = id; this.title = title; this.organization = organization; }
    public UUID getId() { return id; } public UUID getOwnerId() { return ownerId; } public String getTitle() { return title; } public String getOrganization() { return organization; } public String getLocation() { return location; } public String getType() { return type; } public String getSummary() { return summary; } public String getRequired() { return required; } public String getPreferred() { return preferred; }
}
