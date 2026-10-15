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
public class ServiceRequestDto {
    private String id;
    private String requestType;
    private String department;
    private String description;
    private String status;
    private String resolutionRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
