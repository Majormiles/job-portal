import React, { useState } from 'react';
import runAllFixes from '../../scripts/fixProfileAndResume';

const FixProfileResume = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunFix = async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      // Create a custom console.log to capture the output
      const logs = [];
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalConsoleLog(...args);
      };
      
      console.error = (...args) => {
        logs.push(`ERROR: ${args.join(' ')}`);
        originalConsoleError(...args);
      };
      
      // Run the fix script
      await runAllFixes();
      
      // Restore console
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
      // Set the result
      setResult(logs.join('\n'));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Fix Profile & Resume Issues</h2>
      <p className="mb-4 text-gray-600">
        This tool will fix issues with profile images and resume persistence.
      </p>
      
      <button
        onClick={handleRunFix}
        disabled={isRunning}
        className={`px-4 py-2 rounded ${
          isRunning
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isRunning ? 'Running...' : 'Run Fix'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default FixProfileResume; 