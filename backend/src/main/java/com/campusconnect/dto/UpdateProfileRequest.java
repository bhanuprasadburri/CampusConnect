package com.campusconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @Pattern(regexp = "^[+\\d][\\d\\s-]{6,19}$", message = "Phone number is invalid")
    private String phone;

    @Pattern(regexp = "^[+\\d][\\d\\s-]{6,19}$", message = "Guardian phone number is invalid")
    private String guardianPhone;

    @Email(message = "Guardian email address is invalid")
    @Size(max = 254, message = "Guardian email is too long")
    private String guardianEmail;

    @Size(max = 500, message = "Profile photo URL is too long")
    private String profilePhotoUrl;

    @Size(max = 500, message = "Portfolio URL is too long")
    private String portfolioUrl;

    @Size(max = 500, message = "GitHub URL is too long")
    private String githubUrl;

    @Size(max = 500, message = "LinkedIn URL is too long")
    private String linkedinUrl;
}
