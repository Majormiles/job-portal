import React, { useEffect, useCallback } from 'react';
import { format } from 'date-fns';

// Thank you messages by role
const THANK_YOU_MESSAGES = {
  jobSeeker: "Thank you for investing in your career journey with us. Your payment helps us connect you with the right opportunities that match your skills and aspirations.",
  employer: "Thank you for your payment. We appreciate your trust in our platform to help you find the right talent for your organization. Your investment supports building quality connections with qualified candidates.",
  trainer: "Thank you for your payment. We value your expertise and commitment to sharing knowledge on our platform. Your contribution helps us create a vibrant learning community.",
  trainee: "Thank you for investing in your professional development. Your payment gives you access to quality training that will enhance your skills and advance your career goals."
};

const Receipt = ({ receipt, onClose, onPrint }) => {
  const formatCurrency = (amount) => {
    return `₵${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy, h:mm a');
  };

  const handlePrint = () => {
    onPrint(receipt);
  };

  // Handle ESC key press to close modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Setup event listener for ESC key
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle clicking outside modal to close
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('receipt-modal')) {
      onClose();
    }
  };

  // Get thank you message based on user role
  const thankYouMessage = THANK_YOU_MESSAGES[receipt.userRole] || 
    "Thank you for your payment. We appreciate your business.";

  return (
    <div 
      className="receipt-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      <div className="receipt-container bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="receipt-header p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Receipt</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2" 
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="receipt-body p-4">
          {/* Company Info */}
          <div className="flex justify-between mb-4 text-sm">
            <div className="company-info">
              <h3 className="text-lg font-bold text-blue-600">Job Portal</h3>
              <p className="text-gray-600">support@jobportal.com</p>
              <p className="text-gray-600">+233 24 746 6205</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Receipt #{receipt.referenceNumber}</p>
              <p className="text-gray-600">Date: {formatDate(receipt.date)}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="user-info bg-gray-50 p-3 rounded-lg mb-4 text-sm">
            <h4 className="font-semibold mb-1">Bill To:</h4>
            <p className="font-medium text-gray-800">{receipt.userName}</p>
            <p className="text-gray-600">{receipt.email}</p>
            <p className="text-gray-600">{receipt.phoneNumber}</p>
            <p className="text-gray-600">{receipt.location}</p>
            <p className="text-gray-600 mt-1">Account Type: <span className="font-medium">{receipt.accountType}</span></p>
          </div>

          {/* Payment Details */}
          <div className="payment-details mb-4">
            <h4 className="font-semibold mb-2 text-sm">Payment Details:</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                      {receipt.accountType} Account Fee
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-900 text-right">
                      {formatCurrency(receipt.amount)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">Total</td>
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 text-right">
                      {formatCurrency(receipt.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-method mb-4 text-sm">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div>
                <h4 className="font-semibold text-blue-800">Payment Method:</h4>
                <p className="text-blue-800">{receipt.paymentMethod}</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">Transaction ID:</h4>
                <p className="text-blue-800">{receipt.transactionId}</p>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="thank-you-message text-center my-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700 italic text-sm">{thankYouMessage}</p>
          </div>
        </div>

        <div className="receipt-footer p-4 border-t border-gray-200 flex justify-end space-x-4">
          <button 
            onClick={handlePrint}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
          <button 
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt; 