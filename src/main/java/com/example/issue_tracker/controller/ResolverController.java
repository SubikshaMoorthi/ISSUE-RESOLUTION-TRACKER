package com.example.issue_tracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.entity.Status;
import com.example.issue_tracker.entity.User;
import com.example.issue_tracker.repository.UserRepository;
import com.example.issue_tracker.service.IssueService;

@RestController
@RequestMapping("/api/resolver")
public class ResolverController {

    @Autowired
    private IssueService issueService;

    @Autowired
    private UserRepository userRepository;

    // View assigned issues only
    @GetMapping("/my-issues")
    public ResponseEntity<List<Issue>> getMyIssues(@AuthenticationPrincipal UserDetails userDetails) {
        User resolver = userRepository.findByEmail(userDetails.getUsername()).get();
        return ResponseEntity.ok(issueService.getAssignedIssues(resolver));
    }

    // Update status
    @PatchMapping("/issues/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id, 
            @RequestParam Status status,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User resolver = userRepository.findByEmail(userDetails.getUsername()).get();
        try {
            Issue updated = issueService.updateResolverStatus(id, status, resolver);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}