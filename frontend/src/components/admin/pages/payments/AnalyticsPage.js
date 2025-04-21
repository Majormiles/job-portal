import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUp, ArrowDown, BarChart2, TrendingUp, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { fetchPaymentAnalytics } from './actions';
import { toast } from 'react-hot-toast';
import '../../css/payment-portal.css';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    summary: {
      totalRevenue: 0,
      previousPeriodRevenue: 0,
      percentageChange: 0,
      averageTransaction: 0,
      successRate: 0,
      topUserType: ''
    },
    trends: [],
    distribution: [],
    userGrowth: [],
    forecast: [],
    comparison: {
      current: [],
      previous: []
    }
  });

  useEffect(() => {
    // Fetch analytics data from API
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Get analytics data from API
        const data = await fetchPaymentAnalytics(timeRange, comparisonMode);
        setAnalyticsData(data);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data");
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange, comparisonMode]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
  };

  // Get the correct data based on the selected time range
  const getTrendsData = () => {
    if (!analyticsData.trends || analyticsData.trends.length === 0) {
      // Return empty array if no data
      return [];
    }
    
    // Return trends data, but ensure it has the right x-axis key
    return analyticsData.trends.map(item => {
      // Check if we need to rename the keys based on time range
      if (timeRange === 'daily' && item.day) {
        return item;
      } else if (timeRange === 'weekly' && item.week) {
        return item;
      } else if (timeRange === 'yearly' && item.year) {
        return item;
      } else {
        return item; // Default to monthly format
      }
    });
  };

  // Get the appropriate X-axis key for the selected time range
  const getXAxisKey = () => {
    switch (timeRange) {
      case 'daily':
        return 'day';
      case 'weekly':
        return 'week';
      case 'yearly':
        return 'year';
      default:
        return 'month';
    }
  };

  // Generate forecast data if not provided by API
  const getForecastData = () => {
    if (analyticsData.forecast && analyticsData.forecast.length > 0) {
      return analyticsData.forecast;
    }
    
    // Generate simple forecast if not provided
    const trends = getTrendsData();
    if (trends.length === 0) return [];
    
    // Get the average growth rate
    let avgGrowth = 0;
    for (let i = 1; i < trends.length; i++) {
      const current = trends[i].revenue;
      const previous = trends[i-1].revenue;
      if (previous > 0) {
        avgGrowth += (current - previous) / previous;
      }
    }
    avgGrowth = avgGrowth / (trends.length - 1) || 0.05; // Default to 5% if can't calculate
    
    // Create forecast data (3 periods ahead)
    const forecast = [...trends];
    const lastRevenue = trends[trends.length - 1]?.revenue || 0;
    const xAxisKey = getXAxisKey();
    
    // Add forecast points
    for (let i = 1; i <= 3; i++) {
      const nextValue = lastRevenue * (1 + avgGrowth * i);
      let nextItem = { revenue: Math.round(nextValue) };
      
      // Set appropriate key for x-axis
      nextItem[xAxisKey] = `${xAxisKey.charAt(0).toUpperCase() + xAxisKey.slice(1)} ${trends.length + i} (Forecast)`;
      
      forecast.push(nextItem);
    }
    
    return forecast;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="section-body">
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Analytics</h1>
        <p className="text-gray-500">Detailed insights and forecasting for payment activities</p>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border space-x-1">
          <button 
            className={`px-4 py-2 text-sm rounded-md transition-colors ${timeRange === 'daily' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => handleTimeRangeChange('daily')}
          >
            Daily
          </button>
          <button 
            className={`px-4 py-2 text-sm rounded-md transition-colors ${timeRange === 'weekly' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => handleTimeRangeChange('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`px-4 py-2 text-sm rounded-md transition-colors ${timeRange === 'monthly' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => handleTimeRangeChange('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`px-4 py-2 text-sm rounded-md transition-colors ${timeRange === 'yearly' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => handleTimeRangeChange('yearly')}
          >
            Yearly
          </button>
        </div>
        
        <button 
          className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
            comparisonMode ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100 border shadow-sm'
          }`}
          onClick={toggleComparisonMode}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {comparisonMode ? 'Hide Comparison' : 'Compare with Previous Period'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className={`flex items-center text-xs font-medium ${analyticsData.summary.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData.summary.percentageChange >= 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(analyticsData.summary.percentageChange).toFixed(1)}%
            </div>
          </div>
          <div className="text-xl font-bold text-gray-800">₵{analyticsData.summary.totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Avg. Transaction</h3>
          </div>
          <div className="text-xl font-bold text-gray-800">₵{analyticsData.summary.averageTransaction.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          </div>
          <div className="text-xl font-bold text-gray-800">{analyticsData.summary.successRate}%</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Top Contributor</h3>
          </div>
          <div className="text-xl font-bold text-gray-800">{analyticsData.summary.topUserType}</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getTrendsData()}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisKey()} />
                <YAxis />
                <Tooltip formatter={(value) => `₵${value}`} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={4}
                  dataKey="value"
                  label={({name, value, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₵${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Chart (if comparison mode is enabled) */}
      {comparisonMode && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Period Comparison</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.comparison.current.map((item, index) => ({
                  name: item[getXAxisKey()],
                  current: item.revenue,
                  previous: analyticsData.comparison.previous[index]?.revenue || 0
                }))}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₵${value}`} />
                <Legend />
                <Bar name="Current Period" dataKey="current" fill="#3b82f6" />
                <Bar name="Previous Period" dataKey="previous" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Forecast</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={getForecastData()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getXAxisKey()} />
              <YAxis />
              <Tooltip formatter={(value) => `₵${value}`} />
              <Legend />
              <Line
                name="Actual Revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                name="Forecast Revenue"
                type="monotone"
                dataKey="forecast"
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Growth by User Type</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analyticsData.userGrowth}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Job Seekers" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Employers" stackId="a" fill="#10b981" />
              <Bar dataKey="Trainers" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Trainees" stackId="a" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AnalyticsPage; 