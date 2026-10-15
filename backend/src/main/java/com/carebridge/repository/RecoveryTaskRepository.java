package com.carebridge.repository;

import com.carebridge.model.RecoveryTask;
import com.carebridge.model.TaskCategory;
import com.carebridge.model.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecoveryTaskRepository extends MongoRepository<RecoveryTask, String> {
    List<RecoveryTask> findByRecoveryPlanId(String recoveryPlanId);
    List<RecoveryTask> findByPatientIdAndScheduledDate(String patientId, LocalDate scheduledDate);
    List<RecoveryTask> findByPatientId(String patientId);
    List<RecoveryTask> findByRecoveryPlanIdAndScheduledDate(String recoveryPlanId, LocalDate scheduledDate);
    List<RecoveryTask> findByPatientIdAndCategory(String patientId, TaskCategory category);
    List<RecoveryTask> findByPatientIdAndStatus(String patientId, TaskStatus status);
    List<RecoveryTask> findByPatientIdAndScheduledDateLessThanEqualAndStatus(String patientId, LocalDate date, TaskStatus status);
    long countByPatientIdAndStatus(String patientId, TaskStatus status);
    long countByStatus(TaskStatus status);
    boolean existsByRecoveryPlanId(String recoveryPlanId);
}
