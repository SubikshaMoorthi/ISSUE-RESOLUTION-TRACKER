package com.example.issue_tracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String department; // Applicable for RESOLVER role

    // Relationship: One user can create many issues
    @OneToMany(mappedBy = "createdBy")
    private List<Issue> createdIssues;
}

enum Role { ADMIN, USER, RESOLVER }