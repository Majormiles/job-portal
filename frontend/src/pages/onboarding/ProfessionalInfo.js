import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { useAuth } from '../../context/AuthContext';

function ProfessionalInfo() {
  const navigate = useNavigate();
  const { updateOnboardingStatus } = useAuth();
  const [formData, setFormData] = useState({
    currentTitle: '',
    yearsOfExperience: '',
    currentCompany: '',
    desiredTitle: '',
    desiredSalary: '',
    employmentType: '',
    workAuthorization: '',
    resume: null,
    coverLetter: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.currentTitle || !formData.employmentType || !formData.workAuthorization) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await updateOnboardingStatus('professionalInfo', {
        completed: true,
        data: formDataToSend
      });

      if (response.success) {
        navigate('/onboarding/skills');
      } else {
        setError('Failed to save professional information. Please try again.');
      }
    } catch (err) {
      console.error('Error saving professional info:', err);
      setError(err.response?.data?.message || 'Failed to save professional information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Professional Information</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Job Title</label>
            <input
              type="text"
              name="currentTitle"
              value={formData.currentTitle}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Company</label>
            <input
              type="text"
              name="currentCompany"
              value={formData.currentCompany}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Desired Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Desired Job Title</label>
            <input
              type="text"
              name="desiredTitle"
              value={formData.desiredTitle}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Desired Salary (GHS)</label>
            <input
              type="number"
              name="desiredSalary"
              value={formData.desiredSalary}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Employment Type</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select employment type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          {/* Work Authorization */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Authorization</label>
            <select
              name="workAuthorization"
              value={formData.workAuthorization}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select work authorization</option>
              <option value="ghana_citizen">Ghana Citizen</option>
              <option value="ghana_permanent_resident">Ghana Permanent Resident</option>
              <option value="ghana_work_permit">Ghana Work Permit</option>
              <option value="africa_citizen">Other African Country Citizen</option>
              <option value="africa_work_permit">Other African Country Work Permit</option>
            </select>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
            <input
              type="file"
              name="resume"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Cover Letter Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Letter (PDF)</label>
            <input
              type="file"
              name="coverLetter"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/onboarding/personal-info')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}

export default ProfessionalInfo; 