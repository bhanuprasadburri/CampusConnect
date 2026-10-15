package com.campusconnect.service;

import com.campusconnect.dto.AssignmentDto;
import com.campusconnect.dto.AssignmentSubmissionDto;
import com.campusconnect.dto.SubmitAssignmentRequest;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.model.*;
import com.campusconnect.repository.AssignmentRepository;
import com.campusconnect.repository.AssignmentSubmissionRepository;
import com.campusconnect.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<AssignmentDto> getStudentAssignments(StudentProfile student) {
        List<Subject> subjects = subjectRepository.findByInstitutionIdAndDepartmentAndSemester(
                student.getInstitutionId(), student.getDepartment(), student.getCurrentSemester());

        List<Assignment> assignments = assignmentRepository.findBySubjectInOrderByDueDateDesc(subjects);
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByStudent(student);

        return assignments.stream().map(a -> {
            Optional<AssignmentSubmission> sub = submissions.stream()
                    .filter(s -> s.getAssignment().getId().equals(a.getId()))
                    .findFirst();

            return AssignmentDto.builder()
                    .id(a.getId())
                    .subjectId(a.getSubject().getId())
                    .subjectCode(a.getSubject().getCode())
                    .subjectName(a.getSubject().getName())
                    .title(a.getTitle())
                    .description(a.getDescription())
                    .dueDate(a.getDueDate())
                    .maxMarks(a.getMaxMarks())
                    .submitted(sub.isPresent())
                    .submissionStatus(sub.map(AssignmentSubmission::getStatus).orElse("PENDING"))
                    .submittedAt(sub.map(AssignmentSubmission::getSubmissionDate).orElse(null))
                    .submissionFileUrl(sub.map(AssignmentSubmission::getFileUrl).orElse(null))
                    .submissionRemarks(sub.map(AssignmentSubmission::getRemarks).orElse(null))
                    .marksObtained(sub.map(AssignmentSubmission::getMarksObtained).orElse(null))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public AssignmentSubmissionDto submitAssignment(StudentProfile student, String assignmentId, SubmitAssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        AssignmentSubmission submission = assignmentSubmissionRepository.findByAssignmentAndStudent(assignment, student)
                .orElse(AssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        submission.setSubmissionDate(LocalDateTime.now());
        submission.setFileUrl(request.getFileUrl());
        submission.setRemarks(request.getRemarks());
        submission.setStatus("SUBMITTED");

        AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);

        return AssignmentSubmissionDto.builder()
                .id(saved.getId())
                .assignmentId(assignment.getId())
                .assignmentTitle(assignment.getTitle())
                .submissionDate(saved.getSubmissionDate())
                .fileUrl(saved.getFileUrl())
                .remarks(saved.getRemarks())
                .status(saved.getStatus())
                .marksObtained(saved.getMarksObtained())
                .build();
    }
}
