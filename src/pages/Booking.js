import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Booking.css';

const Booking = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
  });
  const [summary, setSummary] = useState({
    days: 0,
    distance: 0,
    basePrice: 0,
    distanceFee: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/cars/${carId}`);
        setCar(response.data);
        setLoading(false);
        // Set initial base price
        setSummary(prev => ({
          ...prev,
          basePrice: response.data.dailyRate
        }));
      } catch (err) {
        setError('Failed to load car details. Please try again.');
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });

    // If start date and end date are both set, calculate the number of days
    if (name === 'startDate' || name === 'endDate') {
      if (bookingData.startDate && (name === 'endDate' ? value : bookingData.endDate)) {
        const start = new Date(bookingData.startDate);
        const end = new Date(name === 'endDate' ? value : bookingData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Update summary
        updateSummary(diffDays);
      }
    }
  };

  const updateSummary = (days) => {
    if (car) {
      const basePrice = car.dailyRate * days;
      const distanceFee = 0; // This could be calculated based on pickup/dropoff locations
      const totalAmount = basePrice + distanceFee;
      
      setSummary({
        days,
        distance: 0,
        basePrice,
        distanceFee,
        totalAmount
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Check if user is logged in by verifying token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to book a car');
        navigate('/login');
        return;
      }
      
      // Format dates properly for the backend with time
      const formattedStartDate = new Date(bookingData.startDate);
      formattedStartDate.setHours(12, 0, 0, 0); // Set to noon
      const formattedEndDate = new Date(bookingData.endDate);
      formattedEndDate.setHours(12, 0, 0, 0); // Set to noon
      
      // Proceed with booking - simplified payload structure
      const bookingPayload = {
        user: getUserIdFromToken(token),  // Send just the ID
        car: parseInt(carId),  // Send just the ID
        pickupDate: formattedStartDate.toISOString(),
        returnDate: formattedEndDate.toISOString(),
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        totalAmount: summary.totalAmount,
        bookingStatus: 'PENDING'
      };
      
      console.log('Sending booking payload:', bookingPayload); // Debug log
      
      // Send booking data to server
      const response = await axios.post('http://localhost:8080/api/bookings', bookingPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Booking response:', response.data); // Debug log
      
      if (response.data && response.data.bookingId) {
        // Navigate to payment page with booking ID
        navigate(`/payment/${response.data.bookingId}`);
      } else {
        console.error('Invalid response data:', response.data);
        throw new Error('Invalid response data: Booking ID not found');
      }
    } catch (error) {
      console.error('Booking error:', error.response?.data || error);
      let errorMessage = 'Error creating booking: ';
      
      if (error.response) {
        // Server responded with an error
        errorMessage += error.response.data?.message || error.response.data || 'Server error';
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response from server. Please try again.';
      } else {
        // Error in request setup
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  const getUserIdFromToken = (token) => {
    // This is a simple implementation. In a real app, you should decode the JWT token
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload).userId || 1; // Fallback to userId 1 if not found
    } catch (e) {
      console.error('Error parsing token:', e);
      return 1; // Default userId
    }
  };

  const validateForm = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Please select both start and end dates');
      return false;
    }
    
    if (!bookingData.pickupLocation || !bookingData.dropoffLocation) {
      alert('Please select pickup and drop-off locations');
      return false;
    }
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    
    if (start >= end) {
      alert('End date must be after start date');
      return false;
    }
    
    // Fix the date comparison by setting both dates to midnight for fair comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateMidnight = new Date(start);
    startDateMidnight.setHours(0, 0, 0, 0);
    
    if (startDateMidnight < today) {
      alert('Start date cannot be in the past');
      return false;
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <p>{error}</p>
          <button onClick={() => navigate('/cars')} className="retry-button">
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book {car.make} {car.model}</h1>
        </div>
        
        <div className="booking-form">
          <div className="car-overview">
            <div className="car-overview-image">
              <img 
                src={`/images/cars/${car.model.toLowerCase()}.webp`} 
                alt={`${car.make} ${car.model}`}
                onError={(e) => {
                  // Try with possible variations of filenames
                  if (car.model === 'Creta') {
                    e.target.src = '/images/cars/create.webp';
                  } else {
                    e.target.src = '/images/cars/default_car.jpg';
                  }
                }}
              />
            </div>
            <div className="car-overview-details">
              <div>
                <h2>{car.make} {car.model}</h2>
                <div className="car-meta">
                  <div className="car-meta-item">
                    <i className="fas fa-car"></i>
                    <span>{car.category || "Sedan"}</span>
                  </div>
                  <div className="car-meta-item">
                    <i className="fas fa-cog"></i>
                    <span>{car.transmission || "Manual"}</span>
                  </div>
                  <div className="car-meta-item">
                    <i className="fas fa-gas-pump"></i>
                    <span>{car.fuelType || (car.model === "Innova" ? "Diesel" : "Petrol")}</span>
                  </div>
                  <div className="car-meta-item">
                    <i className="fas fa-users"></i>
                    <span>{car.model === "Innova" ? "7 Seats" : "5 Seats"}</span>
                  </div>
                </div>
                <div className="availability-status">
                  <div className="status-indicator"></div>
                  <span>{car.availableCount} available</span>
                </div>
              </div>
              <div className="car-price">
                ₹{car.dailyRate}<span>/day</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Select Dates</h3>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="date-input"
                    value={bookingData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="date-input"
                    value={bookingData.endDate}
                    onChange={handleInputChange}
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Select Locations</h3>
              <div className="location-inputs">
                <div className="location-input-group">
                  <label>Pickup Location</label>
                  <select
                    name="pickupLocation"
                    className="location-input"
                    value={bookingData.pickupLocation}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select pickup location</option>
                    {/* Tamil Nadu Cities */}
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Salem">Salem</option>
                    <option value="Tiruchirappalli">Tiruchirappalli</option>
                    <option value="Thoothukudi">Thoothukudi</option>
                    <option value="Thanjavur">Thanjavur</option>
                    <option value="Tirunelveli">Tirunelveli</option>
                    {/* Kerala Cities */}
                    <option value="Kochi">Kochi</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kozhikode">Kozhikode</option>
                    {/* Andhra Pradesh Cities */}
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Vijayawada">Vijayawada</option>
                    {/* Telangana Cities */}
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div className="location-input-group">
                  <label>Drop-off Location</label>
                  <select
                    name="dropoffLocation"
                    className="location-input"
                    value={bookingData.dropoffLocation}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select drop-off location</option>
                    {/* Tamil Nadu Cities */}
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Salem">Salem</option>
                    <option value="Tiruchirappalli">Tiruchirappalli</option>
                    <option value="Thoothukudi">Thoothukudi</option>
                    <option value="Thanjavur">Thanjavur</option>
                    <option value="Tirunelveli">Tirunelveli</option>
                    {/* Kerala Cities */}
                    <option value="Kochi">Kochi</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kozhikode">Kozhikode</option>
                    {/* Andhra Pradesh Cities */}
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Vijayawada">Vijayawada</option>
                    {/* Telangana Cities */}
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-row">
                <span className="summary-label">Pickup Date:</span>
                <span className="summary-value">
                  {bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString() : 'Select a date'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Return Date:</span>
                <span className="summary-value">
                  {bookingData.endDate ? new Date(bookingData.endDate).toLocaleDateString() : 'Select a date'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Rental Duration:</span>
                <span className="summary-value">{summary.days} days</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Distance:</span>
                <span className="summary-value">{summary.distance} km</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Base Price:</span>
                <span className="summary-value price">₹{summary.basePrice} (₹{car.dailyRate}/day × {summary.days} days)</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Distance Fee:</span>
                <span className="summary-value price">₹{summary.distanceFee} ({summary.distance > 0 ? '₹0.20/kilometer' : 'No additional charges'})</span>
              </div>
              
              <div className="total-row">
                <span className="total-label">Total Amount:</span>
                <span className="total-amount">₹{summary.totalAmount}</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="confirm-button"
              disabled={!summary.days}
            >
              CONFIRM BOOKING
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;