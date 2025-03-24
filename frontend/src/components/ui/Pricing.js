import React, { useEffect } from 'react';
import { CheckCircle, Bookmark } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import '../css/PricingPlans.css';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PricingPlans = () => {
  const plans = [
    {
      id: 1,
      name: 'Migrations',
      startingAt: 'Starting at',
      price: 'GH₵950',
      period: '/year',
      description: 'Annual Subscription',
      buttonColor: 'navy',
      features: [
        'Data Migration',
        'Simple Tax Preparation',
        'Fund Administration',
        'Fund Manager',
        'Fund Manager',
        'Investor Records',
      ],
    },
    {
      id: 2,
      name: 'SPVs',
      startingAt: 'Starting at',
      price: 'GH₵1,950',
      period: '',
      description: 'Setup Cost',
      buttonColor: 'green',
      featured: true,
      features: [
        'Series of Entity Included',
        'Bank Account',
        'Investor Onboarding',
        'Fund Manager',
        'Regulatory Filings',
        'Simple Tax Preparation',
      ],
    },
    {
      id: 3,
      name: 'Funds',
      startingAt: 'Starting at',
      price: 'GH₵2,000',
      period: '/year',
      description: 'Annual Subscription',
      buttonColor: 'navy',
      features: [
        '30 Investments Included',
        '18 Month Raising Period',
        '36 Month Investing Period',
        'Annual Financial Statements',
        'Multiple Closes Supported',
      ],
    },
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handler for button clicks to ensure scrolling to top
  const handleButtonClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      <ScrollToTop />
      <div className="pricing-container">
        <div className="pricing-wrapper">
          <div className="pricing-header">
            <div className="pricing-metadata">
              <span className="time-ago">10 min ago</span>
              <button className="bookmark-button">
                <Bookmark size={20} />
              </button>
            </div>
            <div className="pricing-title-section">
              <div className="logo">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="18" fill="white" />
                  <path d="M18 10C13.5817 10 10 13.5817 10 18C10 22.4183 13.5817 26 18 26C22.4183 26 26 22.4183 26 18C26 13.5817 22.4183 10 18 10Z" fill="transparent" stroke="none" />
                  <path d="M18 14C20.2091 14 22 15.7909 22 18C22 20.2091 20.2091 22 18 22C15.7909 22 14 20.2091 14 18C14 15.7909 15.7909 14 18 14Z" fill="#FF5733" />
                  <path d="M18 11C19.1046 11 20 11.8954 20 13C20 14.1046 19.1046 15 18 15C16.8954 15 16 14.1046 16 13C16 11.8954 16.8954 11 18 11Z" fill="#47D147" />
                  <path d="M22 18C22 16.8954 22.8954 16 24 16C25.1046 16 26 16.8954 26 18C26 19.1046 25.1046 20 24 20C22.8954 20 22 19.1046 22 18Z" fill="#4D4DFF" />
                  <path d="M18 21C19.1046 21 20 21.8954 20 23C20 24.1046 19.1046 25 18 25C16.8954 25 16 24.1046 16 23C16 21.8954 16.8954 21 18 21Z" fill="#FFBD33" />
                  <path d="M14 18C14 16.8954 13.1046 16 12 16C10.8954 16 10 16.8954 10 18C10 19.1046 10.8954 20 12 20C13.1046 20 14 19.1046 14 18Z" fill="#FF33FF" />
                </svg>
              </div>
              <h1 className="pricing-heading">Pick Your Perfect Plan</h1>
            </div>

            <div className="nav-button-container">
              <Link to='/' onClick={handleButtonClick}>
                <button className="nav-button">Home</button>
              </Link>
            </div>
          </div>

          <div className="pricing-plans">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.featured ? 'featured-card' : ''}`}
              >
                <div className="plan-header">
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="starting-at">{plan.startingAt}</p>
                </div>

                <div className="price-container">
                  <h3 className="price">{plan.price}<span className="period">{plan.period}</span></h3>
                  <p className="description">{plan.description}</p>
                </div>

                <Link to='/checkout'><button
                  className={`price-button ${plan.buttonColor === 'green' ? 'green-button' : 'navy-button'}`}
                  onClick={handleButtonClick}
                >
                  Get Price Estimate
                </button>
                </Link>

                <div className="features-list">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <CheckCircle className="check-icon" size={20} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPlans;