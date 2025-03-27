import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Cars.css';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const navigate = useNavigate();

  // Function to get car image based on model with specific mapping for typos
  const getCarImage = (car) => {
    // Map for specific cases and typos
    const imageMapping = {
      'Creta': '/images/cars/create.webp', // Handle the typo in filename
      'Swift': '/images/cars/swift.webp',
      'Nexon': '/images/cars/nexon.webp',
      'Innova': '/images/cars/innova.webp',
      'Seltos': '/images/cars/seltos.webp',
      'Camry': '/images/cars/camry.webp'
    };

    // Return the mapped image path if it exists
    if (imageMapping[car.model]) {
      return imageMapping[car.model];
    }

    // Otherwise use the default lowercase model name
    const modelName = car.model.toLowerCase();
    return `/images/cars/${modelName}.webp`;
  };

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/cars');
      setCars(response.data);
    } catch (err) {
      setError('Failed to fetch cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();

    // Set up reveal-on-scroll animations
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      const windowHeight = window.innerHeight;
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementPosition < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    // Initial check
    animateOnScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
    };
  }, []);

  const handleBookNow = (car) => {
    if (car.status !== "Available" || car.availableCount <= 0) {
      // Show alert or notification
      alert('This car is currently unavailable for booking.');
      return;
    }
    navigate(`/booking/${car.carId}`);
  };

  // Add a function to display availability badge with appropriate styling
  const renderAvailabilityBadge = (car) => {
    const isAvailable = car.status === "Available" && car.availableCount > 0;
    return (
      <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
        {isAvailable ? 'Available' : 'Unavailable'}
      </span>
    );
  };

  // Add a function to display the available count with appropriate styling
  const renderAvailableCount = (car) => {
    if (car.availableCount > 0) {
      return <span className="available-count">{car.availableCount} available</span>;
    }
    return <span className="available-count sold-out">Sold out</span>;
  };

  const renderCarDetails = (car) => {
    return (
      <div className="car-details">
        <div className="detail-item">
          <i className="fas fa-car"></i>
          <span>{car.category || "Compact"}</span>
        </div>
        <div className="detail-item">
          <i className="fas fa-cog"></i>
          <span>{car.transmission || "Manual"}</span>
        </div>
        <div className="detail-item">
          <i className="fas fa-gas-pump"></i>
          <span>{car.fuelType || (car.model === "Innova" ? "Diesel" : "Petrol")}</span>
        </div>
        <div className="detail-item">
          <i className="fas fa-users"></i>
          <span>{car.model === "Innova" ? "7 Seats" : "5 Seats"}</span>
        </div>
      </div>
    );
  };

  const filteredCars = () => {
    if (availabilityFilter === 'all') {
      return cars;
    } else if (availabilityFilter === 'available') {
      return cars.filter(car => car.status === "Available" && car.availableCount > 0);
    } else {
      return cars.filter(car => car.status !== "Available" || car.availableCount <= 0);
    }
  };

  if (loading) {
    return (
      <div className="loading-container reveal-on-scroll">
        <div className="loading-spinner"></div>
        <p>Loading amazing cars for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container reveal-on-scroll">
        <div className="error-icon">❌</div>
        <p>{error}</p>
        <button onClick={fetchCars} className="retry-button">Try Again</button>
      </div>
    );
  }

  return (
    <div className="cars-page">
      <div className="cars-header">
        <h1>Available Cars</h1>
        <p className="subtitle">Choose from our premium selection of vehicles</p>
        <div className="filter-container">
          <select 
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="availability-filter"
          >
            <option value="all">All Cars</option>
            <option value="available">Available Cars</option>
            <option value="unavailable">Unavailable Cars</option>
          </select>
        </div>
      </div>

      {filteredCars().length === 0 ? (
        <div className="no-results">
          <h3>No cars found</h3>
          <p>No cars match your current filter selection.</p>
          <button 
            onClick={() => setAvailabilityFilter('all')} 
            className="retry-button"
          >
            Show All Cars
          </button>
        </div>
      ) : (
        <div className="cars-grid">
          {filteredCars().map((car, index) => (
            <div 
              key={car.carId} 
              className={`car-card ${car.status === "Available" && car.availableCount > 0 ? 'available' : 'unavailable'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="car-image-container">
                <img 
                  src={getCarImage(car)}
                  alt={`${car.make} ${car.model}`} 
                  className="car-image"
                  onError={(e) => {
                    // If all else fails, use default
                    e.target.onerror = null;
                    e.target.src = '/images/cars/default_car.jpg';
                  }}
                />
                {(car.status !== "Available" || car.availableCount <= 0) && (
                  <div className="unavailable-overlay">
                    <span>Currently Unavailable</span>
                  </div>
                )}
              </div>
              <div className="car-info">
                <h2 className="car-model">{car.model}</h2>
                <p className="car-brand">{car.make}</p>
                {renderCarDetails(car)}
                <div className="car-status-container">
                  {renderAvailabilityBadge(car)}
                  {renderAvailableCount(car)}
                </div>
                <div className="car-price">
                  <span className="price-amount">₹{car.dailyRate}</span>
                  <span className="price-period">/day</span>
                </div>
                <Link 
                  to={`/booking/${car.carId}`} 
                  className={`book-button ${(car.status !== "Available" || car.availableCount <= 0) ? 'disabled' : ''}`}
                  onClick={(e) => {
                    if (car.status !== "Available" || car.availableCount <= 0) {
                      e.preventDefault();
                      alert('This car is currently unavailable for booking.');
                      return;
                    }
                    // Otherwise let the link navigate to booking page
                  }}
                >
                  {car.status === "Available" && car.availableCount > 0 ? 'Book Now' : 'Unavailable'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cars; 