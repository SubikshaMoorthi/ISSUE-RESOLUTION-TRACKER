package com.example.issue_tracker.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.repository.IssueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;

    public Issue createIssue(Issue issue) {
        return issueRepository.save(issue);
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }
}