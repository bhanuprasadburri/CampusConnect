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
public class CreateServiceRequestDto {
    @NotBlank(message = "Request type is required")
    private String requestType; // BONAFIDE, TRANSCRIPT, ID_CARD, GRIEVANCE, OTHER

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Description / remarks is required")
    private String description;
}
