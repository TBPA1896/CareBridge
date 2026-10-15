package com.carebridge.repository;

import com.carebridge.model.AlertType;
import com.carebridge.model.DeviationAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviationAlertRepository extends MongoRepository<DeviationAlert, String> {
    List<DeviationAlert> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<DeviationAlert> findByPatientIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(String patientId);
    List<DeviationAlert> findByIsAcknowledgedFalseOrderByCreatedAtDesc();
    List<DeviationAlert> findAllByOrderByCreatedAtDesc();
    Optional<DeviationAlert> findByTaskIdAndAlertTypeAndIsAcknowledgedFalse(String taskId, AlertType alertType);
    long countByIsAcknowledgedFalse();
    long countByPatientIdAndIsAcknowledgedFalse(String patientId);
}
