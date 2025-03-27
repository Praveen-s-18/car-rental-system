import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength when password field changes
    if (name === 'password') {
      calculatePasswordStrength(value);
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const calculatePasswordStrength = (password) => {
    // Simple password strength calculator
    let strength = '';
    
    if (password.length === 0) {
      strength = '';
    } else if (password.length < 6) {
      strength = 'weak';
    } else if (password.length < 10) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    // Check for mix of characters for better strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const characterTypes = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

    if (characterTypes === 4 && password.length >= 8) {
      strength = 'strong';
    } else if (characterTypes >= 2 && password.length >= 6) {
      strength = 'medium';
    }

    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', formData);
      
      // Store the token if it's in the response
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Redirect to home or login page
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        // Backend validation errors
        if (error.response.data.message) {
          setErrors({
            ...errors,
            general: error.response.data.message
          });
        } else if (error.response.data.errors) {
          // Map field-specific errors from the backend
          const backendErrors = {};
          error.response.data.errors.forEach(err => {
            backendErrors[err.field] = err.message;
          });
          setErrors({
            ...errors,
            ...backendErrors
          });
        }
      } else {
        // Generic error
        setErrors({
          ...errors,
          general: 'Registration failed. Please try again.'
        });
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Register</h1>
        </div>
        
        <div className="form-container">
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className={`form-group ${formSubmitted && errors.username ? 'error' : ''}`}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
              {formSubmitted && errors.username && (
                <div className="error-message">{errors.username}</div>
              )}
            </div>
            
            <div className={`form-group ${formSubmitted && errors.password ? 'error' : ''}`}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
              {passwordStrength && (
                <div className="password-strength">
                  <div 
                    className={`password-strength-meter strength-${passwordStrength}`}
                  ></div>
                </div>
              )}
              {formSubmitted && errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>
            
            <div className={`form-group ${formSubmitted && errors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
              />
              {formSubmitted && errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>
            
            <div className={`form-group ${formSubmitted && errors.firstName ? 'error' : ''}`}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
              {formSubmitted && errors.firstName && (
                <div className="error-message">{errors.firstName}</div>
              )}
            </div>
            
            <div className={`form-group ${formSubmitted && errors.lastName ? 'error' : ''}`}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
              {formSubmitted && errors.lastName && (
                <div className="error-message">{errors.lastName}</div>
              )}
            </div>
            
            <div className={`form-group ${formSubmitted && errors.phoneNumber ? 'error' : ''}`}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
              {formSubmitted && errors.phoneNumber && (
                <div className="error-message">{errors.phoneNumber}</div>
              )}
            </div>
            
            <button type="submit" className="register-button">
              Create Account
            </button>
          </form>
          
          <div className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 