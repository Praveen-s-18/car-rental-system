package com.example.CarRentalSystem.service;

import com.example.CarRentalSystem.entity.Booking;
import com.example.CarRentalSystem.entity.Car;
import com.example.CarRentalSystem.entity.User;
import com.example.CarRentalSystem.repository.BookingRepository;
import com.example.CarRentalSystem.repository.CarRepository;
import com.example.CarRentalSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final CarService carService;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          CarRepository carRepository,
                          CarService carService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.carService = carService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Integer id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByUser(Integer userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.map(bookingRepository::findByUser).orElse(List.of());
    }

    public List<Booking> getBookingsByCar(Integer carId) {
        Optional<Car> car = carRepository.findById(carId);
        return car.map(bookingRepository::findByCar).orElse(List.of());
    }

    public List<Booking> getBookingsByStatus(String status) {
        return bookingRepository.findByBookingStatus(status);
    }

    @Transactional
    public Booking saveBooking(Booking booking) {
        try {
            // Set default status if not provided
            if (booking.getBookingStatus() == null || booking.getBookingStatus().isEmpty()) {
                booking.setBookingStatus("Pending");
            }

            // Fetch complete User and Car entities
            Optional<User> userOpt = userRepository.findById(booking.getUser().getUserId());
            Optional<Car> carOpt = carRepository.findById(booking.getCar().getCarId());

            if (!userOpt.isPresent()) {
                throw new RuntimeException("User not found with ID: " + booking.getUser().getUserId());
            }

            if (!carOpt.isPresent()) {
                throw new RuntimeException("Car not found with ID: " + booking.getCar().getCarId());
            }

            // Set the complete entities
            booking.setUser(userOpt.get());
            booking.setCar(carOpt.get());

            // If this is a new booking with Confirmed status, decrement car availability
            if (booking.getBookingId() == null && "Confirmed".equals(booking.getBookingStatus())) {
                boolean updated = carService.decrementCarAvailability(booking.getCar().getCarId());
                if (!updated) {
                    throw new RuntimeException("Could not update car availability. Car might be unavailable.");
                }
            }

            return bookingRepository.save(booking);
        } catch (Exception e) {
            throw new RuntimeException("Error saving booking: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Optional<Booking> updateBookingStatus(Integer bookingId, String status) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            String previousStatus = booking.getBookingStatus();
            booking.setBookingStatus(status);

            // If booking is being canceled, increment car availability
            if (previousStatus.equals("Confirmed") && status.equals("Cancelled")) {
                carService.incrementCarAvailability(booking.getCar().getCarId());
            }
            // If booking is being confirmed, decrement car availability
            else if (!previousStatus.equals("Confirmed") && status.equals("Confirmed")) {
                boolean updated = carService.decrementCarAvailability(booking.getCar().getCarId());
                if (!updated) {
                    throw new RuntimeException("Could not update car availability. Car might be unavailable.");
                }
            }
            // If booking is completed, increment car availability
            else if (previousStatus.equals("Confirmed") && status.equals("Completed")) {
                carService.incrementCarAvailability(booking.getCar().getCarId());
            }

            return Optional.of(bookingRepository.save(booking));
        }
        return Optional.empty();
    }

    public void deleteBooking(Integer id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            // If booking was confirmed, increment car availability
            if ("Confirmed".equals(booking.getBookingStatus())) {
                carService.incrementCarAvailability(booking.getCar().getCarId());
            }
            bookingRepository.deleteById(id);
        }
    }

    public List<Booking> getCurrentBookings() {
        LocalDateTime now = LocalDateTime.now();
        return bookingRepository.findCurrentBookings(now, "Confirmed");
    }

    public List<Booking> getBookingsByUser(User user) {
        return bookingRepository.findByUser(user);
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        // Validate car exists and is available
        Car car = carService.getCarById(booking.getCar().getCarId())
                .orElseThrow(() -> new IllegalArgumentException("Car not found with id: " + booking.getCar().getCarId()));
        
        if (car.getAvailableCount() <= 0 || !"Available".equals(car.getStatus())) {
            throw new IllegalStateException("Car is not available for booking: " + car.getMake() + " " + car.getModel());
        }
        
        // Set initial booking status
        booking.setBookingStatus("Pending");
        
        // Save the booking first
        Booking savedBooking = bookingRepository.save(booking);
        
        // Decrement car availability
        carService.decrementAvailableCount(car.getCarId());
        
        return savedBooking;
    }

    // Add a method to handle cancellations that would increment car availability
    @Transactional
    public Booking cancelBooking(Integer bookingId) {
        Booking booking = getBookingById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + bookingId));
        
        // Only allow cancellation if the booking is pending or confirmed, not if it's already cancelled
        if (!"Cancelled".equals(booking.getBookingStatus())) {
            booking.setBookingStatus("Cancelled");
            
            // Increment the car's availability count
            Car car = booking.getCar();
            carService.incrementAvailableCount(car.getCarId());
            
            return bookingRepository.save(booking);
        }
        
        return booking;
    }
}