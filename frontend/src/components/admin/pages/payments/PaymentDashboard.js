import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Users, FileText, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../css/payment-portal.css';

const PaymentDashboard = () => {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    jobSeekers: { count: 0, revenue: 0 },
    employers: { count: 0, revenue: 0 },
    trainers: { count: 0, revenue: 0 },
    trainees: { count: 0, revenue: 0 },
    totalRevenue: 0
  });

  // Mock data for development purposes
  const mockStats = {
    jobSeekers: { count: 124, revenue: 6200 },
    employers: { count: 57, revenue: 5700 },
    trainers: { count: 18, revenue: 1800 },
    trainees: { count: 89, revenue: 4450 },
    totalRevenue: 18150
  };

  // Mock data for charts
  const pieChartData = [
    { name: 'Job Seekers', value: 6200, color: '#3b82f6' },
    { name: 'Employers', value: 5700, color: '#10b981' },
    { name: 'Trainers', value: 1800, color: '#f59e0b' },
    { name: 'Trainees', value: 4450, color: '#6366f1' }
  ];

  const barChartData = [
    { name: 'Jan', 'Job Seekers': 800, 'Employers': 400, 'Trainers': 200, 'Trainees': 500 },
    { name: 'Feb', 'Job Seekers': 300, 'Employers': 700, 'Trainers': 100, 'Trainees': 400 },
    { name: 'Mar', 'Job Seekers': 500, 'Employers': 900, 'Trainers': 300, 'Trainees': 600 },
    { name: 'Apr', 'Job Seekers': 700, 'Employers': 500, 'Trainers': 200, 'Trainees': 400 },
    { name: 'May', 'Job Seekers': 900, 'Employers': 800, 'Trainers': 300, 'Trainees': 700 },
    { name: 'Jun', 'Job Seekers': 1100, 'Employers': 600, 'Trainers': 200, 'Trainees': 500 },
  ];

  useEffect(() => {
    // Simulate API call to fetch data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // const response = await fetch('/api/admin/payment-stats?timeFilter=' + timeFilter);
        // const data = await response.json();
        
        // For now, use mock data
        setTimeout(() => {
          setStats(mockStats);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching payment stats:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]);

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
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
        <h1 className="text-2xl font-bold text-gray-800">Payment Dashboard</h1>
        <p className="text-gray-500">Monitor all payment activities and revenue streams</p>
      </div>

      {/* Time filter tabs */}
      <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm border space-x-1 w-fit">
        <button 
          className={`px-4 py-2 text-sm rounded-md transition-colors ${timeFilter === 'daily' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => handleFilterChange('daily')}
        >
          Daily
        </button>
        <button 
          className={`px-4 py-2 text-sm rounded-md transition-colors ${timeFilter === 'weekly' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => handleFilterChange('weekly')}
        >
          Weekly
        </button>
        <button 
          className={`px-4 py-2 text-sm rounded-md transition-colors ${timeFilter === 'monthly' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => handleFilterChange('monthly')}
        >
          Monthly
        </button>
        <button 
          className={`px-4 py-2 text-sm rounded-md transition-colors ${timeFilter === 'yearly' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => handleFilterChange('yearly')}
        >
          Yearly
        </button>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md text-white p-6 col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-between payment-card">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
            <h3 className="text-3xl font-bold mt-1">₵{stats.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="flex items-center justify-between mt-4">
            <DollarSign className="h-8 w-8 text-blue-200" />
            <Link to="/admin/payments/analytics" className="text-blue-100 text-sm flex items-center hover:text-white">
              View Details <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Category Cards */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between border border-gray-100 payment-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Job Seekers</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">₵{stats.jobSeekers.revenue.toLocaleString()}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-sm text-gray-500">{stats.jobSeekers.count} users</p>
            <p className="text-xs text-gray-400">₵50 per user</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between border border-gray-100 payment-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Employers</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">₵{stats.employers.revenue.toLocaleString()}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-sm text-gray-500">{stats.employers.count} users</p>
            <p className="text-xs text-gray-400">₵100 per user</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between border border-gray-100 payment-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Trainers</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">₵{stats.trainers.revenue.toLocaleString()}</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-sm text-gray-500">{stats.trainers.count} users</p>
            <p className="text-xs text-gray-400">₵100 per user</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between border border-gray-100 payment-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Trainees</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">₵{stats.trainees.revenue.toLocaleString()}</h3>
            </div>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-sm text-gray-500">{stats.trainees.count} users</p>
            <p className="text-xs text-gray-400">₵50 per user</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 payment-card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={4}
                  dataKey="value"
                  label={({name, value, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₵${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 payment-card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
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
                <Bar dataKey="Job Seekers" fill="#3b82f6" />
                <Bar dataKey="Employers" fill="#10b981" />
                <Bar dataKey="Trainers" fill="#f59e0b" />
                <Bar dataKey="Trainees" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/admin/payments/transactions" 
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all payment-card"
        >
          <div className="bg-blue-50 p-3 rounded-lg inline-block mb-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Transactions</h3>
          <p className="text-gray-500 text-sm">View all payment transactions with detailed information and export options.</p>
        </Link>

        <Link 
          to="/admin/payments/analytics" 
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all payment-card"
        >
          <div className="bg-green-50 p-3 rounded-lg inline-block mb-3">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
          <p className="text-gray-500 text-sm">Detailed analytics on payment patterns, trends, and forecasting.</p>
        </Link>

        <Link 
          to="/admin/payments/reports" 
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all payment-card"
        >
          <div className="bg-amber-50 p-3 rounded-lg inline-block mb-3">
            <Calendar className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Reports</h3>
          <p className="text-gray-500 text-sm">Generate custom reports and summaries for financial analysis.</p>
        </Link>
      </div>
    </div>
    </div>
  );
};

export default PaymentDashboard; 