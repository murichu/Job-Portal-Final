import Joi from 'joi';

// User registration validation schema
export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    })
});

// User login validation schema
export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Company registration validation schema
export const companyRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
  recruiterName: Joi.string().min(2).max(50).trim().required(),
  recruiterPosition: Joi.string().min(2).max(50).trim().required(),
  companyPhone: Joi.string().min(10).max(15).trim().required(),
  companyLocation: Joi.string().min(2).max(100).trim().required()
});

// Job posting validation schema
export const jobPostingSchema = Joi.object({
  title: Joi.string().min(3).max(100).trim().required(),
  description: Joi.string().min(0).required(),
  location: Joi.string().min(2).max(50).required(),
  category: Joi.string().valid('Programming', 'Data Science', 'Designing', 'Networking', 'Management', 'Marketing', 'Cybersecurity').required(),
  level: Joi.string().valid('Beginner level', 'Intermediate level', 'Senior level').required(),
  salaryMode: Joi.string().valid('fixed', 'range').default('fixed'),
  salaryVisible: Joi.boolean().default(true),
  isNegotiable: Joi.boolean().default(false),
  salary: Joi.number().min(0).max(1000000000).optional(),
  salaryAmount: Joi.when('isNegotiable', {
    is: true,
    then: Joi.number().min(0).max(1000000000).optional().allow(null),
    otherwise: Joi.when('salaryMode', {
      is: 'fixed',
      then: Joi.number().min(1).max(1000000000).required(),
      otherwise: Joi.number().optional().allow(null),
    }),
  }),
  salaryMin: Joi.when('isNegotiable', {
    is: true,
    then: Joi.number().min(0).max(1000000000).optional().allow(null),
    otherwise: Joi.when('salaryMode', {
      is: 'range',
      then: Joi.number().min(1).max(1000000000).required(),
      otherwise: Joi.number().optional().allow(null),
    }),
  }),
  salaryMax: Joi.when('isNegotiable', {
    is: true,
    then: Joi.number().min(0).max(1000000000).optional().allow(null),
    otherwise: Joi.when('salaryMode', {
      is: 'range',
      then: Joi.number().min(Joi.ref('salaryMin')).max(1000000000).required(),
      otherwise: Joi.number().optional().allow(null),
    }),
  }),
  deadline: Joi.date().iso().greater('now').required(),
  isDraft: Joi.boolean().default(false)
});

// Job application validation schema
export const jobApplicationSchema = Joi.object({
  jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

// Application status update validation schema
export const applicationStatusSchema = Joi.object({
  applicationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  status: Joi.string().valid('Pending', 'Longlisted', 'Shortlisted', 'Rejected').required()
});

export const companyStagesSchema = Joi.object({
  stages: Joi.array().items(Joi.string().min(2).max(40)).min(3).required()
});

export const interviewScheduleSchema = Joi.object({
  applicationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  scheduledAt: Joi.date().iso().greater('now').required(),
  notes: Joi.string().allow('').max(300).optional(),
  mode: Joi.string().valid("virtual", "physical").default("virtual"),
  location: Joi.string().allow('').max(150).optional()
});

export const feedbackSchema = Joi.object({
  applicationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  interviewerName: Joi.string().min(2).max(100).required(),
  satisfaction: Joi.number().min(1).max(5).required(),
  candidateScore: Joi.number().min(1).max(5).required(),
  communication: Joi.number().min(1).max(5).required(),
  technical: Joi.number().min(1).max(5).required(),
  recommendation: Joi.string().valid('Strong No', 'No', 'Maybe', 'Yes', 'Strong Yes').required(),
  notes: Joi.string().allow('').max(500).optional()
});


export const jobModerationSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  decision: Joi.string().valid('approved', 'rejected').required(),
  note: Joi.string().allow('').max(300).optional()
});

export const jobDeleteSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});
