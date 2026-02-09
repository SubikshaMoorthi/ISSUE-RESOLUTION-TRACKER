package com.example.issue_tracker.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.service.IssueService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public Issue addIssue(@RequestBody Issue issue) {
        return issueService.createIssue(issue);
    }

    @GetMapping
    public List<Issue> getIssues() {
        return issueService.getAllIssues();
    }
}