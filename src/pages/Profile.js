import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to extract error message
  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data?.error) return err.response.data.error;
    if (typeof err.response?.data === 'string') return err.response.data;
    if (err.message) return err.message;
    return 'Failed to fetch user data';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Configure axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user data from backend
        const userResponse = await axios.get('http://localhost:8080/api/users/me');
        console.log('User response:', userResponse.data); // Debug log
        setUser(userResponse.data);

        // Fetch user's bookings
        const bookingsResponse = await axios.get('http://localhost:8080/api/bookings/current-user');
        console.log('Bookings response:', bookingsResponse.data); // Debug log
        setBookings(bookingsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err.response || err);
        if (err.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        setError(getErrorMessage(err));
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">No user data available</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>My Profile</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="user-info">
          <h3>Personal Information</h3>
          <div className="info-group">
            <label>Username:</label>
            <p>{user.username}</p>
          </div>
          <div className="info-group">
            <label>Email:</label>
            <p>{user.email}</p>
          </div>
          <div className="info-group">
            <label>Name:</label>
            <p>{user.firstName} {user.lastName}</p>
          </div>
          <div className="info-group">
            <label>Phone:</label>
            <p>{user.phoneNumber || 'Not provided'}</p>
          </div>
        </div>

        <div className="bookings-section">
          <h3>My Bookings</h3>
          {bookings.length === 0 ? (
            <p className="no-bookings">No bookings found. <a href="/cars">Book a car now!</a></p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                // Extract car details and ensure they're available
                const carId = typeof booking.car === 'object' ? booking.car.carId : booking.car;
                const carDetails = typeof booking.car === 'object' ? booking.car : null;
                
                // Format dates
                const startDate = formatDate(booking.pickupDate);
                const endDate = formatDate(booking.returnDate);
                
                return (
                  <div key={booking.bookingId} className="booking-card">
                    <div className="booking-info">
                      <div className="booking-header">
                        <h4>
                          {carDetails ? 
                            `${carDetails.brand} ${carDetails.model}` : 
                            `Car #${carId}`}
                        </h4>
                        <span className={`status-badge ${booking.bookingStatus.toLowerCase()}`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                      
                      <div className="booking-dates">
                        <div className="booking-date">
                          <span className="date-label">Start Date:</span>
                          <span className="date-value">{startDate}</span>
                        </div>
                        <div className="booking-date">
                          <span className="date-label">End Date:</span>
                          <span className="date-value">{endDate}</span>
                        </div>
                      </div>
                      
                      <div className="booking-locations">
                        <div className="location">
                          <span className="location-label">Pickup:</span>
                          <span className="location-value">{booking.pickupLocation || 'Not specified'}</span>
                        </div>
                        <div className="location">
                          <span className="location-label">Drop-off:</span>
                          <span className="location-value">{booking.dropoffLocation || 'Not specified'}</span>
                        </div>
                      </div>
                      
                      <div className="booking-price">
                        <span className="price-label">Total Amount:</span>
                        <span className="price-value">₹{booking.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      
                      {booking.payment ? (
                        <div className="payment-info">
                          <span className="payment-label">Payment Status:</span>
                          <span className={`payment-status ${booking.payment.paymentStatus.toLowerCase()}`}>
                            {booking.payment.paymentStatus}
                          </span>
                        </div>
                      ) : (
                        <div className="payment-info">
                          <span className="payment-label">Payment Status:</span>
                          <span className="payment-status pending">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 