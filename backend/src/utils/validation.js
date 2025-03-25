const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).max(30)
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string(),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    zipCode: Joi.string()
  }),
  dateOfBirth: Joi.date(),
  skills: Joi.array().items(Joi.string()),
  experience: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      company: Joi.string().required(),
      location: Joi.string(),
      from: Joi.date().required(),
      to: Joi.date(),
      current: Joi.boolean().default(false),
      description: Joi.string()
    })
  ),
  education: Joi.array().items(
    Joi.object({
      school: Joi.string().required(),
      degree: Joi.string().required(),
      fieldOfStudy: Joi.string().required(),
      from: Joi.date().required(),
      to: Joi.date(),
      current: Joi.boolean().default(false),
      description: Joi.string()
    })
  ),
  preferences: Joi.object({
    jobTypes: Joi.array().items(
      Joi.string().valid('full-time', 'part-time', 'contract', 'internship')
    ),
    locations: Joi.array().items(Joi.string()),
    industries: Joi.array().items(Joi.string()),
    salary: Joi.object({
      min: Joi.number(),
      max: Joi.number()
    }),
    workCulture: Joi.array().items(Joi.string()),
    benefits: Joi.array().items(Joi.string())
  })
});

// Job validation schemas
const createJobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  requirements: Joi.string().required(),
  responsibilities: Joi.string().required(),
  location: Joi.string().required(),
  type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship').required(),
  salary: Joi.object({
    min: Joi.number(),
    max: Joi.number()
  }),
  experience: Joi.string().required(),
  skills: Joi.array().items(Joi.string()).required(),
  benefits: Joi.array().items(Joi.string()),
  category: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active')
});

// Company validation schemas
const createCompanySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  website: Joi.string().uri(),
  industry: Joi.string().required(),
  size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+').required(),
  location: Joi.object({
    address: Joi.string(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    zipCode: Joi.string()
  }),
  founded: Joi.date(),
  culture: Joi.string(),
  benefits: Joi.array().items(Joi.string()),
  socialMedia: Joi.object({
    linkedin: Joi.string().uri(),
    twitter: Joi.string().uri(),
    facebook: Joi.string().uri()
  })
});

// Application validation schemas
const createApplicationSchema = Joi.object({
  coverLetter: Joi.string().required(),
  notes: Joi.string()
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'accepted')
    .required(),
  interviewDate: Joi.date(),
  notes: Joi.string()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createJobSchema,
  createCompanySchema,
  createApplicationSchema,
  updateApplicationStatusSchema
}; 