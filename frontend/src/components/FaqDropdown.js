import React, { useState } from 'react';
import './css/FaqDropdown.css';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <div className="faq-question" onClick={toggleDropdown}>
        <h3>{question}</h3>
        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
      </div>
      <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FaqDropdown = () => {
  const faqData = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Sign Up' button in the top-right corner of the homepage. Fill in your details including name, email, and password, then click 'Register'."
    },
    {
      question: "How can I search for jobs?",
      answer: "You can search for jobs using the search bar on the homepage. Filter results by job title, company, location, or job type. You can also use advanced filters for salary range, experience level, and more."
    },
    {
      question: "How do I upload my resume?",
      answer: "After logging in, go to your profile dashboard and click on the 'Resume' section. You can upload your resume in PDF, DOCX, or TXT format. We recommend using PDF for the best formatting preservation."
    },
    {
      question: "How do I apply for a job?",
      answer: "To apply for a job, click on the job listing to view details, then click the 'Apply Now' button. You'll need to have your resume uploaded and may need to answer additional questions depending on the employer's requirements."
    },
    {
      question: "How can employers post job listings?",
      answer: "Employers need to create an employer account. After verification, they can access the employer dashboard and click 'Post a New Job'. Fill in the job details, requirements, and application process, then submit for review."
    }
  ];

  return (
    <div className="faq-container">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((faq, index) => (
          <FaqItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};

export default FaqDropdown;