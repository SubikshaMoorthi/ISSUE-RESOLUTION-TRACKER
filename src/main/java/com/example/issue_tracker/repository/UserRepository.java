package com.example.issue_tracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.issue_tracker.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find users by their specific role (e.g., ADMIN, RESOLVER)
    List<User> findByRole(String role);

    // Find resolvers within a specific department (e.g., 'IT', 'Finance')
    List<User> findByRoleAndDepartment(String role, String department);
}