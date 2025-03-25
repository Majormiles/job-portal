import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { useAuth } from '../../context/AuthContext';

function Preferences() {
  const navigate = useNavigate();
  const { updateOnboardingStatus } = useAuth();
  const [formData, setFormData] = useState({
    jobPreferences: {
      remoteWork: false,
      hybridWork: false,
      onsiteWork: false,
      flexibleHours: false,
      fixedHours: false
    },
    industryPreferences: [],
    companySize: '',
    workCulture: [],
    benefits: [],
    availability: {
      startDate: '',
      noticePeriod: '',
      hoursPerWeek: ''
    }
  });
  const [newIndustry, setNewIndustry] = useState('');
  const [newCulture, setNewCulture] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        [name]: checked
      }
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [name]: value
      }
    }));
  };

  const handleAddIndustry = () => {
    if (newIndustry.trim()) {
      setFormData(prev => ({
        ...prev,
        industryPreferences: [...prev.industryPreferences, newIndustry.trim()]
      }));
      setNewIndustry('');
    }
  };

  const handleRemoveIndustry = (index) => {
    setFormData(prev => ({
      ...prev,
      industryPreferences: prev.industryPreferences.filter((_, i) => i !== index)
    }));
  };

  const handleAddCulture = () => {
    if (newCulture.trim()) {
      setFormData(prev => ({
        ...prev,
        workCulture: [...prev.workCulture, newCulture.trim()]
      }));
      setNewCulture('');
    }
  };

  const handleRemoveCulture = (index) => {
    setFormData(prev => ({
      ...prev,
      workCulture: prev.workCulture.filter((_, i) => i !== index)
    }));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.availability.startDate || !formData.availability.hoursPerWeek) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const response = await updateOnboardingStatus('preferences', {
        completed: true,
        data: formData
      });

      if (response.success) {
        navigate('/onboarding/complete');
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      if (err.message === 'No authentication token found' || err.response?.status === 401) {
        // Authentication error - redirect to login
        navigate('/login', { 
          state: { 
            from: '/onboarding/preferences',
            message: 'Please log in to continue with your preferences setup.'
          },
          replace: true // Replace the current history entry
        });
      } else {
        setError(err.response?.data?.message || 'Failed to save preferences. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Job Preferences</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work Arrangement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remoteWork"
                  checked={formData.jobPreferences.remoteWork}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Remote Work</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hybridWork"
                  checked={formData.jobPreferences.hybridWork}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Hybrid Work</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="onsiteWork"
                  checked={formData.jobPreferences.onsiteWork}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">On-site Work</span>
              </label>
            </div>
          </div>

          {/* Work Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Schedule</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="flexibleHours"
                  checked={formData.jobPreferences.flexibleHours}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Flexible Hours</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="fixedHours"
                  checked={formData.jobPreferences.fixedHours}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Fixed Hours</span>
              </label>
            </div>
          </div>

          {/* Industry Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry Preferences</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                placeholder="e.g., Technology, Healthcare"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddIndustry}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.industryPreferences.map((industry, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {industry}
                  <button
                    type="button"
                    onClick={() => handleRemoveIndustry(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Company Size</label>
            <select
              value={formData.companySize}
              onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          {/* Work Culture */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Culture</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={newCulture}
                onChange={(e) => setNewCulture(e.target.value)}
                placeholder="e.g., Collaborative, Innovative"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCulture}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.workCulture.map((culture, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {culture}
                  <button
                    type="button"
                    onClick={() => handleRemoveCulture(index)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Desired Benefits</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="e.g., Health Insurance, Paid Leave"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                >
                  {benefit}
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(index)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Earliest Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.availability.startDate}
                onChange={handleAvailabilityChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notice Period (days)</label>
              <input
                type="number"
                name="noticePeriod"
                value={formData.availability.noticePeriod}
                onChange={handleAvailabilityChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Hours per Week</label>
              <input
                type="number"
                name="hoursPerWeek"
                value={formData.availability.hoursPerWeek}
                onChange={handleAvailabilityChange}
                required
                min="1"
                max="168"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/onboarding/skills')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}

export default Preferences; 