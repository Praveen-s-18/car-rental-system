import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Payment.css';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`http://localhost:8080/api/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setBooking(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details. Please try again.');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create payment record
      const paymentPayload = {
        booking: { bookingId: parseInt(bookingId) },
        amount: booking.totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: 'COMPLETED'
      };

      const response = await axios.post('http://localhost:8080/api/payments', paymentPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        alert('Payment successful!');
        navigate('/profile'); // Navigate to profile page after successful payment
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <p>{error}</p>
          <button onClick={() => navigate('/bookings')} className="retry-button">
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Payment</h1>
        </div>

        {booking && (
          <div className="payment-details">
            <div className="booking-summary">
              <h3>Booking Details</h3>
              <div className="summary-row">
                <span>Car:</span>
                <span>{booking.car.make} {booking.car.model}</span>
              </div>
              <div className="summary-row">
                <span>Pickup Date:</span>
                <span>{new Date(booking.pickupDate).toLocaleDateString()}</span>
              </div>
              <div className="summary-row">
                <span>Return Date:</span>
                <span>{new Date(booking.returnDate).toLocaleDateString()}</span>
              </div>
              <div className="summary-row">
                <span>Total Amount:</span>
                <span className="amount">₹{booking.totalAmount}</span>
              </div>
            </div>

            <form onSubmit={handlePayment} className="payment-form">
              <div className="payment-methods">
                <h3>Select Payment Method</h3>
                <div className="method-options">
                  <label className="method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-label">
                      <i className="fas fa-credit-card"></i>
                      Credit/Debit Card
                    </span>
                  </label>
                  <label className="method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-label">
                      <i className="fas fa-mobile-alt"></i>
                      UPI
                    </span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Name on Card</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="upi-details">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="username@upi"
                      required
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="pay-button">
                Pay ₹{booking.totalAmount}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment; 