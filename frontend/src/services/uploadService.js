import api from '../utils/api';

/**
 * Upload an image to the server
 * @param {File} file - The image file to upload
 * @returns {Promise} - The API response with the image URL
 */
export const uploadImage = async (file) => {
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await api.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload image' };
  }
};

/**
 * Delete an image from the server
 * @param {string} imageId - The ID of the image to delete
 * @returns {Promise} - The API response
 */
export const deleteImage = async (imageId) => {
  try {
    const response = await api.delete(`/uploads/images/${imageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete image' };
  }
};

export default {
  uploadImage,
  deleteImage
}; 