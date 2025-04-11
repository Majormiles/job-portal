import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award, 
  CheckCircle,
  User,
  Building,
  AlertCircle
} from 'lucide-react';
import { getJobById } from '../../../../services/jobService';
import { getCategoryById } from '../../../../services/categoryService';
import { formatDate, formatSalary } from '../../../../utils/formatters';

const ViewJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getJobById(id);
        
        if (response.success && response.data) {
          setJob(response.data);
          
          // Fetch category details if categoryId exists
          if (response.data.category) {
            fetchCategoryDetails(response.data.category);
          }
        } else {
          throw new Error(response.message || 'Failed to fetch job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);
  
  const fetchCategoryDetails = async (categoryId) => {
    try {
      const response = await getCategoryById(categoryId);
      if (response.success && response.data) {
        setCategory(response.data);
      }
    } catch (err) {
      console.error('Error fetching category details:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="ml-64 p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 p-4 rounded-md flex items-center mb-4">
          <AlertCircle className="text-red-500 mr-3" size={24} />
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/admin/jobs')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Jobs
        </button>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <p className="text-yellow-700">Job not found</p>
        </div>
        <button 
          onClick={() => navigate('/admin/jobs')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Jobs
        </button>
      </div>
    );
  }
  
  return (
    <div className="ml-64 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">
            Job Details
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/jobs')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Jobs
            </button>
            <Link
              to={`/admin/jobs/edit/${id}`}
              className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-sm font-medium rounded text-white bg-blue-500 hover:bg-blue-600"
            >
              <Edit size={16} className="mr-1" />
              Edit Job
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Title and Basic Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{job.title}</h2>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {category && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building size={16} className="mr-1 text-gray-400" />
                    <span>{category.name}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-1 text-gray-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-1 text-gray-400" />
                  <span className="capitalize">{job.type.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award size={16} className="mr-1 text-gray-400" />
                  <span className="capitalize">
                    {job.experience === 'entry' ? 'Entry Level' :
                     job.experience === 'mid' ? 'Mid Level' :
                     job.experience === 'senior' ? 'Senior Level' :
                     job.experience === 'lead' ? 'Lead / Principal' : 'Manager'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-1 text-gray-400" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <DollarSign size={20} className="mr-2 text-green-500" />
                <span className="text-lg font-semibold text-gray-700">
                  {formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}
                </span>
              </div>
              
              <div className="py-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  job.status === 'active' ? 'bg-green-100 text-green-800' : 
                  job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Job Description */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Description</h3>
              <div className="prose max-w-none text-gray-600">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
          
          {/* Requirements */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {job.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Responsibilities */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Sidebar (1 column) */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Benefits</h3>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Job Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Information</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Job ID:</span>
                  <span className="text-gray-700 font-medium">{job._id}</span>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Created:</span>
                  <span className="text-gray-700">{formatDate(job.createdAt)}</span>
                </div>
                
                {job.updatedAt && job.updatedAt !== job.createdAt && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Last Updated:</span>
                    <span className="text-gray-700">{formatDate(job.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJob; 