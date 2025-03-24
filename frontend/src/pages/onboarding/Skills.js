import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';

function Skills() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    technicalSkills: [],
    softSkills: [],
    languages: [],
    certifications: []
  });

  const [newSkill, setNewSkill] = useState({
    technical: '',
    soft: '',
    language: '',
    certification: ''
  });

  const handleAddSkill = (type) => {
    const value = newSkill[type];
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      setNewSkill(prev => ({
        ...prev,
        [type]: ''
      }));
    }
  };

  const handleRemoveSkill = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically save the data to your backend
    console.log('Skills:', formData);
    navigate('/onboarding/preferences');
  };

  const renderSkillSection = (type, title, placeholder) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newSkill[type]}
          onChange={(e) => setNewSkill(prev => ({ ...prev, [type]: e.target.value }))}
          placeholder={placeholder}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => handleAddSkill(type)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {formData[type].map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(type, index)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Skills & Qualifications</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {renderSkillSection(
            'technicalSkills',
            'Technical Skills',
            'Add technical skill (e.g., JavaScript, Python)'
          )}

          {renderSkillSection(
            'softSkills',
            'Soft Skills',
            'Add soft skill (e.g., Leadership, Communication)'
          )}

          {renderSkillSection(
            'languages',
            'Languages',
            'Add language (e.g., English, Spanish)'
          )}

          {renderSkillSection(
            'certifications',
            'Certifications',
            'Add certification (e.g., AWS Certified)'
          )}

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

export default Skills; 