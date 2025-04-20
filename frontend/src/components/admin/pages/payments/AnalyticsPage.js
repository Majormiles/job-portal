import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUp, ArrowDown, BarChart2, TrendingUp, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import '../../css/payment-portal.css';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    summary: {},
    trends: [],
    distribution: [],
    forecast: [],
    comparison: {
      current: [],
      previous: []
    }
  });

  // Mock data for development
  const mockAnalyticsData = {
    summary: {
      totalRevenue: 18150,
      previousPeriodRevenue: 16200,
      percentageChange: 12.03,
      averageTransaction: 75.62,
      successRate: 92,
      topUserType: 'Job Seekers'
    },
    trends: [
      { month: 'Jan', revenue: 1500 },
      { month: 'Feb', revenue: 1800 },
      { month: 'Mar', revenue: 2200 },
      { month: 'Apr', revenue: 1900 },
      { month: 'May', revenue: 2500 },
      { month: 'Jun', revenue: 3000 },
      { month: 'Jul', revenue: 2800 },
      { month: 'Aug', revenue: 3200 },
      { month: 'Sep', revenue: 3500 },
      { month: 'Oct', revenue: 3800 },
      { month: 'Nov', revenue: 4100 },
      { month: 'Dec', revenue: 4300 }
    ],
    dailyTrends: [
      { day: '1', revenue: 120 },
      { day: '2', revenue: 140 },
      { day: '3', revenue: 110 },
      { day: '4', revenue: 180 },
      { day: '5', revenue: 190 },
      { day: '6', revenue: 170 },
      { day: '7', revenue: 150 },
      { day: '8', revenue: 210 },
      { day: '9', revenue: 200 },
      { day: '10', revenue: 230 },
      { day: '11', revenue: 210 },
      { day: '12', revenue: 180 },
      { day: '13', revenue: 220 },
      { day: '14', revenue: 260 }
    ],
    weeklyTrends: [
      { week: 'Week 1', revenue: 800 },
      { week: 'Week 2', revenue: 950 },
      { week: 'Week 3', revenue: 1100 },
      { week: 'Week 4', revenue: 950 },
      { week: 'Week 5', revenue: 1200 },
      { week: 'Week 6', revenue: 1050 },
      { week: 'Week 7', revenue: 1300 },
      { week: 'Week 8', revenue: 1150 }
    ],
    yearlyTrends: [
      { year: '2020', revenue: 12000 },
      { year: '2021', revenue: 18000 },
      { year: '2022', revenue: 24000 },
      { year: '2023', revenue: 34000 }
    ],
    distribution: [
      { name: 'Job Seekers', value: 6200, color: '#3b82f6' },
      { name: 'Employers', value: 5700, color: '#10b981' },
      { name: 'Trainers', value: 1800, color: '#f59e0b' },
      { name: 'Trainees', value: 4450, color: '#6366f1' }
    ],
    userGrowth: [
      { month: 'Jan', 'Job Seekers': 5, 'Employers': 3, 'Trainers': 1, 'Trainees': 4 },
      { month: 'Feb', 'Job Seekers': 8, 'Employers': 5, 'Trainers': 2, 'Trainees': 6 },
      { month: 'Mar', 'Job Seekers': 12, 'Employers': 7, 'Trainers': 3, 'Trainees': 9 },
      { month: 'Apr', 'Job Seekers': 15, 'Employers': 9, 'Trainers': 2, 'Trainees': 12 },
      { month: 'May', 'Job Seekers': 20, 'Employers': 12, 'Trainers': 4, 'Trainees': 15 },
      { month: 'Jun', 'Job Seekers': 25, 'Employers': 15, 'Trainers': 4, 'Trainees': 18 }
    ],
    forecast: [
      { month: 'Jan', actual: 1500, forecast: null },
      { month: 'Feb', actual: 1800, forecast: null },
      { month: 'Mar', actual: 2200, forecast: null },
      { month: 'Apr', actual: 1900, forecast: null },
      { month: 'May', actual: 2500, forecast: null },
      { month: 'Jun', actual: 3000, forecast: null },
      { month: 'Jul', actual: 2800, forecast: null },
      { month: 'Aug', actual: 3200, forecast: null },
      { month: 'Sep', actual: 3500, forecast: null },
      { month: 'Oct', actual: 3800, forecast: null },
      { month: 'Nov', actual: 4100, forecast: null },
      { month: 'Dec', actual: 4300, forecast: null },
      { month: 'Jan (Forecast)', actual: null, forecast: 4500 },
      { month: 'Feb (Forecast)', actual: null, forecast: 4800 },
      { month: 'Mar (Forecast)', actual: null, forecast: 5200 }
    ],
    comparison: {
      current: [
        { month: 'Jul', revenue: 2800 },
        { month: 'Aug', revenue: 3200 },
        { month: 'Sep', revenue: 3500 },
        { month: 'Oct', revenue: 3800 },
        { month: 'Nov', revenue: 4100 },
        { month: 'Dec', revenue: 4300 }
      ],
      previous: [
        { month: 'Jul', revenue: 2200 },
        { month: 'Aug', revenue: 2600 },
        { month: 'Sep', revenue: 2900 },
        { month: 'Oct', revenue: 3100 },
        { month: 'Nov', revenue: 3500 },
        { month: 'Dec', revenue: 3900 }
      ]
    }
  };

  useEffect(() => {
    // Simulate API call
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // const response = await fetch(`/api/admin/payment-analytics?timeRange=${timeRange}`);
        // const data = await response.json();
        
        // For now, use mock data
        setTimeout(() => {
          setAnalyticsData(mockAnalyticsData);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
  };

  const getTimeRangeData = () => {
    switch (timeRange) {
      case 'daily':
        return mockAnalyticsData.dailyTrends;
      case 'weekly':
        return mockAnalyticsData.weeklyTrends;
      case 'yearly':
        return mockAnalyticsData.yearlyTrends;
      default:
        return mockAnalyticsData.trends;
    }
  };

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
          <div className="text-2xl font-bold text-gray-800">₵{analyticsData.summary.totalRevenue.toLocaleString()}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Previous Period</h3>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800">₵{analyticsData.summary.previousPeriodRevenue.toLocaleString()}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Avg Transaction</h3>
            <BarChart2 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800">₵{analyticsData.summary.averageTransaction.toFixed(2)}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{analyticsData.summary.successRate}%</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 col-span-1 md:col-span-2 xl:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Top Contributor</h3>
            <PieChartIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{analyticsData.summary.topUserType}</div>
          <div className="text-sm text-gray-500 mt-1">34% of total revenue</div>
        </div>
      </div>

      {/* Revenue Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {comparisonMode ? (
                <BarChart
                  data={analyticsData.comparison.current.map((item, index) => ({
                    name: item.month,
                    current: item.revenue,
                    previous: analyticsData.comparison.previous[index]?.revenue || 0
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `₵${value}`}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="current" name="Current Period" fill="#3b82f6" />
                  <Bar dataKey="previous" name="Previous Period" fill="#93c5fd" />
                </BarChart>
              ) : (
                <AreaChart
                  data={getTimeRangeData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={getXAxisKey()} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₵${value}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Distribution by User Type</h2>
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
        
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Growth by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData.userGrowth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Job Seekers" stroke="#3b82f6" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Employers" stroke="#10b981" />
                <Line type="monotone" dataKey="Trainers" stroke="#f59e0b" />
                <Line type="monotone" dataKey="Trainees" stroke="#6366f1" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Forecast</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData.forecast}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => value ? `₵${value}` : 'N/A'} />
              <Legend />
              <Line type="monotone" dataKey="actual" name="Actual Revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="forecast" name="Forecasted Revenue" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Forecast based on historical data and seasonal trends. Forecast shows projected revenue for the next 3 months.</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AnalyticsPage; 