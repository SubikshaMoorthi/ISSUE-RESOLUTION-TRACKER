package com.example.issue_tracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    private String status; // e.g., OPEN, IN_PROGRESS, RESOLVED

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    // This method runs automatically before the record is inserted into MySQL
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}