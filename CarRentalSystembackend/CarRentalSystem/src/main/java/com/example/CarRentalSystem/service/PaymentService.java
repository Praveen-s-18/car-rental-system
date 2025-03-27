package com.example.CarRentalSystem.service;

import com.example.CarRentalSystem.entity.Booking;
import com.example.CarRentalSystem.entity.Payment;
import com.example.CarRentalSystem.repository.BookingRepository;
import com.example.CarRentalSystem.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    public Optional<Payment> getPaymentByBooking(Booking booking) {
        return paymentRepository.findByBooking(booking);
    }

    public List<Payment> getPaymentsByStatus(String status) {
        return paymentRepository.findByPaymentStatus(status);
    }

    public List<Payment> getPaymentsByMethod(String method) {
        return paymentRepository.findByPaymentMethod(method);
    }

    public List<Payment> getPaymentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByPaymentDateBetween(start, end);
    }

    @Transactional
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Transactional
    public Optional<Payment> updatePaymentStatus(Integer paymentId, String status) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setPaymentStatus(status);

            // If payment is completed, update booking status to Confirmed
            if ("Completed".equals(status) && payment.getBooking() != null) {
                Booking booking = payment.getBooking();
                if ("Pending".equals(booking.getBookingStatus())) {
                    booking.setBookingStatus("Confirmed");
                    bookingRepository.save(booking);
                }
            }

            return Optional.of(paymentRepository.save(payment));
        }
        return Optional.empty();
    }

    @Transactional
    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }

    public Double getTotalCompletedPayments() {
        Double total = paymentRepository.findTotalCompletedPayments();
        return total != null ? total : 0.0;
    }

    public Double getTotalPaymentsInPeriod(LocalDateTime start, LocalDateTime end) {
        Double total = paymentRepository.findTotalPaymentsInPeriod(start, end);
        return total != null ? total : 0.0;
    }
}