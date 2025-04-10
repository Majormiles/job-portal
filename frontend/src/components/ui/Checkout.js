import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/Checkout.css';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'US'
  });
  
  const plans = [
    {
      id: 1,
      name: 'Basic',
      price: 'GH₵29',
      period: '/month',
      jobPostings: 10,
      featuredJobs: 2,
      candidateAccess: 50,
      analytics: 'Basic',
      buttonColor: 'navy'
    },
    {
      id: 2,
      name: 'Pro',
      price: 'GH₵79',
      period: '/month',
      jobPostings: 25,
      featuredJobs: 5,
      candidateAccess: 150,
      analytics: 'Advanced',
      buttonColor: 'green',
      featured: true
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 'GH₵199',
      period: '/month',
      jobPostings: 'Unlimited',
      featuredJobs: 15,
      candidateAccess: 'Unlimited',
      analytics: 'Premium',
      buttonColor: 'navy'
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Get selected plan from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan') || localStorage.getItem('selectedPlan');
    
    if (planId) {
      const plan = plans.find(p => p.id === parseInt(planId, 10));
      if (plan) setSelectedPlan(plan);
    } else {
      // Default to Pro plan if none selected
      setSelectedPlan(plans[1]);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('selectedPlan', plan.id);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate form submission
    console.log('Submitting order:', { plan: selectedPlan, paymentMethod, formData });
    
    // Navigate to success page (scroll to top first)
    window.scrollTo(0, 0);
    navigate('/checkout/success');
  };

  // Return to previous page with scroll reset
  const handleBack = () => {
    window.scrollTo(0, 0);
    navigate(-1);
  };

  return (
    <>
      <ScrollToTop />
      <div className="checkout-container">
        <div className="checkout-wrapper">
          <div className="checkout-header">
            <button onClick={handleBack} className="back-button">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            <div className="checkout-title-section">
              <h1 className="checkout-heading">Complete Your Order</h1>
              <p className="checkout-subheading">Get started with your job portal subscription</p>
            </div>
          </div>

          <div className="checkout-content">
            <div className="checkout-form-section">
              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <h2 className="section-title">Selected Plan</h2>
                  <div className="plan-selector">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id} 
                        className={`plan-option ${selectedPlan?.id === plan.id ? 'selected-plan' : ''}`}
                        onClick={() => handlePlanChange(plan)}
                      >
                        <div className="plan-option-header">
                          <h3 className="plan-option-name">{plan.name}</h3>
                          <span className="plan-option-price">{plan.price}<span className="period">{plan.period}</span></span>
                        </div>
                        {selectedPlan?.id === plan.id && <CheckCircle className="selected-icon" size={20} />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="section-title">Account Information</h2>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="fullName">Full Name</label>
                      <input 
                        type="text" 
                        id="fullName" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="email">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="section-title">Payment Method</h2>
                  <div className="payment-options">
                    <div 
                      className={`payment-option ${paymentMethod === 'credit-card' ? 'selected-payment' : ''}`}
                      onClick={() => setPaymentMethod('credit-card')}
                    >
                      <CreditCard size={20} />
                      <span>Credit Card</span>
                      {paymentMethod === 'credit-card' && <CheckCircle className="selected-icon" size={20} />}
                    </div>
                  </div>
                  
                  {paymentMethod === 'credit-card' && (
                    <div className="card-details">
                      <div className="form-row">
                        <div className="form-group full-width">
                          <label htmlFor="cardNumber">Card Number</label>
                          <input 
                            type="text" 
                            id="cardNumber" 
                            name="cardNumber" 
                            placeholder="1234 5678 9012 3456" 
                            value={formData.cardNumber} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input 
                            type="text" 
                            id="expiryDate" 
                            name="expiryDate" 
                            placeholder="MM/YY" 
                            value={formData.expiryDate} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input 
                            type="text" 
                            id="cvv" 
                            name="cvv" 
                            placeholder="123" 
                            value={formData.cvv} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h2 className="section-title">Billing Address</h2>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="billingAddress">Street Address</label>
                      <input 
                        type="text" 
                        id="billingAddress" 
                        name="billingAddress" 
                        value={formData.billingAddress} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input 
                        type="text" 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="zipCode">Zip Code</label>
                      <input 
                        type="text" 
                        id="zipCode" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="country">Country</label>
                      <select 
                        id="country" 
                        name="country" 
                        value={formData.country} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="GH">Ghana</option>
                        <option value="NG">Nigeria</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="checkout-button">
                    Complete Order
                  </button>
                  <div className="secure-checkout">
                    <ShieldCheck size={16} />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="checkout-summary">
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>
                
                {selectedPlan && (
                  <>
                    <div className="summary-plan">
                      <h3 className="summary-plan-name">{selectedPlan.name} Plan</h3>
                      <span className="summary-plan-price">{selectedPlan.price}<span className="period">{selectedPlan.period}</span></span>
                    </div>
                    
                    <div className="summary-details">
                      <div className="summary-item">
                        <span>Job Postings</span>
                        <span>{selectedPlan.jobPostings}</span>
                      </div>
                      <div className="summary-item">
                        <span>Featured Jobs</span>
                        <span>{selectedPlan.featuredJobs}</span>
                      </div>
                      <div className="summary-item">
                        <span>Candidate Access</span>
                        <span>{selectedPlan.candidateAccess}</span>
                      </div>
                      <div className="summary-item">
                        <span>Analytics</span>
                        <span>{selectedPlan.analytics}</span>
                      </div>
                    </div>
                    
                    <div className="summary-total">
                      <div className="summary-item">
                        <span>Subtotal</span>
                        <span>{selectedPlan.price}</span>
                      </div>
                      <div className="summary-item">
                        <span>Taxes</span>
                        <span>Calculated at next step</span>
                      </div>
                      <div className="summary-item total">
                        <span>Total</span>
                        <span>{selectedPlan.price}<span className="period">{selectedPlan.period}</span></span>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="guarantee">
                  <CheckCircle size={16} />
                  <span>30-day money-back guarantee</span>
                </div>
                
                <div className="support-info">
                  <p>Need help? <a href="#">Contact our support team</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;