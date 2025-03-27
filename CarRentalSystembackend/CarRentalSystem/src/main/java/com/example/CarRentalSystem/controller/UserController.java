package com.example.CarRentalSystem.controller;

import com.example.CarRentalSystem.entity.User;
import com.example.CarRentalSystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        try {
            return userService.getUserById(id)
                    .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            // Check if username or email already exists
            if (userService.existsByUsername(user.getUsername())) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            if (userService.existsByEmail(user.getEmail())) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }

            User savedUser = userService.saveUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User user) {
        try {
            return userService.getUserById(id)
                    .map(existingUser -> {
                        // Check if username is being changed and already exists
                        if (!existingUser.getUsername().equals(user.getUsername()) &&
                                userService.existsByUsername(user.getUsername())) {
                            return new ResponseEntity<User>(HttpStatus.CONFLICT);
                        }

                        // Check if email is being changed and already exists
                        if (!existingUser.getEmail().equals(user.getEmail()) &&
                                userService.existsByEmail(user.getEmail())) {
                            return new ResponseEntity<User>(HttpStatus.CONFLICT);
                        }

                        user.setUserId(id);
                        User updatedUser = userService.saveUser(user);
                        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            return userService.getUserById(id)
                    .map(user -> {
                        userService.deleteUser(id);
                        return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            // Extract username from token
            String username = userService.getUsernameFromToken(token.replace("Bearer ", ""));
            if (username == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            return userService.getUserByUsername(username)
                    .map(user -> {
                        // Remove sensitive information
                        user.setPassword(null);
                        return new ResponseEntity<>(user, HttpStatus.OK);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}