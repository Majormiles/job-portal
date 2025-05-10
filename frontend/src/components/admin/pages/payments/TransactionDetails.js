import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Clock, CreditCard, User, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate, formatCurrency, getStatusColorClasses, fetchTransactionById } from './actions';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        
        // Check if ID is undefined or null
        if (!id) {
          setError('Invalid transaction ID');
          toast.error('Transaction ID is missing');
          setIsLoading(false);
          return;
        }
        
        try {
          // First attempt: Try to fetch from API
          const transactionData = await fetchTransactionById(id);
          console.log('Transaction data received from API:', transactionData);
          setTransaction(transactionData);
        } catch (apiError) {
          console.error('Error fetching from API, trying localStorage fallback:', apiError);
          
          // Second attempt: Try to get from localStorage (saved when clicking the eye icon)
          const storedTransaction = localStorage.getItem('lastViewedTransaction');
          if (storedTransaction) {
            try {
              const parsedTransaction = JSON.parse(storedTransaction);
              
              // Verify this is the transaction we want by comparing IDs
              const storedIds = [
                parsedTransaction._id,
                parsedTransaction.id,
                parsedTransaction.reference,
                parsedTransaction.safeId,
                parsedTransaction.transactionId
              ].filter(Boolean);
              
              // Check if any of the stored transaction's IDs match the requested ID
              const isMatchingTransaction = storedIds.some(storedId => 
                storedId === id || 
                storedId?.toLowerCase() === id?.toLowerCase() ||
                storedId?.includes(id) ||
                id?.includes(storedId)
              );
              
              if (isMatchingTransaction) {
                console.log('Found matching transaction in localStorage:', parsedTransaction);
                setTransaction(parsedTransaction);
              } else {
                throw new Error('Stored transaction does not match the requested ID');
              }
            } catch (parseError) {
              console.error('Error parsing stored transaction:', parseError);
              throw apiError; // Throw the original API error
            }
          } else {
            throw apiError; // Re-throw the original API error if no stored transaction
          }
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        setError(error.message || 'An error occurred while fetching transaction details');
        toast.error('Error loading transaction details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
    
    // Cleanup function to remove stored transaction on component unmount
    return () => {
      localStorage.removeItem('lastViewedTransaction');
    };
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
      case 'SUCCESSFUL':
        return <Check className="h-6 w-6 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'FAILED':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="section-body">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => navigate('/admin/payments')} 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Payments
            </button>
          </div>
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaction Not Found</h2>
            <p className="text-gray-600">{error || 'The requested transaction could not be found or accessed.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-body">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => navigate('/admin/payments')} 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Payments
            </button>
            <div className={`px-3 py-1 rounded-full flex items-center ${getStatusColorClasses(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              <span className="ml-1 font-medium">{transaction.status}</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
          <p className="text-gray-500">Reference: {transaction.reference || transaction.id || transaction._id || 'N/A'}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-medium text-gray-900">{transaction.transactionId || transaction.id || transaction._id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">{transaction.date ? formatDate(transaction.date, { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900">{transaction.paymentMethod || 'Card Payment'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{transaction.user?.name || transaction.userName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{transaction.user?.email || transaction.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">User Type</p>
                    <p className="font-medium text-gray-900">{transaction.user?.roleName || transaction.userType || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {transaction.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 p-4 bg-gray-50 rounded-md">{transaction.description}</p>
            </div>
          )}

          {transaction.meta && Object.keys(transaction.meta).length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
              <div className="bg-gray-50 rounded-md p-4">
                {Object.entries(transaction.meta).map(([key, value]) => (
                  <div key={key} className="flex mb-2 last:mb-0">
                    <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                    <span className="text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails; 