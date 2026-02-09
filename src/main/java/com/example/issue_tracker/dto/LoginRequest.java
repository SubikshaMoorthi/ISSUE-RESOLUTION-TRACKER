package com.example.issue_tracker.dto;
import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}