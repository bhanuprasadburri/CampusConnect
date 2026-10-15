package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAssignmentRequest {
    @NotBlank(message = "File URL or attachment link is required")
    private String fileUrl;
    private String remarks;
}
