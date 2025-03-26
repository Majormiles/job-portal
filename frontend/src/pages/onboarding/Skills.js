import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { useAuth } from '../../context/AuthContext';

function Skills() {
  const navigate = useNavigate();
  const { updateOnboardingStatus, api } = useAuth();
  const [formData, setFormData] = useState({
    technical: [],
    soft: [],
    languages: [],
    certifications: []
  });
  const [newSkill, setNewSkill] = useState({
    technical: '',
    soft: '',
    languages: '',
    certifications: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const handleAddSkill = (category) => {
    const skillValue = newSkill[category]?.trim();
    if (!skillValue) return;

    setFormData(prev => ({
      ...prev,
      [category]: [...prev[category], skillValue]
    }));
    setNewSkill(prev => ({
      ...prev,
      [category]: ''
    }));
  };

  const handleRemoveSkill = (category, index) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if at least one skill is added in each category
      const hasSkills = Object.values(formData).some(skills => skills.length > 0);
      if (!hasSkills) {
        setError('Please add at least one skill in any category.');
        setLoading(false);
        return;
      }

      console.log('Sending onboarding data:', { step: 'skills', data: formData });

      // Update onboarding status
      const response = await updateOnboardingStatus(formData, 'skills');
      console.log('Onboarding update response:', response);

      // Navigate to next step
      navigate('/onboarding/preferences');
    } catch (error) {
      console.error('Error updating skills:', error);
      setError(error.response?.data?.message || 'Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await api.get('/users/onboarding');
        if (response.data.success && response.data.data.skills?.data) {
          const existingData = response.data.data.skills.data;
          setTechnicalSkills(existingData.technicalSkills || []);
          setSoftSkills(existingData.softSkills || []);
          setLanguages(existingData.languages || []);
          setCertifications(existingData.certifications || []);
        }
      } catch (err) {
        console.error('Error fetching existing data:', err);
      }
    };

    fetchExistingData();
  }, [api]);

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Skills & Qualifications</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Technical Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Technical Skills</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                name="technical"
                value={newSkill.technical}
                onChange={handleChange}
                placeholder="e.g., JavaScript, Python"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill('technical')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.technical.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill('technical', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Soft Skills</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                name="soft"
                value={newSkill.soft}
                onChange={handleChange}
                placeholder="e.g., Communication, Leadership"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill('soft')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.soft.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill('soft', index)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Languages</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                name="languages"
                value={newSkill.languages}
                onChange={handleChange}
                placeholder="e.g., English, French"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill('languages')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.languages.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill('languages', index)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Certifications</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                name="certifications"
                value={newSkill.certifications}
                onChange={handleChange}
                placeholder="e.g., AWS Certified, PMP"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill('certifications')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.certifications.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill('certifications', index)}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/onboarding/professional-info')}
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

export default Skills; 