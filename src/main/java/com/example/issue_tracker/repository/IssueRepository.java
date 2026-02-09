package com.example.issue_tracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.issue_tracker.entity.Issue;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    // Basic CRUD operations are already included!
}