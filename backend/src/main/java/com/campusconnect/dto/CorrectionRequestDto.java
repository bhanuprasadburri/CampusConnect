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
public class CorrectionRequestDto {
    @NotBlank(message = "Field name to correct is required")
    private String fieldName;

    @NotBlank(message = "Requested corrected value is required")
    private String requestedValue;

    @NotBlank(message = "Reason / justification is required")
    private String reason;
}
