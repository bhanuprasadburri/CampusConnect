package com.campusconnect.service;

import com.campusconnect.dto.CreateServiceRequestDto;
import com.campusconnect.dto.ServiceRequestDto;
import com.campusconnect.model.ServiceRequest;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;

    @Transactional(readOnly = true)
    public List<ServiceRequestDto> getStudentRequests(StudentProfile student) {
        List<ServiceRequest> list = serviceRequestRepository.findByStudentOrderByCreatedAtDesc(student);
        return list.stream().map(r -> ServiceRequestDto.builder()
                .id(r.getId())
                .requestType(r.getRequestType())
                .department(r.getDepartment())
                .description(r.getDescription())
                .status(r.getStatus())
                .resolutionRemarks(r.getResolutionRemarks())
                .createdAt(r.getCreatedAt())
                .resolvedAt(r.getResolvedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public ServiceRequestDto createRequest(StudentProfile student, CreateServiceRequestDto dto) {
        ServiceRequest req = ServiceRequest.builder()
                .student(student)
                .requestType(dto.getRequestType())
                .department(dto.getDepartment())
                .description(dto.getDescription())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        ServiceRequest saved = serviceRequestRepository.save(req);
        return ServiceRequestDto.builder()
                .id(saved.getId())
                .requestType(saved.getRequestType())
                .department(saved.getDepartment())
                .description(saved.getDescription())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
