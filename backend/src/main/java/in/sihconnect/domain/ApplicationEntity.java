package in.sihconnect.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "application", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_id"}))
public class ApplicationEntity {
    @Id private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "job_id", nullable = false) private UUID jobId;
    @Column(nullable = false, columnDefinition = "text") private String statement;
    @Column(nullable = false) private String stage = "Submitted";
    @Column(name = "applied_at", nullable = false) private Instant appliedAt = Instant.now();
    protected ApplicationEntity() {}
    public ApplicationEntity(UUID id, UUID userId, UUID jobId, String statement) { this.id = id; this.userId = userId; this.jobId = jobId; this.statement = statement; }
    public UUID getId() { return id; } public UUID getUserId() { return userId; } public UUID getJobId() { return jobId; } public String getStatement() { return statement; } public String getStage() { return stage; }
}
