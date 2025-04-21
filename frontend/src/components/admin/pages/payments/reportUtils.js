/**
 * Report Utilities for PDF, CSV, and Excel export
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Generate and download PDF report
 * @param {object} data - Report data
 * @param {string} filename - Output filename
 * @returns {object} Result information
 */
export const generatePdfReport = (data, filename) => {
  try {
    // Initialize PDF document
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Set document properties
    doc.setProperties({
      title: 'Payment Report',
      subject: 'Payment System Report',
      author: 'Job Portal Admin',
      creator: 'Job Portal System'
    });
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Payment Report', 105, 15, { align: 'center' });
    
    // Add report type and date information
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    
    // Add system date/time
    const currentDate = new Date();
    doc.text(`Generated: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`, 105, 22, { align: 'center' });
    
    // Add report period if available
    if (data.dateRange) {
      const fromDate = new Date(data.dateRange.from).toLocaleDateString();
      const toDate = new Date(data.dateRange.to).toLocaleDateString();
      doc.text(`Report Period: ${fromDate} to ${toDate}`, 105, 27, { align: 'center' });
    }
    
    // Add horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 30, 190, 30);
    
    // Determine report type and generate appropriate content
    if (data.reportType === 'summary' || (data.metrics && !data.transactions)) {
      // For summary reports, show key metrics
      const summaryData = [];
      
      // Add total revenue if available
      const totalRevenue = data.totalRevenue || data.metrics?.totalRevenue;
      if (totalRevenue !== undefined) {
        summaryData.push(['Total Revenue', `₵${parseFloat(totalRevenue).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`]);
      }
      
      // Add transaction count if available
      const transactionCount = data.transactionCount || data.metrics?.transactionCount;
      if (transactionCount !== undefined) {
        summaryData.push(['Transaction Count', transactionCount.toString()]);
      }
      
      // Add average transaction if available
      const avgTransaction = data.averageRevenue || data.averageTransaction || data.metrics?.averageTransaction;
      if (avgTransaction !== undefined) {
        summaryData.push(['Average Transaction', `₵${parseFloat(avgTransaction).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`]);
      }
      
      // Add success rate if available
      const successRate = data.successRate || data.metrics?.successRate;
      if (successRate !== undefined) {
        summaryData.push(['Success Rate', `${successRate}%`]);
      }
      
      // Generate the summary table
      autoTable(doc, {
        startY: 40,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // If user counts are available, add as a separate table
      if (data.userCounts || data.metrics?.userCounts) {
        const userCountData = [];
        const userCounts = data.userCounts || data.metrics.userCounts;
        
        Object.entries(userCounts).forEach(([userType, count]) => {
          userCountData.push([`${userType.charAt(0).toUpperCase() + userType.slice(1)}s`, count.toString()]);
        });
        
        // Get the last table's Y position
        const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 100;
        
        // Add the user count table
        autoTable(doc, {
          startY: finalY + 15,
          head: [['User Type', 'Count']],
          body: userCountData,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
      }
    } else if (data.transactions || data.reportType === 'detailed') {
      // For detailed reports with transactions
      const transactions = data.transactions || [];
      const transactionData = transactions.map(transaction => [
        transaction.reference || transaction.transactionId || 'N/A',
        new Date(transaction.createdAt || transaction.date).toLocaleDateString(),
        transaction.userType || transaction.user?.role || 'N/A',
        transaction.paymentMethod || 'N/A',
        `₵${parseFloat(transaction.amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        transaction.status || 'N/A'
      ]);
      
      // Generate the transactions table
      autoTable(doc, {
        startY: 40,
        head: [['Reference', 'Date', 'User Type', 'Payment Method', 'Amount', 'Status']],
        body: transactionData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 'auto' }
        }
      });
    }
    
    // Add page numbers for multiple pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      
      // Add footer
      doc.setTextColor(100, 100, 100);
      doc.text('Job Portal - Payment Report', 105, doc.internal.pageSize.height - 5, { align: 'center' });
    }
    
    // Add filename extension if missing
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }
    
    // Save the PDF file
    doc.save(filename);
    
    return {
      success: true,
      message: 'PDF report generated and downloaded successfully'
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Generate and download CSV report
 * @param {object} data - Report data
 * @param {string} filename - Output filename
 * @returns {object} Result information
 */
export const generateCsvReport = (data, filename) => {
  try {
    // Prepare CSV content based on report type
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (data.reportType === 'summary' || (data.metrics && !data.transactions)) {
      // For summary reports
      csvContent += 'Metric,Value\n';
      
      // Add total revenue if available
      const totalRevenue = data.totalRevenue || data.metrics?.totalRevenue;
      if (totalRevenue !== undefined) {
        csvContent += `Total Revenue,₵${parseFloat(totalRevenue).toFixed(2)}\n`;
      }
      
      // Add transaction count if available
      const transactionCount = data.transactionCount || data.metrics?.transactionCount;
      if (transactionCount !== undefined) {
        csvContent += `Transaction Count,${transactionCount}\n`;
      }
      
      // Add average transaction if available
      const avgTransaction = data.averageRevenue || data.averageTransaction || data.metrics?.averageTransaction;
      if (avgTransaction !== undefined) {
        csvContent += `Average Transaction,₵${parseFloat(avgTransaction).toFixed(2)}\n`;
      }
      
      // Add success rate if available
      const successRate = data.successRate || data.metrics?.successRate;
      if (successRate !== undefined) {
        csvContent += `Success Rate,${successRate}%\n`;
      }
      
      // Add user counts if available
      if (data.userCounts || data.metrics?.userCounts) {
        csvContent += '\nUser Type,Count\n';
        const userCounts = data.userCounts || data.metrics.userCounts;
        
        Object.entries(userCounts).forEach(([userType, count]) => {
          csvContent += `${userType.charAt(0).toUpperCase() + userType.slice(1)}s,${count}\n`;
        });
      }
    } else if (data.transactions || data.reportType === 'detailed') {
      // For detailed reports with transactions
      csvContent += 'Reference,Date,User Type,Payment Method,Amount,Status\n';
      
      const transactions = data.transactions || [];
      transactions.forEach(transaction => {
        csvContent += `${transaction.reference || transaction.transactionId || 'N/A'},`;
        csvContent += `${new Date(transaction.createdAt || transaction.date).toLocaleDateString()},`;
        csvContent += `${transaction.userType || transaction.user?.role || 'N/A'},`;
        csvContent += `${transaction.paymentMethod || 'N/A'},`;
        csvContent += `₵${parseFloat(transaction.amount).toFixed(2)},`;
        csvContent += `${transaction.status || 'N/A'}\n`;
      });
    }
    
    // Add filename extension if missing
    if (!filename.toLowerCase().endsWith('.csv')) {
      filename += '.csv';
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return {
      success: true,
      message: 'CSV report generated and downloaded successfully'
    };
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new Error(`Failed to generate CSV: ${error.message}`);
  }
};

/**
 * Generate and download Excel report
 * @param {object} data - Report data
 * @param {string} filename - Output filename
 * @returns {object} Result information
 */
export const generateExcelReport = (data, filename) => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    if (data.reportType === 'summary' || (data.metrics && !data.transactions)) {
      // For summary reports
      const summaryData = [['Metric', 'Value']];
      
      // Add total revenue if available
      const totalRevenue = data.totalRevenue || data.metrics?.totalRevenue;
      if (totalRevenue !== undefined) {
        summaryData.push(['Total Revenue', `₵${parseFloat(totalRevenue).toFixed(2)}`]);
      }
      
      // Add transaction count if available
      const transactionCount = data.transactionCount || data.metrics?.transactionCount;
      if (transactionCount !== undefined) {
        summaryData.push(['Transaction Count', transactionCount]);
      }
      
      // Add average transaction if available
      const avgTransaction = data.averageRevenue || data.averageTransaction || data.metrics?.averageTransaction;
      if (avgTransaction !== undefined) {
        summaryData.push(['Average Transaction', `₵${parseFloat(avgTransaction).toFixed(2)}`]);
      }
      
      // Create summary worksheet
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Add user counts if available
      if (data.userCounts || data.metrics?.userCounts) {
        const userCountData = [['User Type', 'Count']];
        const userCounts = data.userCounts || data.metrics.userCounts;
        
        Object.entries(userCounts).forEach(([userType, count]) => {
          userCountData.push([`${userType.charAt(0).toUpperCase() + userType.slice(1)}s`, count]);
        });
        
        // Create user counts worksheet
        const userCountWs = XLSX.utils.aoa_to_sheet(userCountData);
        XLSX.utils.book_append_sheet(wb, userCountWs, 'User Counts');
      }
    } else if (data.transactions || data.reportType === 'detailed') {
      // For detailed reports with transactions
      const transactionsData = [['Reference', 'Date', 'User Type', 'Payment Method', 'Amount', 'Status']];
      
      const transactions = data.transactions || [];
      transactions.forEach(transaction => {
        transactionsData.push([
          transaction.reference || transaction.transactionId || 'N/A',
          new Date(transaction.createdAt || transaction.date).toLocaleDateString(),
          transaction.userType || transaction.user?.role || 'N/A',
          transaction.paymentMethod || 'N/A',
          `₵${parseFloat(transaction.amount).toFixed(2)}`,
          transaction.status || 'N/A'
        ]);
      });
      
      // Create transactions worksheet
      const transactionsWs = XLSX.utils.aoa_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, transactionsWs, 'Transactions');
    }
    
    // Add filename extension if missing
    if (!filename.toLowerCase().endsWith('.xlsx')) {
      filename += '.xlsx';
    }
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, filename);
    
    return {
      success: true,
      message: 'Excel report generated and downloaded successfully'
    };
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw new Error(`Failed to generate Excel: ${error.message}`);
  }
};

/**
 * Export data to the specified format
 * @param {object} data - Report data
 * @param {string} format - Export format (pdf, csv, excel)
 * @param {string} filename - Output filename
 * @returns {Promise} Promise that resolves with the export result
 */
export const exportReportData = async (data, format, filename) => {
  try {
    console.log(`Exporting data to ${format} format as ${filename}`);
    
    switch (format.toLowerCase()) {
      case 'pdf':
        return generatePdfReport(data, filename);
      case 'csv':
        return generateCsvReport(data, filename);
      case 'excel':
        return generateExcelReport(data, filename);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error(`Error exporting to ${format}:`, error);
    throw new Error(`Failed to export as ${format}: ${error.message}`);
  }
}; 