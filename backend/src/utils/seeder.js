const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Job = require('../models/job.model');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Employer User',
    email: 'employer@example.com',
    password: 'employer123',
    role: 'employer'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  }
];

const companies = [
  {
    name: 'Tech Corp',
    description: 'Leading technology company specializing in innovative solutions',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: '201-500',
    location: {
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    },
    founded: new Date('2010-01-01'),
    culture: 'Innovation-driven culture with focus on work-life balance',
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Gym Membership'],
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: 'https://twitter.com/techcorp',
      facebook: 'https://facebook.com/techcorp'
    },
    status: 'active'
  }
];

const jobs = [
  {
    title: 'Senior Software Engineer',
    description: 'We are looking for an experienced software engineer to join our team',
    requirements: 'Bachelor\'s degree in Computer Science, 5+ years of experience',
    responsibilities: 'Lead development of new features, mentor junior developers',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: {
      min: 120000,
      max: 180000
    },
    experience: '5+ years',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work'],
    category: 'Software Development',
    status: 'active'
  },
  {
    title: 'Product Manager',
    description: 'Seeking a product manager to lead our product development initiatives',
    requirements: 'Bachelor\'s degree, 3+ years of product management experience',
    responsibilities: 'Define product strategy, work with stakeholders',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: {
      min: 100000,
      max: 150000
    },
    experience: '3+ years',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work'],
    category: 'Product Management',
    status: 'active'
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();

    console.log('Data cleared...');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async user => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return User.create(user);
      })
    );

    console.log('Users seeded...');

    // Create company with employer as owner
    const employer = createdUsers.find(user => user.role === 'employer');
    const company = companies[0];
    company.owner = employer._id;
    company.employees = [employer._id];
    const createdCompany = await Company.create(company);

    // Update employer with company reference
    await User.findByIdAndUpdate(employer._id, {
      company: createdCompany._id
    });

    console.log('Company seeded...');

    // Create jobs
    const createdJobs = await Promise.all(
      jobs.map(async job => {
        job.company = createdCompany._id;
        return Job.create(job);
      })
    );

    // Update company with jobs
    createdCompany.jobs = createdJobs.map(job => job._id);
    await createdCompany.save();

    console.log('Jobs seeded...');
    console.log('Database seeding completed!');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Connect to database and run seeder
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB...');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = seedDatabase; 