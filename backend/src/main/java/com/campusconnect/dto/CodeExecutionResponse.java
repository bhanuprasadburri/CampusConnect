package com.campusconnect.dto;

public class CodeExecutionResponse {
    private String output;
    private String compilationError;
    private String runtimeError;
    private String executionTime;
    private boolean compilationSuccessful;

    // Default constructor (required by JPA/Hibernate and some frameworks)
    public CodeExecutionResponse() {
        this.output = "";
        this.compilationError = "";
        this.runtimeError = "";
        this.executionTime = "";
        this.compilationSuccessful = false;
    }

    // All-args constructor
    public CodeExecutionResponse(String output, String compilationError,
                                  String runtimeError, String executionTime,
                                  boolean compilationSuccessful) {
        this.output = output != null ? output : "";
        this.compilationError = compilationError != null ? compilationError : "";
        this.runtimeError = runtimeError != null ? runtimeError : "";
        this.executionTime = executionTime != null ? executionTime : "";
        this.compilationSuccessful = compilationSuccessful;
    }

    // Getters and setters
    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public String getCompilationError() { return compilationError; }
    public void setCompilationError(String compilationError) { this.compilationError = compilationError; }

    public String getRuntimeError() { return runtimeError; }
    public void setRuntimeError(String runtimeError) { this.runtimeError = runtimeError; }

    public String getExecutionTime() { return executionTime; }
    public void setExecutionTime(String executionTime) { this.executionTime = executionTime; }

    public boolean isCompilationSuccessful() { return compilationSuccessful; }
    public void setCompilationSuccessful(boolean compilationSuccessful) { this.compilationSuccessful = compilationSuccessful; }

    @Override
    public String toString() {
        return "CodeExecutionResponse{" +
                "output='" + output + '\'' +
                ", compilationError='" + compilationError + '\'' +
                ", runtimeError='" + runtimeError + '\'' +
                ", executionTime='" + executionTime + '\'' +
                ", compilationSuccessful=" + compilationSuccessful +
                '}';
    }
}