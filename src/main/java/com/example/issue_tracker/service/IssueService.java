package com.example.issue_tracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.issue_tracker.dto.IssueDTO;
import com.example.issue_tracker.entity.Issue;
import com.example.issue_tracker.entity.Priority;
import com.example.issue_tracker.entity.Status;
import com.example.issue_tracker.entity.User;
import com.example.issue_tracker.repository.IssueRepository;
import com.example.issue_tracker.repository.UserRepository;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Creates a new Issue and links it to a creator (User).
     * Converts String priority from DTO to the required Enum type.
     */
    public Issue createIssue(IssueDTO issueDTO) {
        Issue issue = new Issue();
        issue.setTitle(issueDTO.getTitle());
        issue.setDescription(issueDTO.getDescription());
        issue.setCategory(issueDTO.getCategory());

        // Convert the String "HIGH", "MEDIUM", or "LOW" to the actual Priority Enum
        if (issueDTO.getPriority() != null) {
            issue.setPriority(Priority.valueOf(issueDTO.getPriority().toUpperCase()));
        }
        
        // Every new issue starts with the 'OPEN' status by default
        issue.setStatus(Status.OPEN);

        // Fetch the User from the database using the ID provided in the DTO
        User creator = userRepository.findById(issueDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + issueDTO.getCreatedById()));
        
        // Establish the relationship between the Issue and the User
        issue.setCreatedBy(creator);
        
        return issueRepository.save(issue);
    }

    /**
     * Retrieves all issues currently stored in the MySQL database.
     */
    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }
}