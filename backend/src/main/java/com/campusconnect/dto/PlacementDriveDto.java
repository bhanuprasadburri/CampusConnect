package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementDriveDto {
    private String id;
    private String companyName;
    private String jobRole;
    private String packageLpa;
    private BigDecimal minCgpa;
    private String eligibleBranches;
    private LocalDate deadline;
    private String status;
    private String companyLogo;
    private String description;
    private boolean eligible;
    private boolean applied;
    private String applicationStatus;
}
