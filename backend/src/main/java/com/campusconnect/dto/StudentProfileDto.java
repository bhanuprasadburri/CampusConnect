package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDto {
    private String id;
    private String rollNo;
    private String regNo;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String department;
    private String program;
    private Integer currentYear;
    private Integer currentSemester;
    private String section;
    private String phone;
    private BigDecimal cgpa;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    private String profilePhotoUrl;
    private String portfolioUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String institutionName;
    private String institutionCode;
}
