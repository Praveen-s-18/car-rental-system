package com.example.CarRentalSystem.controller;

import com.example.CarRentalSystem.entity.Booking;
import com.example.CarRentalSystem.entity.Payment;
import com.example.CarRentalSystem.service.BookingService;
import com.example.CarRentalSystem.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingService bookingService;

    @Autowired
    public PaymentController(PaymentService paymentService, BookingService bookingService) {
        this.paymentService = paymentService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getAllPayments();
            return new ResponseEntity<>(payments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Integer id) {
        try {
            return paymentService.getPaymentById(id)
                    .map(payment -> new ResponseEntity<>(payment, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> paymentRequest) {
        try {
            // Extract booking ID
            Integer bookingId = (Integer) paymentRequest.get("bookingId");
            if (bookingId == null) {
                return new ResponseEntity<>("Booking ID is required", HttpStatus.BAD_REQUEST);
            }

            // Find the booking
            Optional<Booking> optionalBooking = bookingService.getBookingById(bookingId);
            if (!optionalBooking.isPresent()) {
                return new ResponseEntity<>("Booking not found", HttpStatus.NOT_FOUND);
            }
            
            Booking booking = optionalBooking.get();

            // Extract other payment details
            Double amount = Double.parseDouble(paymentRequest.get("amount").toString());
            String paymentMethod = (String) paymentRequest.get("paymentMethod");
            String paymentStatus = (String) paymentRequest.get("paymentStatus");

            // Create and save payment
            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(amount);
            payment.setPaymentMethod(paymentMethod);
            
            if (paymentStatus != null && !paymentStatus.isEmpty()) {
                payment.setPaymentStatus(paymentStatus);
            }

            Payment savedPayment = paymentService.savePayment(payment);

            // Update booking status
            booking.setBookingStatus("Confirmed");
            bookingService.saveBooking(booking);

            return new ResponseEntity<>(savedPayment, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error creating payment: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Integer id, @RequestBody Payment payment) {
        try {
            return paymentService.getPaymentById(id)
                    .map(existingPayment -> {
                        payment.setPaymentId(id);
                        Payment updatedPayment = paymentService.savePayment(payment);
                        return new ResponseEntity<>(updatedPayment, HttpStatus.OK);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        try {
            Optional<Payment> optionalPayment = paymentService.getPaymentById(id);
            if (!optionalPayment.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            Payment payment = optionalPayment.get();
            payment.setPaymentStatus(status);
            Payment updatedPayment = paymentService.savePayment(payment);

            // If payment is completed, update booking status
            if ("Completed".equals(status)) {
                Booking booking = payment.getBooking();
                booking.setBookingStatus("Confirmed");
                bookingService.saveBooking(booking);
            }

            return new ResponseEntity<>(updatedPayment, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Integer id) {
        try {
            return paymentService.getPaymentById(id)
                    .map(payment -> {
                        paymentService.deletePayment(id);
                        return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}