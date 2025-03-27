package com.example.CarRentalSystem.service;

import com.example.CarRentalSystem.entity.Car;
import com.example.CarRentalSystem.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CarService {

    private final CarRepository carRepository;

    @Autowired
    public CarService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public Optional<Car> getCarById(Integer id) {
        return carRepository.findById(id);
    }

    public List<Car> getAvailableCars() {
        return carRepository.findAvailableCars();
    }

    public List<Car> getCarsByCategory(String category) {
        return carRepository.findByCategory(category);
    }

    public List<Car> getCarsByMake(String make) {
        return carRepository.findByMake(make);
    }

    public List<Car> getCarsByPriceRange(Double minPrice, Double maxPrice) {
        return carRepository.findByDailyRateBetween(minPrice, maxPrice);
    }

    public Car saveCar(Car car) {
        return carRepository.save(car);
    }

    public void deleteCar(Integer id) {
        carRepository.deleteById(id);
    }

    @Transactional
    public boolean decrementCarAvailability(Integer carId) {
        int rowsAffected = carRepository.decrementAvailableCount(carId);
        if (rowsAffected > 0) {
            // Check if car is now out of stock
            Optional<Car> carOpt = carRepository.findById(carId);
            if (carOpt.isPresent() && carOpt.get().getAvailableCount() == 0) {
                carRepository.updateStatus(carId, "Unavailable");
            }
            return true;
        }
        return false;
    }

    @Transactional
    public boolean incrementCarAvailability(Integer carId) {
        int rowsAffected = carRepository.incrementAvailableCount(carId);
        if (rowsAffected > 0) {
            // Ensure car status is Available if it was previously Unavailable
            carRepository.updateStatus(carId, "Available");
            return true;
        }
        return false;
    }

    @Transactional
    public boolean updateCarStatus(Integer carId, String status) {
        int rowsAffected = carRepository.updateStatus(carId, status);
        return rowsAffected > 0;
    }

    @Transactional
    public Car decrementAvailableCount(Integer carId) {
        Optional<Car> carOptional = getCarById(carId);
        if (!carOptional.isPresent()) {
            throw new IllegalArgumentException("Car not found with id: " + carId);
        }
        
        Car car = carOptional.get();
        if (car.getAvailableCount() > 0) {
            car.setAvailableCount(car.getAvailableCount() - 1);
            
            // If there are no more units available, set status to Unavailable
            if (car.getAvailableCount() == 0) {
                car.setStatus("Unavailable");
            }
            
            return carRepository.save(car);
        } else {
            throw new IllegalStateException("No available units for car with id: " + carId);
        }
    }

    @Transactional
    public Car incrementAvailableCount(Integer carId) {
        Optional<Car> carOptional = getCarById(carId);
        if (!carOptional.isPresent()) {
            throw new IllegalArgumentException("Car not found with id: " + carId);
        }
        
        Car car = carOptional.get();
        car.setAvailableCount(car.getAvailableCount() + 1);
        
        // If car was previously unavailable, set it to available
        if ("Unavailable".equals(car.getStatus()) && car.getAvailableCount() > 0) {
            car.setStatus("Available");
        }
        
        return carRepository.save(car);
    }
}