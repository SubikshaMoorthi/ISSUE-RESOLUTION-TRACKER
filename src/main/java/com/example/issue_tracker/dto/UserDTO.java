package com.example.issue_tracker.dto;

import lombok.Data;

@Data
public class UserDTO {
    private String name;
    private String email;
    private String password;
    private String role; // ADMIN, USER, RESOLVER
    private String department;
}