import express from "express";
import upload from "../config/multer.js";
import {
  createOrganization,
  getOrganization,
  getCurrentOrganization,
  updateOrganization,
  listOrganizations,
  addUserToOrganization,
  removeUserFromOrganization,
  getOrganizationMembers,
  updateUserRole,
  switchOrganization,
  deleteOrganization,
} from "../controllers/organizationController.js";
import { 
  authenticateWithOrg, 
  requirePermission, 
  protectCompanyWithOrg,
  enforceOrgIsolation 
} from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../middleware/rbacMiddleware.js";

const organizationRouter = express.Router();

// ================= PUBLIC ROUTES =================

// Create a new organization (with owner user)
organizationRouter.post(
  "/create",
  upload.single("logo"),
  createOrganization
);

// ================= PROTECTED ROUTES (User Authentication Required) =================

// Get current user's organization
organizationRouter.get(
  "/current",
  authenticateWithOrg,
  getCurrentOrganization
);

// Get organization by ID
organizationRouter.get(
  "/:id",
  authenticateWithOrg,
  getOrganization
);

// Update organization
organizationRouter.put(
  "/:id",
  authenticateWithOrg,
  upload.single("logo"),
  requirePermission(PERMISSIONS.ORGANIZATION_MANAGE),
  updateOrganization
);

// List all organizations (admin/superuser only)
organizationRouter.get(
  "/",
  authenticateWithOrg,
  requirePermission(PERMISSIONS.ORGANIZATION_MANAGE),
  listOrganizations
);

// ================= ORGANIZATION MEMBER MANAGEMENT =================

// Add user to organization
organizationRouter.post(
  "/members/add",
  authenticateWithOrg,
  requirePermission(PERMISSIONS.USERS_MANAGE),
  addUserToOrganization
);

// Remove user from organization
organizationRouter.delete(
  "/members/:userId",
  authenticateWithOrg,
  requirePermission(PERMISSIONS.USERS_MANAGE),
  removeUserFromOrganization
);

// Get organization members
organizationRouter.get(
  "/members",
  authenticateWithOrg,
  enforceOrgIsolation(),
  getOrganizationMembers
);

// Update user role/permissions
organizationRouter.put(
  "/members/:userId/role",
  authenticateWithOrg,
  requirePermission(PERMISSIONS.USERS_MANAGE),
  updateUserRole
);

// ================= ORGANIZATION SWITCHING =================

// Switch active organization (for multi-org users)
organizationRouter.post(
  "/switch",
  authenticateWithOrg,
  switchOrganization
);

// ================= DELETE ORGANIZATION =================

// Delete organization (soft delete)
organizationRouter.delete(
  "/:id",
  authenticateWithOrg,
  requirePermission(PERMISSIONS.ORGANIZATION_MANAGE),
  deleteOrganization
);

export default organizationRouter;
import express from "express";
import {
  ChangeJobApplicationStatus,
  ChangeJobVisibility,
  getOrganizationData,
  getOrganizationJobApplicants,
  getOrganizationPostedJobs,
  getOrganizationStages,
  updateOrganizationStages,
  scheduleInterview,
  submitInterviewFeedback,
  getInterviewAnalytics,
  sendInterviewReminders,
  getOrganizationNotifications,
  updateOrganizationRichProfile,
  getOrganizationProfileCompleteness,
  loginOrganization,
  postJob,
  repostJob,
  registerOrganization,
  getOrganizationReportsSummary,
  downloadOrganizationReportExcel,
  downloadOrganizationReportPDF,
} from "../controllers/organizationController.js";
import upload, { handleUploadError } from "../config/multer.js";
import { protectOrganization } from "../middleware/AuthMiddleware.js";
import { validateRequest } from "../middleware/validation.js";
import {
  organizationRegistrationSchema,
  jobPostingSchema,
  applicationStatusSchema,
  organizationStagesSchema,
  interviewScheduleSchema,
  feedbackSchema,
} from "../utils/validation.js";

const organizationRouter = express.Router();

// Register a Organization
organizationRouter.post(
  "/register",
  upload.single("image"),
  validateRequest(organizationRegistrationSchema),
  handleUploadError,
  registerOrganization
);

// Organization login
organizationRouter.post("/login", loginOrganization);

// Get organization details
organizationRouter.get("/organization", protectOrganization, getOrganizationData);

// Post a new job
organizationRouter.post("/post-job", protectOrganization, validateRequest(jobPostingSchema), postJob);

// Get applicants for a organization's jobs
organizationRouter.get("/applications", protectOrganization, getOrganizationJobApplicants);

// List all jobs posted by the organization
organizationRouter.get("/list-jobs", protectOrganization, getOrganizationPostedJobs);

// Reports
organizationRouter.get("/reports/summary", protectOrganization, getOrganizationReportsSummary);
organizationRouter.get("/reports/excel", protectOrganization, downloadOrganizationReportExcel);
organizationRouter.get("/reports/pdf", protectOrganization, downloadOrganizationReportPDF);

// Stage & scheduling management
organizationRouter.get("/stages", protectOrganization, getOrganizationStages);
organizationRouter.put("/stages", protectOrganization, validateRequest(organizationStagesSchema), updateOrganizationStages);
organizationRouter.post(
  "/schedule-interview",
  protectOrganization,
  validateRequest(interviewScheduleSchema),
  scheduleInterview
);
organizationRouter.post(
  "/feedback",
  protectOrganization,
  validateRequest(feedbackSchema),
  submitInterviewFeedback
);
organizationRouter.get("/analytics/interviews", protectOrganization, getInterviewAnalytics);
organizationRouter.post("/reminders/interviews", protectOrganization, sendInterviewReminders);
organizationRouter.get("/notifications", protectOrganization, getOrganizationNotifications);
organizationRouter.put("/rich-profile", protectOrganization, updateOrganizationRichProfile);
organizationRouter.get("/profile-completeness", protectOrganization, getOrganizationProfileCompleteness);

// Change application status (e.g., approve/reject)
organizationRouter.post(
  "/change-status",
  protectOrganization,
  validateRequest(applicationStatusSchema),
  ChangeJobApplicationStatus
);

// Change job visibility (e.g., show/hide job posting)
organizationRouter.post("/change-visibility", protectOrganization, ChangeJobVisibility);

// Repost expired job if no shortlisted candidate
organizationRouter.post("/repost-job", protectOrganization, repostJob);

export default organizationRouter;
