package com.carebridge.repository;

import com.carebridge.model.AdherenceEvent;
import com.carebridge.model.AdherenceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AdherenceEventRepository extends MongoRepository<AdherenceEvent, String> {
    List<AdherenceEvent> findByPatientIdOrderByReportedAtDesc(String patientId);
    List<AdherenceEvent> findByTaskId(String taskId);
    List<AdherenceEvent> findByPatientIdAndReportedAtAfterOrderByReportedAtDesc(String patientId, Instant after);
    List<AdherenceEvent> findByPatientIdAndStatus(String patientId, AdherenceStatus status);
    long countByPatientIdAndStatus(String patientId, AdherenceStatus status);
    long countByStatus(AdherenceStatus status);
}
