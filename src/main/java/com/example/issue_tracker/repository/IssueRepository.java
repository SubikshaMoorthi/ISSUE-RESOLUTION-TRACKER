package com.example.issue_tracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.entity.User;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    // Find all issues created by a specific user
    List<Issue> findByCreatedBy(User user);

    // Find all issues currently assigned to a specific resolver
    List<Issue> findByAssignedTo(User user);

    // Count how many issues a specific resolver is currently working on
    long countByAssignedTo(User user);
}