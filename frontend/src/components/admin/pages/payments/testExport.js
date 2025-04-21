import { generateExcelReport } from './reportUtils';

// Test data
const testData = {
  reportType: 'summary',
  metrics: {
    totalRevenue: 5000.50,
    transactionCount: 25,
    averageTransaction: 200.02,
    successRate: 95,
    userCounts: {
      employer: 10,
      jobseeker: 15
    }
  }
};

// Test function
function testExcelExport() {
  try {
    const result = generateExcelReport(testData, 'test-report');
    console.log('Excel export result:', result);
    return result;
  } catch (error) {
    console.error('Excel export test failed:', error);
    return { success: false, error: error.message };
  }
}

// Export the test function
export { testExcelExport }; 