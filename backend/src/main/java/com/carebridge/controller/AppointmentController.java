package com.carebridge.controller;

import com.carebridge.model.Appointment;
import com.carebridge.model.AppointmentStatus;
import com.carebridge.model.Role;
import com.carebridge.repository.AppointmentRepository;
import com.carebridge.repository.CaregiverLinkRepository;
import com.carebridge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final CaregiverLinkRepository caregiverLinkRepository;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(
            @PathVariable String patientId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal.getRole() == Role.PATIENT && !patientId.equals(userPrincipal.getId())) {
            return ResponseEntity.status(403).build();
        }
        if (userPrincipal.getRole() == Role.CAREGIVER) {
            boolean isLinked = caregiverLinkRepository.existsByPatientIdAndCaregiverId(patientId, userPrincipal.getId());
            if (!isLinked) {
                return ResponseEntity.status(403).build();
            }
        }

        return ResponseEntity.ok(appointmentRepository.findByPatientIdOrderByScheduledDateTimeAsc(patientId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLINICIAN', 'ADMIN')")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable String id, @RequestParam AppointmentStatus status) {
        return appointmentRepository.findById(id)
                .map(appt -> {
                    appt.setStatus(status);
                    return ResponseEntity.ok(appointmentRepository.save(appt));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
