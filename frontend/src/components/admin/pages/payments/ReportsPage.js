import React, { useState } from 'react';
import { Calendar, Download, FileText, Share2, UserPlus, CreditCard, Check } from 'lucide-react';
import { generatePaymentReport, exportData } from './actions';
import { toast } from 'react-hot-toast';
import '../../css/payment-portal.css';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([
    'totalRevenue',
    'transactionCount',
    'averageTransaction'
  ]);
  const [userCategories, setUserCategories] = useState([
    'jobSeeker',
    'employer',
    'trainer',
    'trainee'
  ]);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [scheduleReport, setScheduleReport] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [recipients, setRecipients] = useState('');

  const availableMetrics = [
    { id: 'totalRevenue', label: 'Total Revenue' },
    { id: 'transactionCount', label: 'Transaction Count' },
    { id: 'successRate', label: 'Success Rate' },
    { id: 'averageTransaction', label: 'Average Transaction Value' },
    { id: 'topPaymentMethods', label: 'Top Payment Methods' },
    { id: 'peakTransactionTimes', label: 'Peak Transaction Times' },
    { id: 'userGrowth', label: 'User Growth' },
    { id: 'revenueByCategory', label: 'Revenue by Category' },
    { id: 'failedTransactions', label: 'Failed Transactions' },
    { id: 'refundRate', label: 'Refund Rate' }
  ];

  const userCategoryOptions = [
    { id: 'jobSeeker', label: 'Job Seekers' },
    { id: 'employer', label: 'Employers' },
    { id: 'trainer', label: 'Trainers' },
    { id: 'trainee', label: 'Trainees' }
  ];

  const handleMetricToggle = (metricId) => {
    if (selectedMetrics.includes(metricId)) {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    } else {
      setSelectedMetrics([...selectedMetrics, metricId]);
    }
  };

  const handleUserCategoryToggle = (categoryId) => {
    if (userCategories.includes(categoryId)) {
      setUserCategories(userCategories.filter(id => id !== categoryId));
    } else {
      setUserCategories([...userCategories, categoryId]);
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Prepare report options
      const reportOptions = {
        reportType,
        dateRange,
        metrics: selectedMetrics,
        userCategories
      };
      
      // Add custom date range if applicable
      if (dateRange === 'custom') {
        if (!customDateRange.startDate || !customDateRange.endDate) {
          toast.error('Please provide both start and end dates for custom range');
          setIsGenerating(false);
          return;
        }
        
        reportOptions.startDate = customDateRange.startDate;
        reportOptions.endDate = customDateRange.endDate;
      }
      
      // Call API to generate report
      const data = await generatePaymentReport(reportOptions);
      
      // Update state with generated report
      setReportData(data);
      setReportGenerated(true);
      setIsGenerating(false);
      
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      setIsGenerating(false);
    }
  };

  const handleExport = async (format) => {
    try {
      if (!reportData) {
        toast.error('Please generate a report first');
        return;
      }
      
      setIsGenerating(true);
      toast.loading(`Exporting report as ${format.toUpperCase()}...`);
      
      // Add reportType to data if it doesn't exist
      const dataToExport = {
        ...reportData,
        reportType: reportType || 'summary'
      };
      
      // Call export function
      const result = await exportData(dataToExport, format, `payment-report-${Date.now()}.${format}`);
      
      toast.dismiss();
      toast.success(result.message);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.dismiss();
      toast.error('Failed to export report: ' + (error.message || ''));
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₵${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="section-body">
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Reports</h1>
        <p className="text-gray-500">Generate custom payment reports and analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Configuration</h2>
            
            {/* Report Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    reportType === 'summary' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setReportType('summary')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Summary
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    reportType === 'detailed' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setReportType('detailed')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Detailed
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    reportType === 'custom' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setReportType('custom')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Custom
                </button>
              </div>
            </div>
            
            {/* Date Range Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    dateRange === 'daily' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('daily')}
                >
                  Daily
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    dateRange === 'weekly' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('weekly')}
                >
                  Weekly
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    dateRange === 'monthly' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    dateRange === 'custom' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('custom')}
                >
                  Custom
                </button>
              </div>
              
              {/* Custom Date Range Inputs */}
              {dateRange === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* User Categories Selection (only for custom reports) */}
            {reportType === 'custom' && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">User Categories to Include</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {userCategoryOptions.map(category => (
                    <div 
                      key={category.id}
                      className={`py-2 px-3 rounded-md border cursor-pointer flex items-center justify-between ${
                        userCategories.includes(category.id) 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserCategoryToggle(category.id)}
                    >
                      <span>{category.label}</span>
                      {userCategories.includes(category.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Metrics Selection (only for custom reports) */}
            {reportType === 'custom' && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Metrics to Include</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableMetrics.map(metric => (
                    <div 
                      key={metric.id}
                      className={`py-2 px-3 rounded-md border cursor-pointer flex items-center justify-between ${
                        selectedMetrics.includes(metric.id) 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleMetricToggle(metric.id)}
                    >
                      <span>{metric.label}</span>
                      {selectedMetrics.includes(metric.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Output Format */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    outputFormat === 'pdf' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOutputFormat('pdf')}
                >
                  PDF
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    outputFormat === 'csv' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOutputFormat('csv')}
                >
                  CSV
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    outputFormat === 'excel' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOutputFormat('excel')}
                >
                  Excel
                </button>
              </div>
            </div>
            
            {/* Schedule Options */}
            <div className="mb-5">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="scheduleReport"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={scheduleReport}
                  onChange={() => setScheduleReport(!scheduleReport)}
                />
                <label htmlFor="scheduleReport" className="ml-2 block text-sm font-medium text-gray-700">
                  Schedule This Report
                </label>
              </div>
              
              {scheduleReport && (
                <div className="pt-2 pl-6">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="2"
                      placeholder="Enter email addresses separated by commas"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            
            {/* Generate Report Button */}
            <div className="flex items-center justify-end space-x-3">
              <button
                className="py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setReportType('summary');
                  setDateRange('monthly');
                  setSelectedMetrics(['totalRevenue', 'transactionCount', 'averageTransaction']);
                  setUserCategories(['jobSeeker', 'employer', 'trainer', 'trainee']);
                  setCustomDateRange({ startDate: '', endDate: '' });
                  setOutputFormat('pdf');
                  setScheduleReport(false);
                }}
              >
                Reset
              </button>
              
              <button
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={generateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Report Preview Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Quick Controls</h2>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-800 mb-1">Monthly Revenue Report</h3>
                <p className="text-sm text-gray-500">Summary of all revenue for the current month</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-800 mb-1">Transaction History</h3>
                <p className="text-sm text-gray-500">Detailed list of all transactions with user details</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-800 mb-1">Category Breakdown</h3>
                <p className="text-sm text-gray-500">Revenue breakdown by user categories</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-800 mb-1">Weekly Trends</h3>
                <p className="text-sm text-gray-500">Week-by-week revenue comparison</p>
              </div>
            </div>
          </div>
          
          {/* Recently Generated Reports */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recently Generated</h2>
            
            {/* If no reports have been generated */}
            {!reportGenerated && !reportData && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No reports generated yet.</p>
                <p className="text-sm">Configure and generate a report to see a preview here.</p>
              </div>
            )}
            
            {/* If a report has been generated, show preview */}
            {reportGenerated && reportData && (
              <div>
                <div className="border-b pb-3 mb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">
                      {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {dateRange === 'custom' 
                      ? `${customDateRange.startDate} to ${customDateRange.endDate}`
                      : `${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} Report`
                    }
                  </p>
                </div>
                
                <div className="space-y-3 mb-4">
                  {reportType === 'summary' && (
                    <>
                      <div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                        <div className="font-semibold">{formatCurrency(reportData.totalRevenue || 0)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Transaction Count</div>
                        <div className="font-semibold">{reportData.transactionCount || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Average Transaction</div>
                        <div className="font-semibold">{formatCurrency(reportData.averageRevenue || 0)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Date Range</div>
                        <div className="font-semibold">
                          {reportData.dateRange ? 
                            `${formatDate(reportData.dateRange.from)} - ${formatDate(reportData.dateRange.to)}` : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </>
                  )}
                  
                  {reportType === 'detailed' && (
                    <>
                      <div>
                        <div className="text-sm text-gray-500">Total Transactions</div>
                        <div className="font-semibold">{(reportData.transactions || []).length}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Payment Methods</div>
                        <div className="font-semibold">
                          {reportData.paymentMethods ? 
                            Object.keys(reportData.paymentMethods).join(', ') : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </>
                  )}
                  
                  {reportType === 'custom' && (
                    <>
                      {reportData.metrics?.totalRevenue !== undefined && (
                        <div>
                          <div className="text-sm text-gray-500">Total Revenue</div>
                          <div className="font-semibold">{formatCurrency(reportData.metrics.totalRevenue || 0)}</div>
                        </div>
                      )}
                      
                      {reportData.metrics?.transactionCount !== undefined && (
                        <div>
                          <div className="text-sm text-gray-500">Transaction Count</div>
                          <div className="font-semibold">{reportData.metrics.transactionCount || 0}</div>
                        </div>
                      )}
                      
                      {reportData.metrics?.averageTransaction !== undefined && (
                        <div>
                          <div className="text-sm text-gray-500">Avg Transaction</div>
                          <div className="font-semibold">{formatCurrency(reportData.metrics.averageTransaction || 0)}</div>
                        </div>
                      )}
                      
                      {reportData.metrics?.userCounts && (
                        <div>
                          <div className="text-sm text-gray-500">User Counts</div>
                          <div className="font-semibold text-xs">
                            {Object.entries(reportData.metrics.userCounts).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    onClick={() => handleExport(outputFormat)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export {outputFormat.toUpperCase()}
                  </button>
                  <button
                    className="flex items-center justify-center p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    onClick={() => {
                      // Copy report URL or share functionality
                      toast.success('Report link copied to clipboard');
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ReportsPage; 