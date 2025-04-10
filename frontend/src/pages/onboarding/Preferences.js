import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import { useAuth } from '../../contexts/AuthContext';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const Preferences = () => {
  const navigate = useNavigate();
  const { updateOnboardingStatus, api, checkOnboardingStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobPreferences: {
      desiredRole: '',
      desiredSalary: '',
      desiredLocation: '',
      jobType: ''
    },
    workPreferences: {
      workArrangement: '',
      workSchedule: '',
      workCulture: ''
    },
    industryPreferences: [],
    companyPreferences: []
  });

  useEffect(() => {
    fetchData();
  }, [api]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statusResponse = await checkOnboardingStatus(true);
      
      if (statusResponse?.preferences?.data) {
        const existingData = statusResponse.preferences.data;
        setFormData({
          jobPreferences: {
            desiredRole: existingData.jobPreferences?.desiredRole || '',
            desiredSalary: existingData.jobPreferences?.desiredSalary || '',
            desiredLocation: existingData.jobPreferences?.desiredLocation || '',
            jobType: existingData.jobPreferences?.jobType || ''
          },
          workPreferences: {
            workArrangement: existingData.workPreferences?.workArrangement || '',
            workSchedule: existingData.workPreferences?.workSchedule || '',
            workCulture: existingData.workPreferences?.workCulture || ''
          },
          industryPreferences: existingData.industryPreferences || [],
          companyPreferences: existingData.companyPreferences || []
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (category, field, value) => {
    // Prevent numbers-only entries for desired role
    if (category === 'jobPreferences' && field === 'desiredRole') {
      // If the value contains only numbers, don't update
      if (/^\d+$/.test(value)) {
        return;
      }
      // Allow letters, numbers, spaces, and basic special characters
      if (!/^[a-zA-Z0-9\s\-_#.]*$/.test(value)) {
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleAddPreference = (category) => {
    setFormData(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), '']
    }));
  };

  const handleRemovePreference = (category, index) => {
    setFormData(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== index)
    }));
  };

  const handlePreferenceChange = (category, index, value) => {
    // Prevent special characters in industry preferences
    if (category === 'industryPreferences' && !/^[a-zA-Z\s]*$/.test(value)) {
      return;
    }

    // Prevent special characters in company preferences
    if (category === 'companyPreferences' && !/^[a-zA-Z0-9\s\-_#.]*$/.test(value)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [category]: (prev[category] || []).map((pref, i) => i === index ? value : pref)
    }));
  };

  const validateForm = () => {
    const { jobPreferences, workPreferences } = formData;

    // Job preferences validation
    if (!jobPreferences.desiredRole.trim()) {
      toast.error('Please enter your desired role');
      return false;
    }

    // Validate desired role format
    if (!/^[a-zA-Z0-9\s\-_#.]+$/.test(jobPreferences.desiredRole.trim())) {
      toast.error('Desired role should contain only letters, numbers, spaces, and basic special characters');
      return false;
    }

    // Validate desired role contains at least one letter
    if (!/[a-zA-Z]/.test(jobPreferences.desiredRole.trim())) {
      toast.error('Desired role must contain at least one letter');
      return false;
    }

    // Validate desired role length
    if (jobPreferences.desiredRole.trim().length < 2) {
      toast.error('Desired role must be at least 2 characters long');
      return false;
    }

    if (jobPreferences.desiredRole.trim().length > 100) {
      toast.error('Desired role must be less than 100 characters');
      return false;
    }

    // Validate desired role doesn't contain consecutive special characters
    if (jobPreferences.desiredRole.trim().match(/[-_#.]{2,}/)) {
      toast.error('Desired role cannot contain consecutive special characters');
      return false;
    }

    // Validate desired salary (must be a positive number)
    const salary = parseFloat(jobPreferences.desiredSalary.replace(/[^0-9.]/g, ''));
    if (isNaN(salary) || salary <= 0) {
      toast.error('Please enter a valid desired salary');
      return false;
    }

    // Validate salary range (reasonable amount)
    if (salary > 1000000) {
      toast.error('Please enter a reasonable salary amount');
      return false;
    }

    if (!jobPreferences.desiredLocation.trim()) {
      toast.error('Please enter your desired location');
      return false;
    }

    // Validate desired location format
    if (!/^[a-zA-Z\s,]+$/.test(jobPreferences.desiredLocation.trim())) {
      toast.error('Location should contain only letters, spaces, and commas');
      return false;
    }

    // Validate desired location length
    if (jobPreferences.desiredLocation.trim().length < 2) {
      toast.error('Location must be at least 2 characters long');
      return false;
    }

    if (jobPreferences.desiredLocation.trim().length > 100) {
      toast.error('Location must be less than 100 characters');
      return false;
    }

    if (!jobPreferences.jobType) {
      toast.error('Please select a job type');
      return false;
    }

    // Work preferences validation
    if (!workPreferences.workArrangement) {
      toast.error('Please select a work arrangement');
      return false;
    }

    if (!workPreferences.workSchedule) {
      toast.error('Please select a work schedule');
      return false;
    }

    if (!workPreferences.workCulture) {
      toast.error('Please select a work culture');
      return false;
    }

    // Industry preferences validation (if provided)
    for (const industry of formData.industryPreferences) {
      if (industry.trim()) {
        // Only allow letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(industry.trim())) {
          toast.error('Industry preferences should contain only letters and spaces');
          return false;
        }
        // Check for minimum length
        if (industry.trim().length < 2) {
          toast.error('Industry preferences must be at least 2 characters long');
          return false;
        }
        // Check for maximum length
        if (industry.trim().length > 50) {
          toast.error('Industry preferences must be less than 50 characters');
          return false;
        }
        // Check for consecutive spaces
        if (industry.trim().includes('  ')) {
          toast.error('Industry preferences cannot contain consecutive spaces');
          return false;
        }
      }
    }

    // Company preferences validation (if provided)
    for (const company of formData.companyPreferences) {
      if (company.trim()) {
        // Allow letters, numbers, spaces, and basic special characters
        if (!/^[a-zA-Z0-9\s\-_#.]+$/.test(company.trim())) {
          toast.error('Company preferences should contain only letters, numbers, spaces, and basic special characters');
          return false;
        }
        // Check for minimum length
        if (company.trim().length < 2) {
          toast.error('Company preferences must be at least 2 characters long');
          return false;
        }
        // Check for maximum length
        if (company.trim().length > 100) {
          toast.error('Company preferences must be less than 100 characters');
          return false;
        }
        // Check for consecutive special characters
        if (company.trim().match(/[-_#.]{2,}/)) {
          toast.error('Company preferences cannot contain consecutive special characters');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Clean and format the data
      const preferencesData = {
        jobPreferences: {
          desiredRole: formData.jobPreferences.desiredRole.trim(),
          desiredSalary: formData.jobPreferences.desiredSalary.trim(),
          desiredLocation: formData.jobPreferences.desiredLocation.trim(),
          jobType: formData.jobPreferences.jobType
        },
        workPreferences: {
          workArrangement: formData.workPreferences.workArrangement,
          workSchedule: formData.workPreferences.workSchedule,
          workCulture: formData.workPreferences.workCulture
        },
        industryPreferences: formData.industryPreferences
          .map(industry => industry.trim())
          .filter(industry => industry),
        companyPreferences: formData.companyPreferences
          .map(company => company.trim())
          .filter(company => company)
      };

      // Update onboarding status
      await updateOnboardingStatus('preferences', preferencesData);
      
      toast.success('Preferences saved successfully');
      navigate('/onboarding/complete');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollToTop />
      <OnboardingLayout>
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Job Preferences</h2>
          <form onSubmit={handleSubmit} className="space-y-10 bg-white rounded-lg shadow-md p-8">
            {/* Job Preferences Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold pb-2 border-b border-gray-200">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Role</label>
                  <input
                    type="text"
                    value={formData.jobPreferences.desiredRole}
                    onChange={(e) => handleNestedChange('jobPreferences', 'desiredRole', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Software Engineer, Project Manager"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Salary</label>
                  <input
                    type="text"
                    value={formData.jobPreferences.desiredSalary}
                    onChange={(e) => handleNestedChange('jobPreferences', 'desiredSalary', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 75000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Location</label>
                  <input
                    type="text"
                    value={formData.jobPreferences.desiredLocation}
                    onChange={(e) => handleNestedChange('jobPreferences', 'desiredLocation', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Accra, Remote"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    value={formData.jobPreferences.jobType}
                    onChange={(e) => handleNestedChange('jobPreferences', 'jobType', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select job type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Work Preferences Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold pb-2 border-b border-gray-200">Work Arrangement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Arrangement</label>
                  <select
                    value={formData.workPreferences.workArrangement}
                    onChange={(e) => handleNestedChange('workPreferences', 'workArrangement', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select work arrangement</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Schedule</label>
                  <select
                    value={formData.workPreferences.workSchedule}
                    onChange={(e) => handleNestedChange('workPreferences', 'workSchedule', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select work schedule</option>
                    <option value="day">Day Shift</option>
                    <option value="night">Night Shift</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Culture</label>
                  <select
                    value={formData.workPreferences.workCulture}
                    onChange={(e) => handleNestedChange('workPreferences', 'workCulture', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select work culture</option>
                    <option value="startup">Startup</option>
                    <option value="corporate">Corporate</option>
                    <option value="agency">Agency</option>
                    <option value="nonprofit">Non-profit</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Industry Preferences Section */}
            <section className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold">Industry Preferences</h3>
                <button
                  type="button"
                  onClick={() => handleAddPreference('industryPreferences')}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  + Add Industry
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {(formData.industryPreferences || []).map((industry, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => handlePreferenceChange('industryPreferences', index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter industry (e.g. Technology, Healthcare)"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePreference('industryPreferences', index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1"
                      aria-label="Remove industry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                {formData.industryPreferences.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No industries added yet. Add industries you're interested in working in.</p>
                )}
              </div>
            </section>

            {/* Company Preferences Section */}
            <section className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold">Company Preferences</h3>
                <button
                  type="button"
                  onClick={() => handleAddPreference('companyPreferences')}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  + Add Company
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {(formData.companyPreferences || []).map((company, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => handlePreferenceChange('companyPreferences', index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter company name (e.g. Google, Microsoft)"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePreference('companyPreferences', index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1"
                      aria-label="Remove company"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                {formData.companyPreferences.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No companies added yet. Add companies you'd like to work for.</p>
                )}
              </div>
            </section>

            {/* Navigation Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/onboarding/skills')}
                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </OnboardingLayout>
    </>
  );
};

export default Preferences;