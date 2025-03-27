package com.example.CarRentalSystem.repository;

import com.example.CarRentalSystem.entity.Booking;
import com.example.CarRentalSystem.entity.User;
import com.example.CarRentalSystem.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    // Find methods
    List<Booking> findByUser(User user);
    List<Booking> findByCar(Car car);
    List<Booking> findByBookingStatus(String status);
    List<Booking> findByPickupDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.pickupDate <= :now AND b.returnDate >= :now AND b.bookingStatus = :status")
    List<Booking> findCurrentBookings(@Param("now") LocalDateTime now, @Param("status") String status);

    // Update methods
    @Transactional
    @Modifying
    @Query("UPDATE Booking b SET b.bookingStatus = :status WHERE b.bookingId = :bookingId")
    int updateBookingStatus(@Param("bookingId") Integer bookingId, @Param("status") String status);

    // Count methods
    long countByUserAndBookingStatus(User user, String status);
    long countByCarAndBookingStatus(Car car, String status);
}