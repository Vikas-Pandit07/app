package com.outloox.dto;

import java.time.Instant;
import java.util.Map;

public class ApiErrorResponse {

    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> fieldErrors;

    public static ApiErrorResponse of(int status, String error, String message, String path) {
        ApiErrorResponse response = new ApiErrorResponse();
        response.timestamp = Instant.now();
        response.status = status;
        response.error = error;
        response.message = message;
        response.path = path;
        return response;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }
}
