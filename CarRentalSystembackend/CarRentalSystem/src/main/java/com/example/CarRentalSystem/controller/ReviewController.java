package com.example.CarRentalSystem.controller;

import com.example.CarRentalSystem.dto.ReviewDTO;
import com.example.CarRentalSystem.entity.Booking;
import com.example.CarRentalSystem.entity.Review;
import com.example.CarRentalSystem.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        try {
            List<Review> reviews = reviewService.getAllReviews();
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Integer id) {
        try {
            return reviewService.getReviewById(id)
                    .map(review -> new ResponseEntity<>(review, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Review> getReviewByBooking(@PathVariable Integer bookingId) {
        try {
            return reviewService.getReviewByBookingId(bookingId)
                    .map(review -> new ResponseEntity<>(review, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<Review>> getReviewsByCar(@PathVariable Integer carId) {
        try {
            List<Review> reviews = reviewService.getReviewsByCar(carId);
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/car/{carId}/rating")
    public ResponseEntity<Double> getAverageRatingForCar(@PathVariable Integer carId) {
        try {
            Double averageRating = reviewService.getAverageRatingForCar(carId);
            return new ResponseEntity<>(averageRating, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            System.out.println("Received review DTO: " + reviewDTO);

            // Validate rating
            if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                return new ResponseEntity<>("Rating must be between 1 and 5", HttpStatus.BAD_REQUEST);
            }

            // Validate booking ID
            // Validate booking ID
            if (reviewDTO.getBookingId() == null) {
                return new ResponseEntity<>("Booking ID is required", HttpStatus.BAD_REQUEST);
            }

            // Create Review entity from DTO
            Review review = new Review();
            Booking booking = new Booking();
            booking.setBookingId(reviewDTO.getBookingId());
            review.setBooking(booking);
            review.setRating(reviewDTO.getRating());
            review.setComment(reviewDTO.getComment());

            Review savedReview = reviewService.saveReview(review);
            return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating review: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Error creating review: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Integer id, @RequestBody ReviewDTO reviewDTO) {
        try {
            return reviewService.getReviewById(id)
                    .map(existingReview -> {
                        // Validate rating
                        if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                            return new ResponseEntity<Review>(HttpStatus.BAD_REQUEST);
                        }

                        // Update fields from DTO
                        if (reviewDTO.getBookingId() != null) {
                            Booking booking = new Booking();
                            booking.setBookingId(reviewDTO.getBookingId());
                            existingReview.setBooking(booking);
                        }
                        existingReview.setRating(reviewDTO.getRating());
                        existingReview.setComment(reviewDTO.getComment());

                        Review updatedReview = reviewService.saveReview(existingReview);
                        return new ResponseEntity<>(updatedReview, HttpStatus.OK);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer id) {
        try {
            return reviewService.getReviewById(id)
                    .map(review -> {
                        reviewService.deleteReview(id);
                        return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}