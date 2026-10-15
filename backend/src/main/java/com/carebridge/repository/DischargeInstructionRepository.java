package com.carebridge.repository;

import com.carebridge.model.DischargeInstruction;
import com.carebridge.model.VerificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DischargeInstructionRepository extends MongoRepository<DischargeInstruction, String> {
    List<DischargeInstruction> findByPatientId(String patientId);
    List<DischargeInstruction> findByVerificationStatus(VerificationStatus verificationStatus);
    long countByVerificationStatus(VerificationStatus verificationStatus);
}
