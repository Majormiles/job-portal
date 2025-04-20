import React from 'react';
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
  // Revenue chart configuration
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
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
            return '$' + value;
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

  // Sample recent payments data
  const recentPayments = [
    {
      id: '#1234',
      name: 'John Doe',
      amount: '250.00',
      status: 'COMPLETED',
      date: 'March 15, 2024'
    },
    {
      id: '#1235',
      name: 'Jane Smith',
      amount: '180.00',
      status: 'PENDING',
      date: 'March 14, 2024'
    },
    {
      id: '#1236',
      name: 'Mike Johnson',
      amount: '320.00',
      status: 'COMPLETED',
      date: 'March 13, 2024'
    }
  ];

  // Payment categories summary data
  const paymentCategorySummary = [
    {
      name: 'Job Seekers',
      count: 124,
      revenue: 6200,
      icon: Users,
      color: 'blue',
      growth: '+12%'
    },
    {
      name: 'Employers',
      count: 57,
      revenue: 5700,
      icon: Briefcase,
      color: 'green',
      growth: '+8%'
    },
    {
      name: 'Trainers',
      count: 18,
      revenue: 1800,
      icon: FileText,
      color: 'amber',
      growth: '+5%'
    },
    {
      name: 'Trainees',
      count: 89,
      revenue: 4450,
      icon: CreditCard,
      color: 'indigo',
      growth: '+15%'
    }
  ];

  return (
    <div className="section-body">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of your business metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Jobs */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Briefcase className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Jobs</p>
            <h2 className="text-2xl font-bold">1,234</h2>
          </div>
        </div>

        {/* Active Applications */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FileText className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Applications</p>
            <h2 className="text-2xl font-bold">456</h2>
          </div>
        </div>

        {/* Total Candidates */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Users className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Candidates</p>
            <h2 className="text-2xl font-bold">789</h2>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center hover:shadow-lg transition-shadow">
          <div className="bg-yellow-100 p-3 rounded-full mr-4">
            <DollarSign className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h2 className="text-2xl font-bold">₵18,150</h2>
          </div>
        </div>
      </div>

      {/* Payment Summary Section */}
      <div className="bg-white shadow-md rounded-lg mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Payment Portal Summary</h3>
          <Link to="/admin/payments" className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium">
            View Payment Portal <ArrowRight className="ml-1" size={16} />
          </Link>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentCategorySummary.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gray-500 text-sm">{category.name}</p>
                    <h3 className="text-xl font-bold text-gray-800">₵{category.revenue.toLocaleString()}</h3>
                  </div>
                  <div className={`bg-${category.color}-100 p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 text-${category.color}-600`} />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{category.count} users</span>
                  <span className="text-xs text-green-600">{category.growth}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t flex justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/payments/transactions" className="text-sm text-gray-600 hover:text-blue-600 flex items-center">
              <CreditCard className="h-4 w-4 mr-1" /> Transactions
            </Link>
            <Link to="/admin/payments/analytics" className="text-sm text-gray-600 hover:text-blue-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> Analytics
            </Link>
            <Link to="/admin/payments/reports" className="text-sm text-gray-600 hover:text-blue-600 flex items-center">
              <PieChart className="h-4 w-4 mr-1" /> Reports
            </Link>
          </div>
          <div className="text-sm text-gray-600">Total Revenue: <span className="font-semibold">₵18,150</span></div>
        </div>
      </div>

      {/* Revenue Overview and Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview (2/3 width) */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-lg mb-6">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <select className="text-sm text-gray-600 border rounded px-2 py-1">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="p-4" style={{ height: '350px' }}>
            <Line data={revenueData} options={revenueOptions} />
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white lg:col-span-2 shadow-md rounded-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Payments</h3>
            <Link to="/admin/payments/transactions" className="text-sm text-blue-500 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-sm border-b bg-gray-50">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{payment.id}</td>
                    <td className="p-3 text-sm">{payment.name}</td>
                    <td className="p-3 text-sm">₵{payment.amount}</td>
                    <td className="p-3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${payment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                        }
                      `}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Link to={`/admin/payments/transactions?id=${payment.id}`}>
                          <Eye className="text-gray-500 hover:text-blue-500 cursor-pointer" size={16} />
                        </Link>
                        <Edit className="text-gray-500 hover:text-green-500 cursor-pointer" size={16} />
                        <Trash2 className="text-gray-500 hover:text-red-500 cursor-pointer" size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;