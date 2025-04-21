// Test script for XLSX library
import * as XLSX from 'xlsx';

/**
 * Test the XLSX library directly
 * @returns {object} Result information
 */
export const testXlsxLibrary = () => {
  try {
    console.log('Testing XLSX library...');
    
    // Create sample data
    const data = [
      ['Name', 'Age', 'Country'],
      ['John Doe', 30, 'Ghana'],
      ['Jane Smith', 25, 'Ghana'],
      ['Bob Johnson', 40, 'Nigeria']
    ];
    
    // Log XLSX version and available methods for diagnostics
    const diagnostics = {
      version: XLSX.version,
      utils: Object.keys(XLSX.utils),
      methods: Object.keys(XLSX)
    };
    console.log('XLSX Diagnostics:', diagnostics);
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Data');
    
    // Generate Excel file binary data
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    console.log('XLSX binary generation successful:', !!wbout);
    
    // Try to save the file
    try {
      // Browser environment: Create a download
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-xlsx-library.xlsx';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      return { 
        success: true, 
        message: 'XLSX library test successful. File download initiated.',
        diagnostics
      };
    } catch (downloadError) {
      console.error('Download error:', downloadError);
      
      // Fall back to writeFile if blob approach fails
      try {
        XLSX.writeFile(wb, 'test-xlsx-library.xlsx');
        return { 
          success: true, 
          message: 'XLSX writeFile successful as fallback method',
          diagnostics
        };
      } catch (writeError) {
        return { 
          success: false, 
          message: 'Both download approaches failed',
          error: {
            download: downloadError.message,
            writeFile: writeError.message
          },
          diagnostics
        };
      }
    }
  } catch (error) {
    console.error('Error testing XLSX library:', error);
    return { 
      success: false, 
      message: 'XLSX library test failed', 
      error: error.message 
    };
  }
};

// Export a function to run the test
export const runXlsxTest = () => {
  const result = testXlsxLibrary();
  console.log('XLSX Test Result:', result);
  return result;
}; 