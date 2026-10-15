package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementApplicationDto {
    private String id;
    private String driveId;
    private String companyName;
    private String jobRole;
    private String packageLpa;
    private LocalDateTime appliedAt;
    private String status;
    private String remarks;
}
