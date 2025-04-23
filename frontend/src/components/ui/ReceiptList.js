import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Receipt from './Receipt';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const receiptRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        // If there's a payment API endpoint, use that instead
        // const response = await fetch('/api/receipts');
        // const data = await response.json();
        // setReceipts(data);

        // Temporary mock data - replace with actual API call
        if (user && user.paymentHistory) {
          const receiptData = user.paymentHistory.map(payment => ({
            id: payment.reference || `rcpt-${Math.random().toString(36).substr(2, 9)}`,
            referenceNumber: payment.reference || `INV-${Math.floor(Math.random() * 10000)}`,
            userName: user.name,
            email: user.email,
            phoneNumber: user.phone || '+233 XX XXX XXXX',
            location: user.location || 'Ghana',
            accountType: user.roleName ? user.roleName.charAt(0).toUpperCase() + user.roleName.slice(1) : 'User',
            userRole: user.roleName || 'jobSeeker',
            amount: payment.amount || 50,
            date: payment.date || new Date().toISOString(),
            transactionId: payment.reference || `TXN-${Math.floor(Math.random() * 10000)}`,
            paymentMethod: payment.gateway || 'Card Payment'
          }));
          setReceipts(receiptData);
        } else {
          // If no payment history, create a mock receipt if user has paid
          if (user && user.payment && user.payment.isPaid) {
            const mockReceipt = {
              id: user.payment.reference || `rcpt-${Math.random().toString(36).substr(2, 9)}`,
              referenceNumber: user.payment.reference || `INV-${Math.floor(Math.random() * 10000)}`,
              userName: user.name,
              email: user.email,
              phoneNumber: user.phone || '+233 XX XXX XXXX',
              location: user.location || 'Ghana',
              accountType: user.roleName ? user.roleName.charAt(0).toUpperCase() + user.roleName.slice(1) : 'User',
              userRole: user.roleName || 'jobSeeker',
              amount: user.payment.amount || 50,
              date: user.payment.date || new Date().toISOString(),
              transactionId: user.payment.reference || `TXN-${Math.floor(Math.random() * 10000)}`,
              paymentMethod: user.payment.gateway || 'Card Payment'
            };
            setReceipts([mockReceipt]);
          }
        }
      } catch (err) {
        console.error('Error fetching receipts:', err);
        setError('Failed to load receipts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [user]);

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
  };

  const handlePrintReceipt = async (receipt) => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current.querySelector('.receipt-container'), {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the receipt in the PDF
      const imgWidth = 210; // A4 width in mm (portrait)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Receipt-${receipt.referenceNumber}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₵${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div className="payment-history-container p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        <div className="flex justify-center items-center h-40">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
          <p className="ml-3">Loading receipts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-container p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        <div className="error-message p-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="payment-history-container p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        <div className="empty-state p-6 text-center bg-gray-50 rounded-lg">
          <div className="icon-container mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <h4 className="text-lg font-medium mb-2">No Payments Yet</h4>
          <p className="text-gray-600">You haven't made any payments yet. Your payment receipts will appear here once you complete a payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-container p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Payment History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {receipt.referenceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(receipt.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(receipt.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {receipt.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewReceipt(receipt)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReceipt && (
        <div ref={receiptRef}>
          <Receipt 
            receipt={selectedReceipt} 
            onClose={handleCloseReceipt} 
            onPrint={handlePrintReceipt}
          />
        </div>
      )}
    </div>
  );
};

export default ReceiptList; 