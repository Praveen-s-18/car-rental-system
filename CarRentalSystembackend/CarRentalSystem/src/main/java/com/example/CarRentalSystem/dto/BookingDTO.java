package com.example.CarRentalSystem.dto;

import java.time.LocalDateTime;

public class BookingDTO {
    private Integer userId;
    private Integer carId;
    private LocalDateTime pickupDate;
    private LocalDateTime returnDate;
    private Double totalAmount;
    private String bookingStatus;

    public BookingDTO() {}

    public BookingDTO(Integer userId, Integer carId, LocalDateTime pickupDate,
                      LocalDateTime returnDate, Double totalAmount, String bookingStatus) {
        this.userId = userId;
        this.carId = carId;
        this.pickupDate = pickupDate;
        this.returnDate = returnDate;
        this.totalAmount = totalAmount;
        this.bookingStatus = bookingStatus;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getCarId() {
        return carId;
    }

    public void setCarId(Integer carId) {
        this.carId = carId;
    }

    public LocalDateTime getPickupDate() {
        return pickupDate;
    }

    public void setPickupDate(LocalDateTime pickupDate) {
        this.pickupDate = pickupDate;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDateTime returnDate) {
        this.returnDate = returnDate;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }
}