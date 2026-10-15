package com.carebridge.repository;

import com.carebridge.model.CaregiverLink;
import com.carebridge.model.CaregiverLinkStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaregiverLinkRepository extends MongoRepository<CaregiverLink, String> {
    List<CaregiverLink> findByPatientId(String patientId);
    List<CaregiverLink> findByCaregiverId(String caregiverId);
    List<CaregiverLink> findByCaregiverIdAndStatus(String caregiverId, CaregiverLinkStatus status);
    List<CaregiverLink> findByPatientIdAndStatus(String patientId, CaregiverLinkStatus status);
    Optional<CaregiverLink> findByPatientIdAndCaregiverId(String patientId, String caregiverId);
    boolean existsByPatientIdAndCaregiverId(String patientId, String caregiverId);
    long countByStatus(CaregiverLinkStatus status);
}
