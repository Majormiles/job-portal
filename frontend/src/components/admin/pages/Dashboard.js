import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Users, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  ArrowRight, 
  CreditCard,
  PieChart, 
  TrendingUp
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchPaymentStats, fetchTransactions, formatDate, getStatusColorClasses } from '../pages/payments/actions';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    jobSeekers: { count: 0, revenue: 0 },
    employers: { count: 0, revenue: 0 },
    trainers: { count: 0, revenue: 0 },
    trainees: { count: 0, revenue: 0 },
    totalRevenue: 0,
    resumeUploads: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch payment stats
        const paymentStats = await fetchPaymentStats('monthly');
        
        // Fetch recent transactions
        const transactionsData = await fetchTransactions({}, 1, 5); // Limit to 5 recent transactions
        
        console.log('Transactions data:', transactionsData);
        
        // Set the stats data, including a mock number for resume uploads
        setStats({
          ...paymentStats,
          resumeUploads: paymentStats.jobSeekers.count * 0.8 // Assuming 80% of job seekers uploaded resumes
        });
        
        // Set recent payments
        setRecentPayments(transactionsData.transactions || []);
        
        // Debug: check structure of transaction objects
        if (transactionsData.transactions && transactionsData.transactions.length > 0) {
          console.log('First transaction object:', transactionsData.transactions[0]);
          console.log('Transaction ID property:', transactionsData.transactions[0]._id || transactionsData.transactions[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard statistics");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Revenue chart configuration based on real data
  const revenueData = {
    labels: ['Job Seekers', 'Employers', 'Trainers', 'Trainees'],
    datasets: [
      {
        label: 'Revenue',
        data: [
          stats.jobSeekers.revenue,
          stats.employers.revenue,
          stats.trainers.revenue,
          stats.trainees.revenue
        ],
        borderColor: '#3b82f6',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }
    ]
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
          color: '#f3f4f6'
        },
        ticks: {
          callback: function(value) {
            return '₵' + value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Payment categories summary data based on fetched stats
  const paymentCategorySummary = [
    {
      name: 'Job Seekers',
      count: stats.jobSeekers.count,
      revenue: stats.jobSeekers.revenue,
      icon: Users,
      color: 'blue',
      growth: '+12%'
    },
    {
      name: 'Employers',
      count: stats.employers.count,
      revenue: stats.employers.revenue,
      icon: Briefcase,
      color: 'green',
      growth: '+8%'
    },
    {
      name: 'Trainers',
      count: stats.trainers.count,
      revenue: stats.trainers.revenue,
      icon: FileText,
      color: 'amber',
      growth: '+5%'
    },
    {
      name: 'Trainees',
      count: stats.trainees.count,
      revenue: stats.trainees.revenue,
      icon: CreditCard,
      color: 'indigo',
      growth: '+15%'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="section-body">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of your business metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Job Seekers */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Users className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Job Seekers</p>
            <h2 className="text-2xl font-bold">{stats.jobSeekers.count.toLocaleString()}</h2>
          </div>
        </div>

        {/* Resume Uploads */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FileText className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Resume Uploads</p>
            <h2 className="text-2xl font-bold">{stats.resumeUploads.toLocaleString()}</h2>
          </div>
        </div>

        {/* Employers */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-amber-100 p-3 rounded-full mr-4">
            <Briefcase className="text-amber-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Employers</p>
            <h2 className="text-2xl font-bold">{stats.employers.count.toLocaleString()}</h2>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <DollarSign className="text-indigo-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h2 className="text-2xl font-bold">₵{stats.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Payment categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Payment Categories</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {paymentCategorySummary.map((category, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`bg-${category.color}-100 p-2 rounded-lg mr-3`}>
                    <category.icon className={`text-${category.color}-500`} size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">₵{category.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div>
              <Link to="/admin/payments" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                View all transactions
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="text-sm text-gray-600">Total Revenue: <span className="font-semibold">₵{stats.totalRevenue.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Revenue by Category</h2>
          </div>
          <div className="p-4 h-80">
            <Line data={revenueData} options={revenueOptions} />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
          <Link to="/admin/payments" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <tr key={payment._id || payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.reference || payment._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.user?.name || payment.email || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₵{payment.amount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClasses(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date ? formatDate(payment.date) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {(payment._id || payment.id) ? (
                          <Link to={`/admin/payments/transactions/${payment._id || payment.id}`} className="text-blue-600 hover:text-blue-900">
                            <Eye size={16} />
                          </Link>
                        ) : (
                          <span className="text-gray-400 cursor-not-allowed">
                            <Eye size={16} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading payment data...' : 'No recent payments found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;