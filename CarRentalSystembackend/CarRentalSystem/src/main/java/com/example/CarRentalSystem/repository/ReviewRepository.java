package com.example.CarRentalSystem.repository;

import com.example.CarRentalSystem.entity.Review;
import com.example.CarRentalSystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    // Find methods
    Optional<Review> findByBooking(Booking booking);
    List<Review> findByRating(Integer rating);
    List<Review> findByRatingGreaterThanEqual(Integer minRating);

    // Aggregate methods
    @Query("SELECT AVG(r.rating) FROM Review r JOIN r.booking b WHERE b.car.carId = :carId")
    Double findAverageRatingByCarId(@Param("carId") Integer carId);

    @Query("SELECT COUNT(r) FROM Review r JOIN r.booking b WHERE b.car.carId = :carId")
    Long countReviewsByCarId(@Param("carId") Integer carId);

    @Query("SELECT r FROM Review r JOIN r.booking b WHERE b.car.carId = :carId ORDER BY r.reviewId DESC")
    List<Review> findRecentReviewsByCarId(@Param("carId") Integer carId);
}