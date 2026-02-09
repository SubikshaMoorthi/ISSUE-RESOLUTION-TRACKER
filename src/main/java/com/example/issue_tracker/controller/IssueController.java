package com.example.issue_tracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.issue_tracker.dto.IssueDTO;
import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.service.IssueService;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*") // Allows React to talk to the backend later
public class IssueController {

    @Autowired
    private IssueService issueService;

    @PostMapping
    public ResponseEntity<Issue> createIssue(@RequestBody IssueDTO issueDTO) {
        return ResponseEntity.ok(issueService.createIssue(issueDTO));
    }

    @GetMapping
    public List<Issue> getAllIssues() {
        return issueService.getAllIssues();
    }
}