import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  // State for typewriter effect
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Drive Your Dreams';
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for animated counters
  const [isCounterVisible, setIsCounterVisible] = useState(false);
  const countersRef = useRef(null);
  
  // Typewriter effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Counter animation
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isCounterVisible) {
          setIsCounterVisible(true);
          startCounters();
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    if (countersRef.current) {
      observer.observe(countersRef.current);
    }
    
    return () => {
      if (countersRef.current) {
        observer.unobserve(countersRef.current);
      }
    };
  }, [isCounterVisible]);
  
  const startCounters = () => {
    const counters = document.querySelectorAll('.counter-value');
    const speed = 200;
    
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let count = 0;
      
      const updateCount = () => {
        const increment = target / speed;
        
        if (count < target) {
          count += increment;
          counter.innerText = Math.ceil(count);
          setTimeout(updateCount, 1);
        } else {
          counter.innerText = target;
        }
      };
      
      updateCount();
    });
  };

  // Add animation classes after component mounts
  useEffect(() => {
    // Animate hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      setTimeout(() => {
        heroContent.classList.add('animate-in');
      }, 100);
    }

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

  // Add parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Parallax effect for hero background
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.style.backgroundPositionY = `${scrollPosition * 0.4}px`;
      }
      
      // Floating effect for car images
      const carImages = document.querySelectorAll('.popular-car img');
      carImages.forEach((img) => {
        const rect = img.getBoundingClientRect();
        const centerY = window.innerHeight / 2;
        const fromCenter = (rect.top + rect.height / 2 - centerY) / centerY;
        img.style.transform = `translateY(${-fromCenter * 15}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="typewriter-text">{displayText}<span className="cursor">|</span></h1>
          <p className="animated-text">Discover the ultimate car rental experience with our premium fleet and unbeatable prices.</p>
          <Link to="/cars" className="cta-button animated-button">Explore Cars</Link>
        </div>
      </section>

      <section className="stats-section reveal-on-scroll" ref={countersRef}>
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-car-side"></i>
            </div>
            <div className="stat-value">
              <span className="counter-value" data-target="150">0</span>+
            </div>
            <div className="stat-title">Vehicles</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-value">
              <span className="counter-value" data-target="10000">0</span>+
            </div>
            <div className="stat-title">Happy Customers</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="stat-value">
              <span className="counter-value" data-target="15">0</span>
            </div>
            <div className="stat-title">Locations</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-value">
              <span className="counter-value" data-target="98">0</span>%
            </div>
            <div className="stat-title">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="reveal-on-scroll">Why Choose Us</h2>
        <div className="features-container">
          <div className="feature reveal-on-scroll">
            <div className="feature-icon">
              <i className="fas fa-car"></i>
            </div>
            <h3>Premium Selection</h3>
            <p>Choose from a wide range of premium and luxury vehicles for any occasion.</p>
          </div>
          
          <div className="feature reveal-on-scroll">
            <div className="feature-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <h3>Best Price Guaranteed</h3>
            <p>We offer the most competitive rates with no hidden charges.</p>
          </div>
          
          <div className="feature reveal-on-scroll">
            <div className="feature-icon">
              <i className="fas fa-headset"></i>
            </div>
            <h3>24/7 Support</h3>
            <p>Our customer support team is always available to assist you.</p>
          </div>
          
          <div className="feature reveal-on-scroll">
            <div className="feature-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3>Convenient Locations</h3>
            <p>Multiple pickup and drop-off locations across all major cities.</p>
          </div>
        </div>
      </section>

      <section className="popular-cars-section">
        <h2 className="reveal-on-scroll">Popular Cars</h2>
        <div className="car-slider">
          <div className="popular-car reveal-on-scroll">
            <div className="popular-car-image">
              <img src="/images/cars/create.webp" alt="Hyundai Creta" />
            </div>
            <h3>Hyundai Creta</h3>
            <p className="car-category">SUV</p>
            <p className="car-price">$25/day</p>
            <Link to="/cars" className="view-details-button">View Details</Link>
          </div>
          
          <div className="popular-car reveal-on-scroll">
            <div className="popular-car-image">
              <img src="/images/cars/swift.webp" alt="Maruti Suzuki Swift" />
            </div>
            <h3>Maruti Suzuki Swift</h3>
            <p className="car-category">Hatchback</p>
            <p className="car-price">$20/day</p>
            <Link to="/cars" className="view-details-button">View Details</Link>
          </div>
          
          <div className="popular-car reveal-on-scroll">
            <div className="popular-car-image">
              <img src="/images/cars/innova.webp" alt="Toyota Innova" />
            </div>
            <h3>Toyota Innova</h3>
            <p className="car-category">MPV</p>
            <p className="car-price">$35/day</p>
            <Link to="/cars" className="view-details-button">View Details</Link>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="reveal-on-scroll">What Our Customers Say</h2>
        <div className="testimonials-container">
          <div className="testimonial reveal-on-scroll">
            <div className="testimonial-content">
              <p>"The best car rental experience I've ever had. The process was smooth and the car was in excellent condition!"</p>
            </div>
            <div className="testimonial-info">
              <div className="testimonial-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="testimonial-name">
                <h4>Rahul Sharma</h4>
                <p>Chennai</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial reveal-on-scroll">
            <div className="testimonial-content">
              <p>"Affordable prices and top-quality cars. I'll definitely be using this service again for my next trip."</p>
            </div>
            <div className="testimonial-info">
              <div className="testimonial-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="testimonial-name">
                <h4>Priya Patel</h4>
                <p>Bangalore</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial reveal-on-scroll">
            <div className="testimonial-content">
              <p>"The customer service is exceptional. They helped me find the perfect car for my family vacation."</p>
            </div>
            <div className="testimonial-info">
              <div className="testimonial-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="testimonial-name">
                <h4>Arun Kumar</h4>
                <p>Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section reveal-on-scroll">
        <div className="cta-content">
          <h2>Ready to Hit the Road?</h2>
          <p>Book your dream car now and enjoy the freedom of the open road.</p>
          <Link to="/cars" className="cta-button pulse-animation">Book Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 