package com.example.CarRentalSystem.repository;

import com.example.CarRentalSystem.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Integer> {
    // Find methods
    List<Car> findByStatus(String status);
    List<Car> findByMake(String make);
    List<Car> findByCategory(String category);

    @Query("SELECT c FROM Car c WHERE c.status = 'Available' AND c.availableCount > 0")
    List<Car> findAvailableCars();

    List<Car> findByDailyRateBetween(Double minPrice, Double maxPrice);

    // Update methods
    @Transactional
    @Modifying
    @Query("UPDATE Car c SET c.availableCount = c.availableCount - 1 WHERE c.carId = :carId AND c.availableCount > 0")
    int decrementAvailableCount(@Param("carId") Integer carId);

    @Transactional
    @Modifying
    @Query("UPDATE Car c SET c.availableCount = c.availableCount + 1 WHERE c.carId = :carId")
    int incrementAvailableCount(@Param("carId") Integer carId);

    @Transactional
    @Modifying
    @Query("UPDATE Car c SET c.status = :status WHERE c.carId = :carId")
    int updateStatus(@Param("carId") Integer carId, @Param("status") String status);
}