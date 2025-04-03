import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import { useAuth } from '../../contexts/AuthContext';

const Skills = () => {
  const navigate = useNavigate();
  const { updateOnboardingStatus, api, checkOnboardingStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    technicalSkills: [],
    softSkills: [],
    languages: [],
    certifications: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statusResponse = await checkOnboardingStatus(true);
      
      if (statusResponse?.skills?.data) {
        const existingData = statusResponse.skills.data;
        setFormData({
          technicalSkills: existingData.technical || [],
          softSkills: existingData.soft || [],
          languages: existingData.languages || [],
          certifications: existingData.certifications || []
        });
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error(error.response?.data?.message || 'Failed to load skills information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (category) => {
    setFormData(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), '']
    }));
  };

  const handleRemoveSkill = (category, index) => {
    setFormData(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSkillChange = (category, index, value) => {
    // Prevent special characters in soft skills and languages
    if ((category === 'softSkills' || category === 'languages') && !/^[a-zA-Z\s]*$/.test(value)) {
      return;
    }

    // Prevent special characters in technical skills and certifications
    if ((category === 'technicalSkills' || category === 'certifications') && !/^[a-zA-Z0-9\s\-_#.]*$/.test(value)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [category]: (prev[category] || []).map((skill, i) => i === index ? value : skill)
    }));
  };

  const validateForm = () => {
    // Technical skills validation
    if (!formData.technicalSkills.length) {
      toast.error('Please add at least one technical skill');
      return false;
    }

    // Validate each technical skill
    for (const skill of formData.technicalSkills) {
      if (!skill.trim()) {
        toast.error('Technical skills cannot be empty');
        return false;
      }
      // Must contain at least one letter
      if (!/[a-zA-Z]/.test(skill.trim())) {
        toast.error('Technical skills must contain at least one letter');
        return false;
      }
      // Allow letters, numbers, spaces, and basic special characters
      if (!/^[a-zA-Z0-9\s\-_#.]+$/.test(skill.trim())) {
        toast.error('Technical skills should contain only letters, numbers, spaces, and basic special characters');
        return false;
      }
      // Check for minimum length
      if (skill.trim().length < 2) {
        toast.error('Technical skills must be at least 2 characters long');
        return false;
      }
      // Check for maximum length
      if (skill.trim().length > 50) {
        toast.error('Technical skills must be less than 50 characters');
        return false;
      }
      // Check for consecutive special characters
      if (skill.trim().match(/[-_#.]{2,}/)) {
        toast.error('Technical skills cannot contain consecutive special characters');
        return false;
      }
    }

    // Soft skills validation
    if (!formData.softSkills.length) {
      toast.error('Please add at least one soft skill');
      return false;
    }

    // Validate each soft skill
    for (const skill of formData.softSkills) {
      if (!skill.trim()) {
        toast.error('Soft skills cannot be empty');
        return false;
      }
      // Must contain at least one letter
      if (!/[a-zA-Z]/.test(skill.trim())) {
        toast.error('Soft skills must contain at least one letter');
        return false;
      }
      // Only allow letters and spaces
      if (!/^[a-zA-Z\s]+$/.test(skill.trim())) {
        toast.error('Soft skills should contain only letters and spaces');
        return false;
      }
      // Check for minimum length
      if (skill.trim().length < 2) {
        toast.error('Soft skills must be at least 2 characters long');
        return false;
      }
      // Check for maximum length
      if (skill.trim().length > 50) {
        toast.error('Soft skills must be less than 50 characters');
        return false;
      }
      // Check for consecutive spaces
      if (skill.trim().includes('  ')) {
        toast.error('Soft skills cannot contain consecutive spaces');
        return false;
      }
    }

    // Languages validation (if provided)
    for (const language of formData.languages) {
      if (language.trim()) {
        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(language.trim())) {
          toast.error('Languages must contain at least one letter');
          return false;
        }
        // Only allow letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(language.trim())) {
          toast.error('Languages should contain only letters and spaces');
          return false;
        }
        // Check for minimum length
        if (language.trim().length < 2) {
          toast.error('Languages must be at least 2 characters long');
          return false;
        }
        // Check for maximum length
        if (language.trim().length > 50) {
          toast.error('Languages must be less than 50 characters');
          return false;
        }
        // Check for consecutive spaces
        if (language.trim().includes('  ')) {
          toast.error('Languages cannot contain consecutive spaces');
          return false;
        }
      }
    }

    // Certifications validation (if provided)
    for (const cert of formData.certifications) {
      if (cert.trim()) {
        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(cert.trim())) {
          toast.error('Certifications must contain at least one letter');
          return false;
        }
        // Allow letters, numbers, spaces, and basic special characters
        if (!/^[a-zA-Z0-9\s\-_#.]+$/.test(cert.trim())) {
          toast.error('Certifications should contain only letters, numbers, spaces, and basic special characters');
          return false;
        }
        // Check for minimum length
        if (cert.trim().length < 2) {
          toast.error('Certifications must be at least 2 characters long');
          return false;
        }
        // Check for maximum length
        if (cert.trim().length > 100) {
          toast.error('Certifications must be less than 100 characters');
          return false;
        }
        // Check for consecutive special characters
        if (cert.trim().match(/[-_#.]{2,}/)) {
          toast.error('Certifications cannot contain consecutive special characters');
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

      // Clean and format the data to match backend schema
      const skillsData = {
        technical: formData.technicalSkills
          .map(skill => skill.trim())
          .filter(skill => skill),
        soft: formData.softSkills
          .map(skill => skill.trim())
          .filter(skill => skill),
        languages: formData.languages
          .map(lang => lang.trim())
          .filter(lang => lang),
        certifications: formData.certifications
          .map(cert => cert.trim())
          .filter(cert => cert)
      };

      // Update onboarding status
      await updateOnboardingStatus('skills', skillsData);
      
      toast.success('Skills saved successfully');
      navigate('/onboarding/preferences');
    } catch (error) {
      console.error('Error saving skills:', error);
      toast.error(error.response?.data?.message || 'Failed to save skills');
    } finally {
      setLoading(false);
    }
  };

  const renderSkillInputs = (category, label) => {
    const skills = formData[category] || [];
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{label}</h3>
          <button
            type="button"
            onClick={() => handleAddSkill(category)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add {label}
          </button>
        </div>
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleSkillChange(category, index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveSkill(category, index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Skills & Expertise</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {renderSkillInputs('technicalSkills', 'Technical Skills')}
          {renderSkillInputs('softSkills', 'Soft Skills')}
          {renderSkillInputs('languages', 'Languages')}
          {renderSkillInputs('certifications', 'Certifications')}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/onboarding/professional-info')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
};

export default Skills; 