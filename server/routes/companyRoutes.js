import express from "express";
import {
  ChangeJobApplicationStatus,
  ChangeJobVisibility,
  getCompanyData,
  getCompanyJobApplicants,
  getCompanyPostedJobs,
  loginCompany,
  postJob,
  registerCompany,
} from "../controllers/companyController.js";
import upload, { handleUploadError } from "../config/multer.js";
import { protectCompany } from "../middleware/AuthMiddleware.js";
import { validateRequest } from "../middleware/validation.js";
import { companyRegistrationSchema, jobPostingSchema, applicationStatusSchema } from "../utils/validation.js";

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

// Change application status (e.g., approve/reject)
companyRouter.post(
  "/change-status",
  protectCompany,
  validateRequest(applicationStatusSchema),
  ChangeJobApplicationStatus
);

// Change job visibility (e.g., show/hide job posting)
companyRouter.post("/change-visibility", protectCompany, ChangeJobVisibility);

export default companyRouter;
