import React, { useState } from 'react';
import { Calendar, Download, FileText, Share2, UserPlus, CreditCard, Check } from 'lucide-react';
import '../../css/payment-portal.css';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState([
    'totalRevenue',
    'transactionCount',
    'averageTransaction'
  ]);
  const [userCategories, setUserCategories] = useState([
    'jobSeekers',
    'employers',
    'trainers',
    'trainees'
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
    { id: 'jobSeekers', label: 'Job Seekers' },
    { id: 'employers', label: 'Employers' },
    { id: 'trainers', label: 'Trainers' },
    { id: 'trainees', label: 'Trainees' }
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

  const generateReport = () => {
    setIsGenerating(true);
    
    // In a real app, this would call an API to generate the report
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 2000);
  };

  const downloadReport = (format) => {
    // In a real app, this would trigger the download of the report
    alert(`Downloading report in ${format} format...`);
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    outputFormat === 'pdf' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 export-button' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOutputFormat('pdf')}
                >
                  PDF
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    outputFormat === 'excel' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 export-button' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOutputFormat('excel')}
                >
                  Excel
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    outputFormat === 'csv' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 export-button' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOutputFormat('csv')}
                >
                  CSV
                </button>
                <button
                  className={`py-2 px-3 rounded-md flex items-center justify-center ${
                    outputFormat === 'html' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 export-button' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOutputFormat('html')}
                >
                  HTML
                </button>
              </div>
            </div>

            {/* Report Scheduling */}
            <div className="mb-5">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="scheduleReport"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={scheduleReport}
                  onChange={() => setScheduleReport(!scheduleReport)}
                />
                <label htmlFor="scheduleReport" className="ml-2 block text-sm font-medium text-gray-700">
                  Schedule This Report
                </label>
              </div>
              
              {scheduleReport && (
                <div className="pl-6 mt-3 space-y-4">
                  <div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Recipients</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email addresses, separated by commas"
                      rows="2"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">Separate multiple email addresses with commas</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateReport}
                disabled={isGenerating || (reportType === 'custom' && selectedMetrics.length === 0)}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating...
                  </>
                ) : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports and Scheduled Reports */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h2>
            
            {reportGenerated ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>
                      <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600">
                      New
                    </span>
                  </div>
                  <div className="flex mt-3">
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center mr-4"
                      onClick={() => downloadReport(outputFormat)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">Monthly Summary</h3>
                      <p className="text-sm text-gray-500">Apr 30, 2023</p>
                    </div>
                  </div>
                  <div className="flex mt-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center mr-4">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">Quarterly Analysis</h3>
                      <p className="text-sm text-gray-500">Mar 31, 2023</p>
                    </div>
                  </div>
                  <div className="flex mt-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center mr-4">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No recent reports available</p>
                <p className="text-gray-400 text-sm">Generated reports will appear here</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Scheduled Reports</h2>
            
            {scheduleReport ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>
                      <p className="text-sm text-gray-500">
                        {scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1)}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                      Active
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500 mb-3">
                    <p>Next: {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}</p>
                    <p className="text-xs mt-1">Recipients: {recipients || 'admin@example.com'}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Edit Recipients
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No scheduled reports</p>
                <p className="text-gray-400 text-sm">Schedule reports to receive them automatically</p>
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