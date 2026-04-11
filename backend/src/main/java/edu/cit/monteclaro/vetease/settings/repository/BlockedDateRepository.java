package edu.cit.monteclaro.vetease.settings.repository;

import edu.cit.monteclaro.vetease.settings.model.BlockedDate;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockedDateRepository extends JpaRepository<BlockedDate, Long> {

    boolean existsByDate(LocalDate date);

    List<BlockedDate> findAllByOrderByDateAsc();
}
