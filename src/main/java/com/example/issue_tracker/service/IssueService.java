package com.example.issue_tracker.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.issue_tracker.dto.IssueDTO;
import com.example.issue_tracker.entity.Comment;
import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.entity.Priority;
import com.example.issue_tracker.entity.Role;
import com.example.issue_tracker.entity.Status;
import com.example.issue_tracker.entity.User;
import com.example.issue_tracker.repository.CommentRepository;
import com.example.issue_tracker.repository.IssueRepository;
import com.example.issue_tracker.repository.UserRepository;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    // STEPS 2 & 3: Create Issue with Load-Balanced Auto-Assignment
    @Transactional
    public Issue createIssue(IssueDTO issueDTO) {
        Issue issue = new Issue();
        issue.setTitle(issueDTO.getTitle());
        issue.setDescription(issueDTO.getDescription());
        issue.setCategory(issueDTO.getCategory());
        issue.setStatus(Status.OPEN);

        if (issueDTO.getPriority() != null) {
            issue.setPriority(Priority.valueOf(issueDTO.getPriority().toUpperCase()));
        }

        User creator = userRepository.findById(issueDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));
        issue.setCreatedBy(creator);

        // Find resolvers in the same category
        List<User> resolvers = userRepository.findByRoleAndDepartment(Role.RESOLVER, issue.getCategory());

        if (!resolvers.isEmpty()) {
            // Pick resolver with minimum active (non-resolved) issues
            User assignee = resolvers.stream()
                .min(Comparator.comparingInt(r -> issueRepository.countByAssignedToAndStatusNot(r, Status.RESOLVED)))
                .orElse(resolvers.get(0));
            issue.setAssignedTo(assignee);
        }
        return issueRepository.save(issue);
    }

    // STEP 4: Resolver Status Update & Communication
    public Issue updateResolverStatus(Long issueId, Status newStatus, User resolver) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (!issue.getAssignedTo().getId().equals(resolver.getId())) {
            throw new RuntimeException("Unauthorized: You are not assigned to this issue.");
        }

        Status current = issue.getStatus();
        // Force logical flow: OPEN -> ONGOING -> RESOLVED
        if (newStatus == Status.RESOLVED && current != Status.ONGOING) {
            throw new RuntimeException("Error: Issue must be 'ONGOING' before it can be 'RESOLVED'.");
        }

        issue.setStatus(newStatus);
        return issueRepository.save(issue);
    }

    public Comment addComment(Long issueId, String text, User author) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        Comment comment = new Comment();
        comment.setIssue(issue);
        comment.setText(text);
        comment.setUser(author);
        return commentRepository.save(comment);
    }

    // STEP 5: User Satisfaction Handshake
    @Transactional
    public Issue handleUserSatisfaction(Long issueId, boolean isSatisfied, User user) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (!issue.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Only the reporter can mark satisfaction.");
        }

        if (issue.getStatus() != Status.RESOLVED) {
            throw new RuntimeException("Error: Issue must be 'RESOLVED' first.");
        }

        if (isSatisfied) {
            issue.setSatisfied(true);
        } else {
            issue.setStatus(Status.ONGOING); // Re-open for rework
            issue.setSatisfied(false);
        }
        return issueRepository.save(issue);
    }

    // STEP 6: Restricted Deletion
    public void deleteIssue(Long issueId, User user) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (!issue.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own issues.");
        }

        if (issue.getStatus() != Status.OPEN) {
            throw new RuntimeException("Error: You cannot delete an issue once work has started.");
        }

        issueRepository.delete(issue);
    }

    public List<Issue> getAllIssues() { return issueRepository.findAll(); }
    public List<Issue> getAssignedIssues(User resolver) { return issueRepository.findByAssignedTo(resolver); }
}