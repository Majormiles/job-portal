import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';

function Preferences() {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        jobPreferences: {
          ...prev.jobPreferences,
          [name]: checked
        }
      }));
    } else if (name.startsWith('availability.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultiSelect = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically save the data to your backend
    console.log('Preferences:', formData);
    navigate('/onboarding/complete');
  };

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Job Preferences</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Work Arrangement */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Work Arrangement</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remoteWork"
                  checked={formData.jobPreferences.remoteWork}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Remote Work</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hybridWork"
                  checked={formData.jobPreferences.hybridWork}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Hybrid Work</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="onsiteWork"
                  checked={formData.jobPreferences.onsiteWork}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">On-site Work</span>
              </label>
            </div>
          </div>

          {/* Work Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Work Schedule</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="flexibleHours"
                  checked={formData.jobPreferences.flexibleHours}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Flexible Hours</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="fixedHours"
                  checked={formData.jobPreferences.fixedHours}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Fixed Hours</span>
              </label>
            </div>
          </div>

          {/* Industry Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Industry Preferences</h3>
            <div className="space-y-2">
              {['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail'].map(industry => (
                <label key={industry} className="flex items-center">
                  <input
                    type="checkbox"
                    name="industryPreferences"
                    value={industry}
                    checked={formData.industryPreferences.includes(industry)}
                    onChange={handleMultiSelect}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Company Size */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Preferred Company Size</h3>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Work Culture Preferences</h3>
            <div className="space-y-2">
              {['Fast-paced', 'Collaborative', 'Innovative', 'Traditional', 'Startup-like'].map(culture => (
                <label key={culture} className="flex items-center">
                  <input
                    type="checkbox"
                    name="workCulture"
                    value={culture}
                    checked={formData.workCulture.includes(culture)}
                    onChange={handleMultiSelect}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{culture}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Desired Benefits</h3>
            <div className="space-y-2">
              {['Health Insurance', 'Dental Insurance', '401(k)', 'Paid Time Off', 'Professional Development', 'Remote Work Allowance'].map(benefit => (
                <label key={benefit} className="flex items-center">
                  <input
                    type="checkbox"
                    name="benefits"
                    value={benefit}
                    checked={formData.benefits.includes(benefit)}
                    onChange={handleMultiSelect}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{benefit}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="availability.startDate"
                  value={formData.availability.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notice Period (weeks)</label>
                <input
                  type="number"
                  name="availability.noticePeriod"
                  value={formData.availability.noticePeriod}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hours per Week</label>
                <input
                  type="number"
                  name="availability.hoursPerWeek"
                  value={formData.availability.hoursPerWeek}
                  onChange={handleChange}
                  min="0"
                  max="168"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}

export default Preferences; 