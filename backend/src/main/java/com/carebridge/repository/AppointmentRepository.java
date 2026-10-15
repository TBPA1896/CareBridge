package com.carebridge.repository;

import com.carebridge.model.Appointment;
import com.carebridge.model.AppointmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatientIdOrderByScheduledDateTimeAsc(String patientId);
    List<Appointment> findByPatientIdAndStatus(String patientId, AppointmentStatus status);
    List<Appointment> findByPatientIdAndScheduledDateTimeAfterOrderByScheduledDateTimeAsc(String patientId, LocalDateTime after);
}
