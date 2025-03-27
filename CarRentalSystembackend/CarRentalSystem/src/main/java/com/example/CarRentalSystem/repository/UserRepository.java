package com.example.CarRentalSystem.repository;

import com.example.CarRentalSystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // Find methods
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // Exists methods
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    // No need to define save(), findAll(), findById(), delete() methods
    // as they are already provided by JpaRepository
}