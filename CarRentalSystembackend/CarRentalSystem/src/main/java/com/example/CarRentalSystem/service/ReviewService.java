package com.example.CarRentalSystem.service;

import com.example.CarRentalSystem.entity.Booking;
import com.example.CarRentalSystem.entity.Review;
import com.example.CarRentalSystem.repository.BookingRepository;
import com.example.CarRentalSystem.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Optional<Review> getReviewById(Integer id) {
        return reviewRepository.findById(id);
    }

    public Optional<Review> getReviewByBookingId(Integer bookingId) {
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        return booking.flatMap(reviewRepository::findByBooking);
    }

    public List<Review> getReviewsByCar(Integer carId) {
        return reviewRepository.findRecentReviewsByCarId(carId);
    }

    public List<Review> getReviewsByRating(Integer rating) {
        return reviewRepository.findByRating(rating);
    }

    public List<Review> getReviewsByMinRating(Integer minRating) {
        return reviewRepository.findByRatingGreaterThanEqual(minRating);
    }

    public Double getAverageRatingForCar(Integer carId) {
        Double avgRating = reviewRepository.findAverageRatingByCarId(carId);
        return avgRating != null ? avgRating : 0.0;
    }

    @Transactional
    public Review saveReview(Review review) {
        try {
            // Validate rating (between 1-5)
            if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
                throw new RuntimeException("Rating must be between 1 and 5");
            }

            // Ensure booking exists if provided
            if (review.getBooking() != null && review.getBooking().getBookingId() != null) {
                Optional<Booking> bookingOpt = bookingRepository.findById(review.getBooking().getBookingId());
                if (!bookingOpt.isPresent()) {
                    throw new RuntimeException("Booking not found with ID: " + review.getBooking().getBookingId());
                }

                // Check if this booking already has a review
                Optional<Review> existingReview = reviewRepository.findByBooking(bookingOpt.get());
                if (existingReview.isPresent() && (review.getReviewId() == null ||
                        !review.getReviewId().equals(existingReview.get().getReviewId()))) {
                    throw new RuntimeException("A review already exists for this booking");
                }

                // Comment out this validation check temporarily
            /*
            // Ensure the booking is completed
            Booking booking = bookingOpt.get();
            if (!"Completed".equals(booking.getBookingStatus())) {
                throw new RuntimeException("Can only review completed bookings");
            }
            */

                review.setBooking(bookingOpt.get());
            }

            return reviewRepository.save(review);
        } catch (Exception e) {
            throw new RuntimeException("Error saving review: " + e.getMessage(), e);
        }
    }

    public void deleteReview(Integer id) {
        reviewRepository.deleteById(id);
    }

    public Long getReviewCountForCar(Integer carId) {
        return reviewRepository.countReviewsByCarId(carId);
    }
}