package com.example.issue_tracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.issue_tracker.entity.Role;
import com.example.issue_tracker.entity.User; // Import your Role Enum

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Used for authentication and duplicate checks
    Optional<User> findByEmail(String email);

    // Core logic for Step 2: Finds resolvers by department for auto-assignment
    List<User> findByRoleAndDepartment(Role role, String department);
}