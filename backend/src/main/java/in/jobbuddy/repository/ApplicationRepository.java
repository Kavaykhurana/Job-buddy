package in.jobbuddy.repository;

import in.jobbuddy.domain.ApplicationEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<ApplicationEntity, UUID> { List<ApplicationEntity> findByUserId(UUID userId); }
