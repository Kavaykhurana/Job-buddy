package in.jobbuddy.repository;

import in.jobbuddy.domain.JobEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<JobEntity, UUID> {}
