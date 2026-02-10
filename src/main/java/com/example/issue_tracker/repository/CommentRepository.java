package com.example.issue_tracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.issue_tracker.entity.Comment;
import com.example.issue_tracker.entity.Issue;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Get history for an issue, newest comments first
    List<Comment> findByIssueOrderByCreatedAtDesc(Issue issue);
}