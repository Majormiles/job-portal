import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faDollarSign, 
  faCalendarAlt, 
  faEdit, 
  faArrowRight, 
  faBookmark,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import { 
  faYoutube,
  faRedditAlien,
  faFacebookF,
  faInstagram,
  faTwitter,
  faGitlab,
  faApple,
  faUpwork
} from '@fortawesome/free-brands-svg-icons';

const JobAlerts = () => {
  console.log('JobAlerts component rendering');
  const jobAlerts = [
    {
      id: 1,
      title: 'Technical Support Specialist',
      company: 'Google',
      companyLogo: '/logos/google.png',
      location: 'Idaho, USA',
      salary: '$15K-$20K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: true
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'YouTube',
      companyLogo: '/logos/youtube.png',
      location: 'Minnesota, USA',
      salary: '$10K-$15K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: true
    },
    {
      id: 3,
      title: 'Front End Developer',
      company: 'Reddit',
      companyLogo: '/logos/reddit.png',
      location: 'Mymensingh, Bangladesh',
      salary: '$10K-$15K',
      daysRemaining: 4,
      type: 'Internship',
      isFavorite: false,
      isBlackFlagged: true
    },
    {
      id: 4,
      title: 'Marketing Officer',
      company: 'Facebook',
      companyLogo: '/logos/facebook.png',
      location: 'Montana, USA',
      salary: '$50K-$60K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: true
    },
    {
      id: 5,
      title: 'Networking Engineer',
      company: 'Instagram',
      companyLogo: '/logos/instagram.png',
      location: 'Michigan, USA',
      salary: '$5K-$10K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: false,
      isBlackFlagged: true
    },
    {
      id: 6,
      title: 'Senior UX Designer',
      company: 'Figma',
      companyLogo: '/logos/figma.png',
      location: 'United Kingdom of Great Britain',
      salary: '$30K-$35K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: true,
      isHighlighted: true
    },
    {
      id: 7,
      title: 'Junior Graphic Designer',
      company: 'Facebook',
      companyLogo: '/logos/facebook.png',
      location: 'Mymensingh, Bangladesh',
      salary: '$40K-$50K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: true
    },
    {
      id: 8,
      title: 'Product Designer',
      company: 'Twitter',
      companyLogo: '/logos/twitter.png',
      location: 'Sivas, Turkey',
      salary: '$50K-$70K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: true
    },
    {
      id: 9,
      title: 'Project Manager',
      company: 'GitLab',
      companyLogo: '/logos/gitlab.png',
      location: 'Ohio, USA',
      salary: '$50K-$80K',
      daysRemaining: 4,
      type: 'Full Time',
      isFavorite: true
    },
    {
      id: 10,
      title: 'Marketing Manager',
      company: 'Microsoft',
      companyLogo: '/logos/microsoft.png',
      location: 'Konya, Turkey',
      salary: '$20K-$25K',
      daysRemaining: 4,
      type: 'Temporary',
      isFavorite: true
    },
    {
      id: 11,
      title: 'Visual Designer',
      company: 'Apple',
      companyLogo: '/logos/apple.png',
      location: 'Washington, USA',
      salary: '$10K-$15K',
      daysRemaining: 4,
      type: 'Part Time',
      isFavorite: true
    },
    {
      id: 12,
      title: 'Interaction Designer',
      company: 'Firebase',
      companyLogo: '/logos/firebase.png',
      location: 'Penn, USA',
      salary: '$35K-$40K',
      daysRemaining: 4,
      type: 'Remote',
      isFavorite: false,
      isBlackFlagged: true
    },
    {
      id: 13,
      title: 'Senior UX Designer',
      company: 'Upwork',
      companyLogo: '/logos/upwork.png',
      location: 'Sylhet, Bangladesh',
      salary: '$30K-$35K',
      daysRemaining: 4,
      type: 'Contract Base',
      isFavorite: false,
      isBlackFlagged: true
    }
  ];

  // Company logos mapping
  const companyLogoMap = {
    'Google': <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
      <span className="text-gray-600 font-semibold">G</span>
    </div>,
    'YouTube': <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faYoutube} className="text-white text-xl" />
    </div>,
    'Reddit': <div className="w-12 h-12 flex items-center justify-center bg-orange-500 rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faRedditAlien} className="text-white text-xl" />
    </div>,
    'Facebook': <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faFacebookF} className="text-white text-xl" />
    </div>,
    'Instagram': <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faInstagram} className="text-white text-xl" />
    </div>,
    'Figma': <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
      <span className="text-gray-600 font-semibold">F</span>
    </div>,
    'Twitter': <div className="w-12 h-12 flex items-center justify-center bg-blue-400 rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faTwitter} className="text-white text-xl" />
    </div>,
    'GitLab': <div className="w-12 h-12 flex items-center justify-center bg-red-500 rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faGitlab} className="text-white text-xl" />
    </div>,
    'Microsoft': <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
      <span className="text-gray-600 font-semibold">M</span>
    </div>,
    'Apple': <div className="w-12 h-12 flex items-center justify-center bg-black rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faApple} className="text-white text-xl" />
    </div>,
    'Firebase': <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
      <span className="text-gray-600 font-semibold">F</span>
    </div>,
    'Upwork': <div className="w-12 h-12 flex items-center justify-center bg-green-500 rounded-lg shadow-sm">
      <FontAwesomeIcon icon={faUpwork} className="text-white text-xl" />
    </div>,
  };

  // Helper function to get job type badge color
  const getJobTypeBadgeColor = (type) => {
    switch(type) {
      case 'Full Time':
        return 'bg-blue-100 text-blue-600';
      case 'Part Time':
        return 'bg-purple-100 text-purple-600';
      case 'Internship':
        return 'bg-green-100 text-green-600';
      case 'Remote':
        return 'bg-gray-100 text-gray-600';
      case 'Temporary':
        return 'bg-yellow-100 text-yellow-600';
      case 'Contract Base':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  try {
    return (
      <div className="mx-auto px-8 py-8 w-[100%] sm:w-[80%] mt-[20px] sm:mt-[20px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Job Alerts <span className="text-sm text-gray-500 font-normal">(9 new jobs)</span>
          </h1>
          <button className="flex items-center text-gray-600 hover:text-blue-600">
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit Job Alerts
          </button>
        </div>

        <div className="space-y-4">
          {jobAlerts.map(job => (
            <div 
              key={job.id} 
              className={`bg-white rounded-lg border p-4 transition-all duration-200 ${job.isHighlighted ? 'border-blue-500 border-2' : 'border-gray-200'}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                  {/* Replace with actual company logos */}
                  {companyLogoMap[job.company]}
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-1 text-gray-400" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-gray-400" />
                        <span>{job.daysRemaining} Days Remaining</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <span className={`px-3 py-1 text-xs rounded-full ${getJobTypeBadgeColor(job.type)}`}>
                    {job.type}
                  </span>
                  
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none">
                      {job.isBlackFlagged ? (
                        <FontAwesomeIcon icon={faFlag} className="text-red-500" />
                      ) : (
                        <FontAwesomeIcon icon={faBookmark} className={job.isFavorite ? 'text-blue-600' : ''} />
                      )}
                    </button>
                    <Link to="/job-detail" className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 space-x-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-50">
            <FontAwesomeIcon icon={faArrowRight} className="transform rotate-180" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">01</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">02</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">03</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">04</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">05</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-50">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <p>© {new Date().getFullYear()} Job Portal &copy; Major Myles. All rights Reserved</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in JobAlerts component:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Job Alerts</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
};

export default JobAlerts;