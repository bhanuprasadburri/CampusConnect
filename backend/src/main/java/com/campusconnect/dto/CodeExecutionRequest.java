package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CodeExecutionRequest {

    @NotBlank(message = "sourceCode is required")
    @Size(max = 20000, message = "sourceCode must be at most 20000 characters")
    private String sourceCode;

    @NotBlank(message = "programmingLanguage is required")
    @Size(max = 20, message = "programmingLanguage must be at most 20 characters")
    private String programmingLanguage;

    @Size(max = 10000, message = "standardInput must be at most 10000 characters")
    private String standardInput;

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getProgrammingLanguage() { return programmingLanguage; }
    public void setProgrammingLanguage(String programmingLanguage) { this.programmingLanguage = programmingLanguage; }

    public String getStandardInput() { return standardInput; }
    public void setStandardInput(String standardInput) { this.standardInput = standardInput; }
}
