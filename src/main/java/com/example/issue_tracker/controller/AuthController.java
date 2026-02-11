package com.example.issue_tracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin; // Added for CrossOrigin
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.issue_tracker.dto.AuthResponse;
import com.example.issue_tracker.dto.LoginRequest;
import com.example.issue_tracker.entity.User;
import com.example.issue_tracker.repository.UserRepository;
import com.example.issue_tracker.security.JwtUtils;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // FIX: Allows React to connect
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            // 1. Authenticate using Spring Security's Manager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            // 2. Fetch User safely
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 3. Generate JWT Token
            String jwt = jwtUtils.generateToken(user.getEmail());

            // Convert Enum to String for the Response
            return ResponseEntity.ok(new AuthResponse(jwt, user.getRole().name(), user.getId()));
            
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Error: Invalid email or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Encrypt the password before saving to MySQL
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }
}