import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createJob, getJobById, updateJob } from '../../../../services/jobService';
import { getCategories } from '../../../../services/categoryService';
import { PlusCircle, MinusCircle, AlertCircle, Save, ArrowLeft } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: '',
    type: 'full-time',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    experience: 'entry',
    skills: [''],
    benefits: [''],
    category: '',
    status: 'active'
  });

  // State for loading states
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories');
      }
    };
    
    loadCategories();
  }, []);

  // Fetch job data if in edit mode
  useEffect(() => {
    const fetchJobData = async () => {
      if (!isEditMode) return;
      
      setFetchLoading(true);
      
      try {
        const response = await getJobById(id);
        
        if (response.success && response.data) {
          const jobData = response.data;
          
          // Format the data to match our form structure
          setFormData({
            ...jobData,
            salary: {
              min: jobData.salary?.min || '',
              max: jobData.salary?.max || '',
              currency: jobData.salary?.currency || 'USD'
            },
            requirements: jobData.requirements?.length > 0 ? jobData.requirements : [''],
            responsibilities: jobData.responsibilities?.length > 0 ? jobData.responsibilities : [''],
            skills: jobData.skills?.length > 0 ? jobData.skills : [''],
            benefits: jobData.benefits?.length > 0 ? jobData.benefits : ['']
          });
        }
      } catch (error) {
        console.error('Error fetching job data:', error);
        toast.error(error.message || 'Failed to fetch job data');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchJobData();
  }, [id, isEditMode]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like salary.min
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle array field changes (requirements, responsibilities, skills, benefits)
  const handleArrayChange = (e, index, fieldName) => {
    const { value } = e.target;
    const newArray = [...formData[fieldName]];
    newArray[index] = value;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: newArray
    }));
    
    // Clear any error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Add a new item to an array field
  const addArrayItem = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  // Remove an item from an array field
  const removeArrayItem = (index, fieldName) => {
    const newArray = [...formData[fieldName]];
    newArray.splice(index, 1);
    
    // Ensure at least one empty field remains
    if (newArray.length === 0) {
      newArray.push('');
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: newArray
    }));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    // Required single fields
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.location.trim()) newErrors.location = 'Job location is required';
    if (!formData.category) newErrors.category = 'Job category is required';
    
    // Salary validation
    if (!formData.salary.min) {
      newErrors['salary.min'] = 'Minimum salary is required';
    } else if (isNaN(formData.salary.min)) {
      newErrors['salary.min'] = 'Minimum salary must be a number';
    }
    
    if (!formData.salary.max) {
      newErrors['salary.max'] = 'Maximum salary is required';
    } else if (isNaN(formData.salary.max)) {
      newErrors['salary.max'] = 'Maximum salary must be a number';
    } else if (Number(formData.salary.min) > Number(formData.salary.max)) {
      newErrors['salary.max'] = 'Maximum salary must be greater than minimum salary';
    }
    
    // Array fields
    ['requirements', 'responsibilities', 'skills', 'benefits'].forEach(field => {
      // Filter out empty entries for validation
      const nonEmptyItems = formData[field].filter(item => item.trim());
      if (nonEmptyItems.length === 0) {
        newErrors[field] = `At least one ${field.slice(0, -1)} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    
    try {
      // Clean up the form data - filter out empty array entries
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        responsibilities: formData.responsibilities.filter(resp => resp.trim()),
        skills: formData.skills.filter(skill => skill.trim()),
        benefits: formData.benefits.filter(benefit => benefit.trim()),
        salary: {
          min: Number(formData.salary.min),
          max: Number(formData.salary.max),
          currency: formData.salary.currency
        }
      };
      
      // Convert empty strings to appropriate default values
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') {
          if (typeof formData[key] === 'number') {
            cleanedData[key] = 0;
          }
        }
      });
      
      let response;
      
      if (isEditMode) {
        response = await updateJob(id, cleanedData);
      } else {
        response = await createJob(cleanedData);
      }
      
      if (response.success) {
        toast.success(isEditMode ? 'Job updated successfully' : 'Job created successfully');
        navigate('/admin/jobs');
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(error.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="ml-64 p-6">
        <div className="bg-white rounded-lg shadow p-4 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">
              {isEditMode ? 'Edit Job' : 'Create New Job'}
            </h1>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Jobs
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content Area - 3 columns wide on large screens */}
              <div className="lg:col-span-3 bg-white p-6">
                <div className="space-y-5">
                  {/* Basic Info Section */}
                  <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <h2 className="text-base font-semibold mb-3 text-gray-700 pb-2 border-b border-gray-100">Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Job Title */}
                      <div className="col-span-full">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title*
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.title ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring focus:ring-blue-200`}
                          placeholder="e.g. Senior Software Engineer"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-500 error-message">{errors.title}</p>
                        )}
                      </div>
                      
                      {/* Job Category */}
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category*
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.category ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring focus:ring-blue-200`}
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-500 error-message">{errors.category}</p>
                        )}
                      </div>
                      
                      {/* Job Type */}
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Job Type*
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                      
                      {/* Experience Level */}
                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                          Experience Level*
                        </label>
                        <select
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        >
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid Level</option>
                          <option value="senior">Senior Level</option>
                          <option value="lead">Lead / Principal</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>
                      
                      {/* Job Location */}
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location*
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring focus:ring-blue-200`}
                          placeholder="e.g. New York, NY or Remote"
                        />
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-500 error-message">{errors.location}</p>
                        )}
                      </div>
                      
                      {/* Job Status */}
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Salary Section */}
                  <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <h2 className="text-base font-semibold mb-3 text-gray-700 pb-2 border-b border-gray-100">Salary Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Min Salary */}
                      <div>
                        <label htmlFor="salary.min" className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Salary*
                        </label>
                        <input
                          type="text"
                          id="salary.min"
                          name="salary.min"
                          value={formData.salary.min}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors['salary.min'] ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring focus:ring-blue-200`}
                          placeholder="e.g. 50000"
                        />
                        {errors['salary.min'] && (
                          <p className="mt-1 text-sm text-red-500 error-message">{errors['salary.min']}</p>
                        )}
                      </div>
                      
                      {/* Max Salary */}
                      <div>
                        <label htmlFor="salary.max" className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Salary*
                        </label>
                        <input
                          type="text"
                          id="salary.max"
                          name="salary.max"
                          value={formData.salary.max}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors['salary.max'] ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring focus:ring-blue-200`}
                          placeholder="e.g. 70000"
                        />
                        {errors['salary.max'] && (
                          <p className="mt-1 text-sm text-red-500 error-message">{errors['salary.max']}</p>
                        )}
                      </div>
                      
                      {/* Currency */}
                      <div>
                        <label htmlFor="salary.currency" className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          id="salary.currency"
                          name="salary.currency"
                          value={formData.salary.currency}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="GHS">GHS - Ghanaian Cedi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description Section */}
                  <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <h2 className="text-base font-semibold mb-3 text-gray-700 pb-2 border-b border-gray-100">Job Description</h2>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Job Description*
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring focus:ring-blue-200`}
                        placeholder="Enter a detailed job description..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-500 error-message">{errors.description}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Provide a comprehensive description of the job role, responsibilities, and any other relevant information.
                      </p>
                    </div>
                  </div>
                  
                  {/* Requirements Section */}
                  <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-base font-semibold text-gray-700 pb-2 border-b border-gray-100 w-full">Job Requirements*</h2>
                      <button
                        type="button"
                        onClick={() => addArrayItem('requirements')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 ml-2 whitespace-nowrap"
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Add
                      </button>
                    </div>
                    
                    {errors.requirements && (
                      <div className="mb-4 flex items-center px-3 py-2 bg-red-50 text-red-800 rounded-md">
                        <AlertCircle size={16} className="mr-2" />
                        <p className="text-sm error-message">{errors.requirements}</p>
                      </div>
                    )}
                    
                    {formData.requirements.map((requirement, index) => (
                      <div key={`req-${index}`} className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleArrayChange(e, index, 'requirements')}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                          placeholder="e.g. Bachelor's degree in Computer Science or related field"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'requirements')}
                          className={`text-red-500 hover:text-red-700 ${formData.requirements.length === 1 ? 'invisible' : ''}`}
                          disabled={formData.requirements.length === 1}
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Responsibilities Section */}
                  <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-base font-semibold text-gray-700 pb-2 border-b border-gray-100 w-full">Job Responsibilities*</h2>
                      <button
                        type="button"
                        onClick={() => addArrayItem('responsibilities')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 ml-2 whitespace-nowrap"
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Add
                      </button>
                    </div>
                    
                    {errors.responsibilities && (
                      <div className="mb-4 flex items-center px-3 py-2 bg-red-50 text-red-800 rounded-md">
                        <AlertCircle size={16} className="mr-2" />
                        <p className="text-sm error-message">{errors.responsibilities}</p>
                      </div>
                    )}
                    
                    {formData.responsibilities.map((responsibility, index) => (
                      <div key={`resp-${index}`} className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={responsibility}
                          onChange={(e) => handleArrayChange(e, index, 'responsibilities')}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                          placeholder="e.g. Design and develop web applications"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'responsibilities')}
                          className={`text-red-500 hover:text-red-700 ${formData.responsibilities.length === 1 ? 'invisible' : ''}`}
                          disabled={formData.responsibilities.length === 1}
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Skills Section */}
                  <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-base font-semibold text-gray-700 pb-2 border-b border-gray-100 w-full">Required Skills*</h2>
                      <button
                        type="button"
                        onClick={() => addArrayItem('skills')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 ml-2 whitespace-nowrap"
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Add
                      </button>
                    </div>
                    
                    {errors.skills && (
                      <div className="mb-4 flex items-center px-3 py-2 bg-red-50 text-red-800 rounded-md">
                        <AlertCircle size={16} className="mr-2" />
                        <p className="text-sm error-message">{errors.skills}</p>
                      </div>
                    )}
                    
                    {formData.skills.map((skill, index) => (
                      <div key={`skill-${index}`} className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleArrayChange(e, index, 'skills')}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                          placeholder="e.g. JavaScript"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'skills')}
                          className={`text-red-500 hover:text-red-700 ${formData.skills.length === 1 ? 'invisible' : ''}`}
                          disabled={formData.skills.length === 1}
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Benefits Section */}
                  <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-base font-semibold text-gray-700 pb-2 border-b border-gray-100 w-full">Job Benefits*</h2>
                      <button
                        type="button"
                        onClick={() => addArrayItem('benefits')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 ml-2 whitespace-nowrap"
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Add
                      </button>
                    </div>
                    
                    {errors.benefits && (
                      <div className="mb-4 flex items-center px-3 py-2 bg-red-50 text-red-800 rounded-md">
                        <AlertCircle size={16} className="mr-2" />
                        <p className="text-sm error-message">{errors.benefits}</p>
                      </div>
                    )}
                    
                    {formData.benefits.map((benefit, index) => (
                      <div key={`benefit-${index}`} className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => handleArrayChange(e, index, 'benefits')}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                          placeholder="e.g. Health insurance"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'benefits')}
                          className={`text-red-500 hover:text-red-700 ${formData.benefits.length === 1 ? 'invisible' : ''}`}
                          disabled={formData.benefits.length === 1}
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sidebar - 1 column wide on large screens */}
              <div className="lg:col-span-1 bg-white p-6 border-l border-gray-100">
                <div className="sticky top-6">
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save size={18} className="mr-2" />
                          {isEditMode ? 'Update Job' : 'Create Job'}
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => navigate('/admin/jobs')}
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center transition-colors"
                    >
                      <ArrowLeft size={18} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                  
                  {/* Job Status Panel */}
                  <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3">Job Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500 block">Status:</span>
                        <span className={`text-sm font-medium ${
                          formData.status === 'active' ? 'text-green-600' : 
                          formData.status === 'draft' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {formData.status === 'active' ? 'Active' : 
                           formData.status === 'draft' ? 'Draft' : 'Closed'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500 block">Type:</span>
                        <span className="text-sm font-medium capitalize">
                          {formData.type.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500 block">Experience:</span>
                        <span className="text-sm font-medium capitalize">
                          {formData.experience === 'entry' ? 'Entry Level' :
                           formData.experience === 'mid' ? 'Mid Level' :
                           formData.experience === 'senior' ? 'Senior Level' :
                           formData.experience === 'lead' ? 'Lead / Principal' : 'Manager'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateJob; 