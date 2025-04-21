import React, { useState } from 'react';
import { runXlsxTest } from './testExcel';

const TestXlsxComponent = () => {
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestClick = async () => {
    try {
      setIsLoading(true);
      setTestResult(null);
      setTestError(null);
      
      const result = runXlsxTest();
      
      if (result.success) {
        setTestResult(result);
      } else {
        setTestError(result);
      }
    } catch (error) {
      setTestError({ message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">XLSX Library Test</h2>
      
      <button 
        onClick={handleTestClick}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isLoading ? 'Testing...' : 'Run XLSX Test'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-semibold text-green-700">Test Successful</h3>
          <p className="mt-1">{testResult.message}</p>
          
          {testResult.diagnostics && (
            <div className="mt-3">
              <p className="font-semibold">XLSX Version: {testResult.diagnostics.version}</p>
              <div className="mt-2">
                <p className="font-semibold">Available Methods:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-1">
                  {testResult.diagnostics.methods.slice(0, 12).map(method => (
                    <span key={method} className="text-sm bg-green-100 px-2 py-1 rounded">{method}</span>
                  ))}
                  {testResult.diagnostics.methods.length > 12 && (
                    <span className="text-sm">...and {testResult.diagnostics.methods.length - 12} more</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {testError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-semibold text-red-700">Test Failed</h3>
          <p className="mt-1">{testError.message}</p>
          
          {testError.error && (
            <div className="mt-2">
              <p className="font-semibold">Error Details:</p>
              {typeof testError.error === 'string' ? (
                <p className="mt-1 text-red-600">{testError.error}</p>
              ) : (
                <ul className="list-disc list-inside mt-1">
                  {Object.entries(testError.error).map(([key, value]) => (
                    <li key={key} className="text-red-600">
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {testError.diagnostics && (
            <div className="mt-3">
              <p className="font-semibold">XLSX Version: {testError.diagnostics.version}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 bg-gray-50 p-3 border rounded-md">
        <h3 className="text-lg font-semibold">Expected Behavior</h3>
        <ul className="list-disc list-inside mt-2">
          <li>Creating a workbook with sample data</li>
          <li>Generating an Excel file</li>
          <li>Downloading the file (in browser environment)</li>
          <li>Showing success/error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default TestXlsxComponent; 