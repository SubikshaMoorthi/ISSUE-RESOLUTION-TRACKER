package com.example.issue_tracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.issue_tracker.entity.Comment;
import com.example.issue_tracker.entity.User;
import com.example.issue_tracker.repository.UserRepository;
import com.example.issue_tracker.service.IssueService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private IssueService issueService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{issueId}")
    public ResponseEntity<Comment> addComment(
            @PathVariable Long issueId, 
            @RequestBody String text,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Get the logged-in user who is writing the comment
        User author = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(issueService.addComment(issueId, text, author));
    }
}