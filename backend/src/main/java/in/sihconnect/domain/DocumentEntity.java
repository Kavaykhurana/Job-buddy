package in.sihconnect.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document_record")
public class DocumentEntity {
    @Id private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private boolean verified;
    @Column(name = "uploaded_at", nullable = false) private Instant uploadedAt = Instant.now();
    protected DocumentEntity() {}
    public DocumentEntity(UUID id, UUID userId, String title) { this.id = id; this.userId = userId; this.title = title; }
    public UUID getId() { return id; } public UUID getUserId() { return userId; } public String getTitle() { return title; } public boolean isVerified() { return verified; } public Instant getUploadedAt() { return uploadedAt; }
}
