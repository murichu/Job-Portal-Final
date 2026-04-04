import express from "express";
import {
  ChangeJobApplicationStatus,
  ChangeJobVisibility,
  getCompanyData,
  getCompanyJobApplicants,
  getCompanyPostedJobs,
  getCompanyStages,
  updateCompanyStages,
  scheduleInterview,
  submitInterviewFeedback,
  getInterviewAnalytics,
  sendInterviewReminders,
  getCompanyNotifications,
  updateCompanyRichProfile,
  getCompanyProfileCompleteness,
  loginCompany,
  postJob,
  repostJob,
  registerCompany,
  getCompanyReportsSummary,
  downloadCompanyReportExcel,
  downloadCompanyReportPDF,
  moderateJobApproval,
  softDeleteJob,
  submitJobForApproval,
} from "../controllers/companyController.js";
import upload, { handleUploadError } from "../config/multer.js";
import { protectCompany } from "../middleware/AuthMiddleware.js";
import { validateRequest } from "../middleware/validation.js";
import {
  companyRegistrationSchema,
  jobPostingSchema,
  applicationStatusSchema,
  companyStagesSchema,
  interviewScheduleSchema,
  feedbackSchema,
  jobModerationSchema,
  jobDeleteSchema,
} from "../utils/validation.js";

const companyRouter = express.Router();

// Register a Company
companyRouter.post(
  "/register",
  upload.single("image"),
  validateRequest(companyRegistrationSchema),
  handleUploadError,
  registerCompany
);

// Company login
companyRouter.post("/login", loginCompany);

// Get company details
companyRouter.get("/company", protectCompany, getCompanyData);

// Post a new job
companyRouter.post("/post-job", protectCompany, validateRequest(jobPostingSchema), postJob);

// Get applicants for a company's jobs
companyRouter.get("/applications", protectCompany, getCompanyJobApplicants);

// List all jobs posted by the company
companyRouter.get("/list-jobs", protectCompany, getCompanyPostedJobs);

// Reports
companyRouter.get("/reports/summary", protectCompany, getCompanyReportsSummary);
companyRouter.get("/reports/excel", protectCompany, downloadCompanyReportExcel);
companyRouter.get("/reports/pdf", protectCompany, downloadCompanyReportPDF);

// Stage & scheduling management
companyRouter.get("/stages", protectCompany, getCompanyStages);
companyRouter.put("/stages", protectCompany, validateRequest(companyStagesSchema), updateCompanyStages);
companyRouter.post(
  "/schedule-interview",
  protectCompany,
  validateRequest(interviewScheduleSchema),
  scheduleInterview
);
companyRouter.post(
  "/feedback",
  protectCompany,
  validateRequest(feedbackSchema),
  submitInterviewFeedback
);
companyRouter.get("/analytics/interviews", protectCompany, getInterviewAnalytics);
companyRouter.post("/reminders/interviews", protectCompany, sendInterviewReminders);
companyRouter.get("/notifications", protectCompany, getCompanyNotifications);
companyRouter.put("/rich-profile", protectCompany, updateCompanyRichProfile);
companyRouter.get("/profile-completeness", protectCompany, getCompanyProfileCompleteness);

// Change application status (e.g., approve/reject)
companyRouter.post(
  "/change-status",
  protectCompany,
  validateRequest(applicationStatusSchema),
  ChangeJobApplicationStatus
);

// Change job visibility (e.g., show/hide job posting)
companyRouter.post("/change-visibility", protectCompany, ChangeJobVisibility);

// Repost expired job if no shortlisted candidate
companyRouter.post("/repost-job", protectCompany, repostJob);
companyRouter.post("/moderate-job", protectCompany, validateRequest(jobModerationSchema), moderateJobApproval);
companyRouter.post("/delete-job", protectCompany, validateRequest(jobDeleteSchema), softDeleteJob);
companyRouter.post("/submit-job-approval", protectCompany, validateRequest(jobDeleteSchema), submitJobForApproval);


export default companyRouter;
