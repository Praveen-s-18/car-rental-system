package com.example.CarRentalSystem.repository;

import com.example.CarRentalSystem.entity.Payment;
import com.example.CarRentalSystem.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    // Find methods
    Optional<Payment> findByBooking(Booking booking);
    List<Payment> findByPaymentStatus(String status);
    List<Payment> findByPaymentMethod(String paymentMethod);
    List<Payment> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);

    // Update methods
    @Transactional
    @Modifying
    @Query("UPDATE Payment p SET p.paymentStatus = :status WHERE p.paymentId = :paymentId")
    int updatePaymentStatus(@Param("paymentId") Integer paymentId, @Param("status") String status);

    // Sum methods
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'Completed'")
    Double findTotalCompletedPayments();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    Double findTotalPaymentsInPeriod(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}