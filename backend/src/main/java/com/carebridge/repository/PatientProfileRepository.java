package com.carebridge.repository;

import com.carebridge.model.PatientProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientProfileRepository extends MongoRepository<PatientProfile, String> {
    Optional<PatientProfile> findByUserId(String userId);
    void deleteByUserId(String userId);
}
