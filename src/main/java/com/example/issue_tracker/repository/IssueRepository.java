package com.example.issue_tracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.entity.Status;
import com.example.issue_tracker.entity.User;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByCreatedBy(User user);

    List<Issue> findByAssignedTo(User user);

    // Core Logic for Step 3: Count only active (non-resolved) issues
   // Fixes "cannot find symbol" in IssueService
    int countByAssignedToAndStatusNot(User user, Status status);

    // Step 7: For Admin Analytics
    @Query("SELECT i.assignedTo.fullName, COUNT(i) FROM Issue i WHERE i.status != 'RESOLVED' GROUP BY i.assignedTo.fullName")
    List<Object[]> getResolverWorkloadStats();
}