package com.carebridge.repository;

import com.carebridge.model.PlanStatus;
import com.carebridge.model.RecoveryPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecoveryPlanRepository extends MongoRepository<RecoveryPlan, String> {
    List<RecoveryPlan> findByPatientId(String patientId);
    Optional<RecoveryPlan> findByPatientIdAndStatus(String patientId, PlanStatus status);
    List<RecoveryPlan> findByStatus(PlanStatus status);
    long countByStatus(PlanStatus status);
}
