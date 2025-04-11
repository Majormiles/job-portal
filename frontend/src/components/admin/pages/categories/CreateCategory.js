import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  X, 
  Plus, 
  Upload,
  HelpCircle,
  Check,
  Loader,
  AlertCircle,
  Image as ImageIcon,
  Trash,
  ListFilter
} from 'lucide-react';
import { createCategory, getCategoryById, updateCategory } from '../../../../services/categoryService';

const CreateCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    status: 'active',
    image: ''
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  
  // Predefined colors
  const colorPalette = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#6b7280', // Gray
    '#0ea5e9', // Sky
    '#d97706', // Amber
    '#0284c7', // Light Blue
  ];
  
  // Fetch category data if in edit mode
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!isEditMode) return;
      
      setFetchLoading(true);
      setApiError(null);
      
      try {
        const response = await getCategoryById(id);
        
        if (response.success && response.data) {
          const categoryData = response.data;
          
          // Set image preview if exists
          if (categoryData.image && categoryData.image.url) {
            setImagePreview(categoryData.image.url);
            console.log('Set image preview from URL:', categoryData.image.url);
          }
          
          setFormData(categoryData);
          setJobCount(categoryData.jobCount || 0);
          console.log('Loaded category data:', categoryData);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setApiError(error.message || 'Failed to load category data');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [id, isEditMode]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors for the field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Select color from palette
  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
    setColorPickerOpen(false);
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      setErrors(prev => ({
        ...prev,
        image: 'Please upload an image file (PNG, JPG, JPEG)'
      }));
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Image size should be less than 2MB'
      }));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      setUploadProgress(0);
    };
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    
    reader.onload = () => {
      // Process image before setting
      processImage(reader.result, file.type)
        .then(processedImage => {
          setImagePreview(processedImage);
          setFormData(prev => ({
            ...prev,
            image: processedImage
          }));
          setUploadProgress(100);
          
          // Estimate the size of the Base64 string
          const base64Size = Math.ceil((processedImage.length * 3) / 4);
          console.log('Final image size:', Math.round(base64Size / 1024), 'KB');
          
          // Clear error if exists
          if (errors.image) {
            setErrors(prev => ({
              ...prev,
              image: null
            }));
          }
        })
        .catch(error => {
          console.error('Error processing image:', error);
          setErrors(prev => ({
            ...prev,
            image: 'Error processing image. Please try again.'
          }));
        });
    };
    
    reader.readAsDataURL(file);
  };
  
  // Process image - resize if needed
  const processImage = (base64Image, mimeType) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Only resize if the image is too large
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Determine if resizing is needed
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round(width * (MAX_HEIGHT / height));
                height = MAX_HEIGHT;
              }
            }
            
            // Create canvas and resize image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert back to base64 with quality reduction if JPEG
            const quality = mimeType.includes('jpeg') ? 0.8 : 1;
            const resizedImage = canvas.toDataURL(mimeType, quality);
            
            console.log('Image resized:', `${img.width}x${img.height}`, '→', `${width}x${height}`);
            resolve(resizedImage);
          } else {
            // No resizing needed
            resolve(base64Image);
          }
        };
        
        img.onerror = (error) => {
          reject(error);
        };
        
        img.src = base64Image;
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Image is not required, but we'll validate it if provided
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setApiError(null);
    
    try {
      // Prepare data for submission
      const formDataToSubmit = { ...formData };

      // Special handling for image when editing
      if (isEditMode) {
        // If imagePreview is the same as the existing image URL
        if (imagePreview && formData.image?.url && imagePreview === formData.image.url) {
          console.log('Image unchanged - using existing image from server');
          // Keep the existing image object as is
        } else if (!imagePreview && formData.image) {
          // User wants to remove the image
          console.log('User wants to remove image');
          formDataToSubmit.image = null;
        } else if (!imagePreview && !formData.image) {
          // No image was set and none is being added
          console.log('No image set or being added');
          formDataToSubmit.image = null;
        }
        // Otherwise, the new image data will be sent (it's already in formData)
      }
      
      console.log('Form submission mode:', isEditMode ? 'Update' : 'Create');
      console.log('Image state:', formDataToSubmit.image ? 
                  (typeof formDataToSubmit.image === 'object' ? 'Object with URL' : 'Base64 string') : 
                  'None/null');
      
      let response;
      // Use appropriate API call based on mode
      if (isEditMode) {
        response = await updateCategory(id, formDataToSubmit);
      } else {
        response = await createCategory(formDataToSubmit);
      }
      
      if (response.success) {
        setSuccessMessage(isEditMode ? 'Category updated successfully!' : 'Category created successfully!');
        
        // Reset form if creating new category
        if (!isEditMode) {
          setFormData({
            name: '',
            description: '',
            color: '#3b82f6',
            featured: false,
            metaTitle: '',
            metaDescription: '',
            status: 'active',
            image: ''
          });
          setImagePreview('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
        
        // Navigate or clear success message after delay
        setTimeout(() => {
          setSuccessMessage('');
          // Navigate to categories list after creation
          if (!isEditMode) {
            navigate('/admin/categories');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setApiError(error.message || 'Failed to save category');
      
      // Handle specific errors
      if (error.fields) {
        setErrors(error.fields);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/admin/categories');
  };
  
  // If fetching data in edit mode
  if (fetchLoading) {
    return (
      <div className="section-body flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Loading category data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">
            {isEditMode ? 'Edit Category' : 'Create New Category'}
          </h1>
          <button
            onClick={() => navigate('/admin/categories')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Categories
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Main Content Area - 5 columns wide on medium screens and above */}
          <div className="md:col-span-5 bg-white p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                {/* Name Field */}
                <div className="col-span-full">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Description Field */}
                <div className="col-span-full">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full px-3 py-2 border ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter category description (optional)"
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* Image Upload Field */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image
                  </label>
                  <div className="mt-1 flex flex-col md:flex-row items-start gap-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0 w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={40} className="text-gray-400" />
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-grow flex flex-col">
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Upload size={16} className="mr-2" />
                          Upload Image
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                          >
                            <Trash size={16} className="mr-2" />
                            Remove
                          </button>
                        )}
                      </div>
                      
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2 w-full">
                          <div className="bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploading: {uploadProgress}%
                          </p>
                        </div>
                      )}

                      {errors.image && (
                        <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Recommended size: 800x600 pixels. Max file size: 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Sidebar - 2 columns wide on medium screens and above */}
          <div className="md:col-span-2 bg-white p-6 border-l border-gray-100">
            <div className="sticky top-6">
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  onClick={handleSubmit}
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
                      {isEditMode ? 'Update Category' : 'Create Category'}
                    </span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center transition-colors"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Cancel
                </button>
              </div>
              
              {isEditMode && (
                <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-3">Category Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 block">Job Count:</span>
                      <span className="text-sm font-medium">{jobCount || 0}</span>
                    </div>
                    
                    {jobCount > 0 && (
                      <div className="pt-2">
                        <Link
                          to={`/admin/jobs?category=${id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <ListFilter size={14} className="mr-1" />
                          View Jobs in this Category
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCategory; 