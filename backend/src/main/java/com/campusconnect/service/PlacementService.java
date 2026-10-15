package com.campusconnect.service;

import com.campusconnect.dto.PlacementApplicationDto;
import com.campusconnect.dto.PlacementDriveDto;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.model.PlacementApplication;
import com.campusconnect.model.PlacementDrive;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.repository.PlacementApplicationRepository;
import com.campusconnect.repository.PlacementDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlacementService {

    private final PlacementDriveRepository placementDriveRepository;
    private final PlacementApplicationRepository placementApplicationRepository;

    @Transactional(readOnly = true)
    public List<PlacementDriveDto> getPlacementDrives(StudentProfile student) {
        List<PlacementDrive> drives = placementDriveRepository.findByInstitutionIdOrderByDeadlineAsc(student.getInstitutionId());
        List<PlacementApplication> applications = placementApplicationRepository.findByStudentOrderByAppliedAtDesc(student);

        return drives.stream().map(d -> {
            Optional<PlacementApplication> app = applications.stream()
                    .filter(a -> a.getDrive().getId().equals(d.getId()))
                    .findFirst();

            boolean branchEligible = d.getEligibleBranches() == null ||
                    d.getEligibleBranches().contains(student.getDepartment()) ||
                    d.getEligibleBranches().contains("ALL");

            boolean cgpaEligible = d.getMinCgpa() == null ||
                    student.getCgpa().compareTo(d.getMinCgpa()) >= 0;

            boolean isEligible = branchEligible && cgpaEligible;

            return PlacementDriveDto.builder()
                    .id(d.getId())
                    .companyName(d.getCompanyName())
                    .jobRole(d.getJobRole())
                    .packageLpa(d.getPackageLpa())
                    .minCgpa(d.getMinCgpa())
                    .eligibleBranches(d.getEligibleBranches())
                    .deadline(d.getDeadline())
                    .status(d.getStatus())
                    .companyLogo(d.getCompanyLogo())
                    .description(d.getDescription())
                    .eligible(isEligible)
                    .applied(app.isPresent())
                    .applicationStatus(app.map(PlacementApplication::getStatus).orElse(null))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public PlacementApplicationDto applyForDrive(StudentProfile student, String driveId) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with ID: " + driveId));

        if (placementApplicationRepository.existsByDriveAndStudent(drive, student)) {
            throw new BadRequestException("You have already applied for this placement drive");
        }

        boolean branchEligible = drive.getEligibleBranches() == null ||
                drive.getEligibleBranches().contains(student.getDepartment()) ||
                drive.getEligibleBranches().contains("ALL");

        boolean cgpaEligible = drive.getMinCgpa() == null ||
                student.getCgpa().compareTo(drive.getMinCgpa()) >= 0;

        if (!branchEligible || !cgpaEligible) {
            throw new BadRequestException("You do not meet the eligibility criteria for this drive");
        }

        PlacementApplication app = PlacementApplication.builder()
                .drive(drive)
                .student(student)
                .appliedAt(LocalDateTime.now())
                .status("APPLIED")
                .remarks("Application submitted successfully")
                .build();

        PlacementApplication saved = placementApplicationRepository.save(app);

        return PlacementApplicationDto.builder()
                .id(saved.getId())
                .driveId(drive.getId())
                .companyName(drive.getCompanyName())
                .jobRole(drive.getJobRole())
                .packageLpa(drive.getPackageLpa())
                .appliedAt(saved.getAppliedAt())
                .status(saved.getStatus())
                .remarks(saved.getRemarks())
                .build();
    }

    @Transactional(readOnly = true)
    public List<PlacementApplicationDto> getMyApplications(StudentProfile student) {
        List<PlacementApplication> applications = placementApplicationRepository.findByStudentOrderByAppliedAtDesc(student);
        return applications.stream().map(a -> PlacementApplicationDto.builder()
                .id(a.getId())
                .driveId(a.getDrive().getId())
                .companyName(a.getDrive().getCompanyName())
                .jobRole(a.getDrive().getJobRole())
                .packageLpa(a.getDrive().getPackageLpa())
                .appliedAt(a.getAppliedAt())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .build()).collect(Collectors.toList());
    }
}
