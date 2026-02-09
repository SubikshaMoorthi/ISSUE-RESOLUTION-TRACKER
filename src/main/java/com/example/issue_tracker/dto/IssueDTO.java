package com.example.issue_tracker.dto;

import lombok.Data;

@Data
public class IssueDTO {
    private String title;
    private String description;
    private String category;
    private String priority;
    private Long createdById; // We only send the ID, not the whole User object
}