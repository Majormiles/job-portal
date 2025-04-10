import React, { useState, useEffect } from 'react';
import { testEmailVerification } from '../utils/testEmailVerification';
import axios from 'axios';

const EmailVerificationTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // First check if the API URL is configured
        if (!process.env.REACT_APP_API_URL) {
          throw new Error('API URL is not configured. Please check your environment variables.');
        }

        // Try to connect to the API using a public endpoint
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/config`);
        setApiStatus({
          status: 'success',
          message: 'API is accessible',
          data: response.data
        });
        setInitialized(true);
      } catch (error) {
        console.error('API Status Check Error:', error);
        let errorMessage = 'API is not accessible';
        let errorDetails = error.message;

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = `API Error: ${error.response.status}`;
          errorDetails = error.response.data?.message || error.message;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'No response from API';
          errorDetails = 'The server might be down or unreachable';
        }

        setApiStatus({
          status: 'error',
          message: errorMessage,
          error: errorDetails
        });
        setInitialized(true);
      }
    };

    checkApiStatus();
  }, []);

  const runTest = async () => {
    if (!initialized) {
      setError('Please wait for the component to initialize');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const testResults = await testEmailVerification();
      setResults(testResults);
    } catch (err) {
      setError(err.message);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Initializing...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (apiStatus?.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">API Connection Error</h2>
              <p className="text-gray-600 mb-4">{apiStatus.message}</p>
              <p className="text-sm text-gray-500 mb-4">Error details: {apiStatus.error}</p>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 mr-2"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => window.open(`${process.env.REACT_APP_API_URL}/auth/config`, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Check API URL
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>Current API URL: {process.env.REACT_APP_API_URL}</p>
                <p>Please ensure:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>The backend server is running</li>
                  <li>The API URL is correct</li>
                  <li>You can access the API directly in your browser</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Email Verification Test</h2>
          
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded">
            <p className="font-medium">API Status: Connected</p>
            <p className="text-sm">{apiStatus?.message}</p>
            <p className="text-sm mt-1">API URL: {process.env.REACT_APP_API_URL}</p>
          </div>
          
          <button
            onClick={runTest}
            disabled={loading}
            className="mb-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Running Test...' : 'Run Test'}
          </button>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-bold mr-2">Overall Status:</span>
                <span className={results.success ? 'text-green-600' : 'text-red-600'}>
                  {results.success ? 'Success' : 'Failed'}
                </span>
              </div>

              <div>
                <h3 className="font-bold mb-2">Test Steps:</h3>
                <div className="space-y-2">
                  {results.steps.map((step, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{step.name}</span>
                        <span className={step.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                          {step.status}
                        </span>
                      </div>
                      <pre className="mt-2 text-sm text-gray-600 overflow-x-auto">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold text-red-600 mb-2">Errors Found:</h3>
                  <ul className="list-disc list-inside text-red-600">
                    {results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationTest; 