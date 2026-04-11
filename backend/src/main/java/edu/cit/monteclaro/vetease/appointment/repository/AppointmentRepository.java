package edu.cit.monteclaro.vetease.appointment.repository;

import edu.cit.monteclaro.vetease.appointment.model.Appointment;
import edu.cit.monteclaro.vetease.appointment.model.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClientIdOrderByDateAscTimeAsc(Long clientId);

    List<Appointment> findByDateAndStatusInOrderByTimeAsc(LocalDate date, Collection<AppointmentStatus> statuses);

    List<Appointment> findByStatusAndDateGreaterThanEqualOrderByDateAscTimeAsc(AppointmentStatus status, LocalDate date);

    List<Appointment> findByDateAndServiceIdAndStatusIn(LocalDate date, Long serviceId, Collection<AppointmentStatus> statuses);
}
