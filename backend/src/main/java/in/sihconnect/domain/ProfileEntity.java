package in.sihconnect.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "profile")
public class ProfileEntity {
    @Id @Column(name = "user_id") private UUID userId;
    private String phone;
    @Column(nullable = false) private String program;
    @Column(name = "declared_skills", columnDefinition = "jsonb", nullable = false) private String declaredSkills = "[]";
    protected ProfileEntity() {}
    public ProfileEntity(UUID userId, String program) { this.userId = userId; this.program = program; }
    public UUID getUserId() { return userId; } public String getPhone() { return phone; } public String getProgram() { return program; } public String getDeclaredSkills() { return declaredSkills; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setProgram(String program) { this.program = program; }
    public void setDeclaredSkills(String declaredSkills) { this.declaredSkills = declaredSkills; }
}
