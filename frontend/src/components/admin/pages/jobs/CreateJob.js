import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useBeforeUnload } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createJob, getJobById, updateJob } from '../../../../services/jobService';
import { getCategories } from '../../../../services/categoryService';
import { uploadImage } from '../../../../services/uploadService';
import { PlusCircle, MinusCircle, AlertCircle, Save, ArrowLeft, Bold, Italic, List, ListOrdered, Link as LinkIcon, Image, Code, Loader } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Add custom CSS for the Quill editor
const quillStyles = `
  .ql-editor {
    min-height: 250px;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .ql-snow .ql-editor img {
    max-width: 100%;
    height: auto;
  }
`;

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image',
  'align', 'direction',
  'color', 'background'
];

const previewStyles = `
  .preview-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
    color: #333;
    line-height: 1.6;
    padding: 20px;
    overflow-y: auto;
  }
  
  .preview-container h1 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    color: #222;
  }
  
  .preview-container h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .preview-container h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.2rem;
    margin-bottom: 0.8rem;
    color: #444;
  }
  
  .preview-container p {
    margin-bottom: 1rem;
  }
  
  .preview-container ul, .preview-container ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .preview-container li {
    margin-bottom: 0.5rem;
  }
  
  .preview-container a {
    color: #2563eb;
    text-decoration: underline;
  }
  
  .preview-container blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    color: #6b7280;
    margin: 1.5rem 0;
    font-style: italic;
  }
  
  .preview-container img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 4px;
  }
  
  .preview-container pre {
    background-color: #f7fafc;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1rem 0;
  }
  
  .preview-container table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }
  
  .preview-container th, .preview-container td {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
    text-align: left;
  }
  
  .preview-container th {
    background-color: #f7fafc;
  }
`;

const CreateJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const quillRef = useRef(null);

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

  // State for image upload
  const [imageUploading, setImageUploading] = useState(false);

  // Add state for description preview
  const [showPreview, setShowPreview] = useState(false);

  // State for tracking form changes
  const [formChanged, setFormChanged] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);

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
          const formattedData = {
            ...jobData,
            description: jobData.description || '', // Ensure description is never null or undefined
            salary: {
              min: jobData.salary?.min || '',
              max: jobData.salary?.max || '',
              currency: jobData.salary?.currency || 'USD'
            },
            requirements: jobData.requirements?.length > 0 ? jobData.requirements : [''],
            responsibilities: jobData.responsibilities?.length > 0 ? jobData.responsibilities : [''],
            skills: jobData.skills?.length > 0 ? jobData.skills : [''],
            benefits: jobData.benefits?.length > 0 ? jobData.benefits : ['']
          };
          
          setFormData(formattedData);
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

  // Simple editor focus effect
  useEffect(() => {
    // Wait for the component to be fully mounted and not in loading state
    if (!fetchLoading && quillRef.current && !showPreview) {
      // Short timeout to ensure the editor is fully initialized
      setTimeout(() => {
        try {
          const editor = quillRef.current.getEditor();
          
          // Ensure there's content to work with
          if (editor.getLength() <= 1) { // Only has newline character
            editor.setText(" "); // Add a space
            editor.setSelection(0, 0); // Select at beginning
          } else {
            editor.setSelection(0, 0); // Select at beginning
          }
          
          editor.focus();
          
        } catch (error) {
          console.error('Error initializing editor:', error);
        }
      }, 300);
    }
  }, [fetchLoading, showPreview]);

  // Set up the initial form data for change detection
  useEffect(() => {
    if (!fetchLoading && (formData.title || formData.description)) {
      setInitialFormData(JSON.stringify(formData));
    }
  }, [fetchLoading, formData.title, formData.description]);

  // Handle form change detection
  useEffect(() => {
    if (initialFormData) {
      const currentFormData = JSON.stringify(formData);
      setFormChanged(currentFormData !== initialFormData);
    }
  }, [formData, initialFormData]);
  
  // Set up beforeunload event handler
  useBeforeUnload(
    useCallback(
      (event) => {
        if (formChanged) {
          event.preventDefault();
          return (event.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
        }
      },
      [formChanged]
    )
  );

  // Custom navigation function with confirmation
  const navigateWithConfirmation = (path) => {
    if (formChanged) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

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

  // Replace handleDescriptionChange with this more robust implementation
  const handleDescriptionChange = (content) => {
    // Prevent null/undefined values from being set
    const safeContent = content || '';
    
    console.log('Editor content changed. Length:', safeContent.length);
    
    // Update form data with the new content
    setFormData(prev => ({
      ...prev,
      description: safeContent
    }));
    
    // Clear any error for description
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
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
    
    // Description validation - check if it's empty or just contains HTML tags with no text
    const descriptionText = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!descriptionText) newErrors.description = 'Job description is required';
    
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
        setFormChanged(false);  // Reset form changed state after successful save
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

  // Helper function to upload images
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.onchange = () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Basic validation
        if (!file.type.match('image.*')) {
          toast.error('Please select an image file');
          return;
        }
        
        // Max file size: 5MB
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size should not exceed 5MB');
          return;
        }
        
        try {
          setImageUploading(true);
          
          const reader = new FileReader();
          reader.onload = () => {
            if (quillRef.current) {
              try {
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection() || { index: editor.getLength() };
                editor.insertEmbed(range.index, 'image', reader.result);
                editor.setSelection((range.index || 0) + 1);
              } catch (error) {
                console.error('Error inserting image:', error);
                toast.error('Failed to insert image. Please try again.');
              }
            } else {
              toast.error('Editor not initialized. Please try again.');
            }
            
            setImageUploading(false);
            toast.success('Image added successfully');
          };
          
          reader.onerror = () => {
            toast.error('Error processing image');
            setImageUploading(false);
          };
          
          reader.readAsDataURL(file);
          
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image. Please try again.');
          setImageUploading(false);
        }
      }
    };
    
    input.click();
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
    // Scroll back to the top of the description section when toggling
    setTimeout(() => {
      const descriptionSection = document.getElementById('description-section');
      if (descriptionSection) {
        descriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Custom modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: handleImageUpload
      }
    },
    clipboard: {
      matchVisual: false
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
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                {isEditMode ? 'Edit Job' : 'Create New Job'}
              </h1>
              {formChanged && (
                <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">
                  Unsaved changes
                </span>
              )}
            </div>
            <button
              onClick={() => navigateWithConfirmation('/admin/jobs')}
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
                  <div id="description-section" className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-base font-semibold text-gray-700 pb-2 border-b border-gray-100">Job Description</h2>
                      <button
                        type="button"
                        onClick={togglePreview}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 rounded-md text-sm font-medium flex items-center transition-colors"
                      >
                        {showPreview ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Mode
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Job Description*
                      </label>
                      
                      {showPreview ? (
                        <div className="border rounded-md p-4 bg-white min-h-[300px] shadow-inner overflow-auto">
                          <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
                          <div className="preview-container" dangerouslySetInnerHTML={{ __html: formData.description }} />
                        </div>
                      ) : (
                        <div className={`border rounded-md ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}>
                          <style dangerouslySetInnerHTML={{ __html: quillStyles }} />
                          <div className="relative min-h-[300px]">
                            {imageUploading && (
                              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                                <div className="flex items-center space-x-2">
                                  <Loader size={20} className="animate-spin text-blue-500" />
                                  <span>Uploading image...</span>
                                </div>
                              </div>
                            )}
                            <ReactQuill
                              key={`editor-${id || 'new'}-${Date.now()}`}
                              ref={quillRef}
                              theme="snow"
                              value={formData.description}
                              onChange={handleDescriptionChange}
                              modules={modules}
                              formats={formats}
                              placeholder="Enter a detailed job description..."
                            />
                          </div>
                        </div>
                      )}
                      
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-500 error-message">{errors.description}</p>
                      )}
                      
                      <div className={`mt-8 text-sm text-gray-600 ${showPreview ? 'hidden' : 'block'} bg-blue-50 p-3 rounded border border-blue-100`}>
                        <h4 className="font-medium mb-1">Formatting Tips:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Use headings to organize your content</li>
                          <li>Highlight important information with <strong>bold</strong> or <em>italic</em> text</li>
                          <li>Create bullet points or numbered lists for requirements and responsibilities</li>
                          <li>Add links to relevant resources or application instructions</li>
                          <li>Keep paragraphs short and focused for better readability</li>
                          <li>Click the 'Preview' button to see how your description will look</li>
                        </ul>
                      </div>
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
              <div className="bg-white p-6 shadow-sm rounded-lg h-fit lg:sticky lg:top-6">
                <h2 className="text-base font-semibold mb-4 text-gray-700">Actions</h2>
                
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Status
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
                    <p className="mt-1 text-xs text-gray-500">
                      Only active jobs are visible to applicants
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none flex justify-center items-center"
                    >
                      {loading ? (
                        <>
                          <Loader size={16} className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          {isEditMode ? 'Update Job' : 'Create Job'}
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => navigateWithConfirmation('/admin/jobs')}
                      className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none flex justify-center items-center"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                  
                  {formChanged && (
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md flex items-center text-yellow-800 text-sm">
                      <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                      <span>You have unsaved changes</span>
                    </div>
                  )}
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