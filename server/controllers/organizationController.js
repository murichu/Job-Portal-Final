import Organization from "../models/Organization.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";
import { 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  getPermissionsForRole 
} from "../middleware/rbacMiddleware.js";

/**
 * Create a new organization
 */
export const createOrganization = async (req, res) => {
  try {
    const { name, slug, description, ownerEmail, ownerPassword, ownerName } = req.body;
    const logoFile = req.file;

    // Validate required fields
    if (!name || !slug || !ownerEmail || !ownerPassword || !ownerName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if organization slug already exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: "Organization with this slug already exists",
      });
    }

    // Upload logo if provided
    let logoUrl = "";
    if (logoFile) {
      const uploadResult = await cloudinary.uploader.upload(logoFile.path, {
        folder: "organization_logos",
        transformation: [{ width: 200, height: 200, crop: "fill", quality: "auto" }],
      });
      logoUrl = uploadResult.secure_url;
    }

    // Create organization
    const organization = await Organization.create({
      name,
      slug,
      description: description || "",
      logo: logoUrl,
      owner: null, // Will be set after user creation
    });

    // Hash password for owner user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ownerPassword, salt);

    // Create owner user with all permissions
    const ownerUser = await User.create({
      name: ownerName,
      email: ownerEmail.toLowerCase().trim(),
      password: hashedPassword,
      image: logoUrl || "/default-avatar.png",
      organizationId: organization._id,
      role: "owner",
      permissions: ROLE_PERMISSIONS.owner,
    });

    // Update organization with owner reference
    organization.owner = ownerUser._id;
    await organization.save();

    res.status(201).json({
      success: true,
      organization: {
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        logo: organization.logo,
        settings: organization.settings,
        subscription: organization.subscription,
      },
      owner: {
        _id: ownerUser._id,
        name: ownerUser.name,
        email: ownerUser.email,
        role: ownerUser.role,
      },
      token: generateToken(ownerUser._id, "user"),
      message: "Organization created successfully",
    });
  } catch (error) {
    console.error("createOrganization error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Organization slug or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error creating organization",
    });
  }
};

/**
 * Get organization details
 */
export const getOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    const organization = await Organization.findById(id)
      .select("-__v")
      .lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Get counts for dashboard
    const [userCount, jobCount] = await Promise.all([
      User.countDocuments({ organizationId: organization._id }),
      mongoose.model("Job").countDocuments({ organizationId: organization._id }),
    ]);

    res.json({
      success: true,
      organization: {
        ...organization,
        stats: {
          users: userCount,
          jobs: jobCount,
        },
      },
    });
  } catch (error) {
    console.error("getOrganization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get current user's organization
 */
export const getCurrentOrganization = async (req, res) => {
  try {
    const user = req.user;

    if (!user.organizationId) {
      return res.status(404).json({
        success: false,
        message: "User does not belong to any organization",
      });
    }

    const organization = await Organization.findById(user.organizationId)
      .select("-__v")
      .lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Get counts
    const [userCount, jobCount] = await Promise.all([
      User.countDocuments({ organizationId: organization._id }),
      mongoose.model("Job").countDocuments({ organizationId: organization._id }),
    ]);

    res.json({
      success: true,
      organization: {
        ...organization,
        stats: {
          users: userCount,
          jobs: jobCount,
        },
      },
      userRole: user.role,
      userPermissions: user.permissions,
    });
  } catch (error) {
    console.error("getCurrentOrganization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, settings, subscription } = req.body;
    const logoFile = req.file;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Check permissions
    const user = req.user;
    if (!user || (user.role !== "owner" && !user.permissions?.includes(PERMISSIONS.ORGANIZATION_MANAGE))) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to update organization",
      });
    }

    // Update fields
    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (settings) organization.settings = { ...organization.settings, ...settings };
    if (subscription) {
      organization.subscription = { ...organization.subscription, ...subscription };
    }

    // Upload new logo if provided
    if (logoFile) {
      const uploadResult = await cloudinary.uploader.upload(logoFile.path, {
        folder: "organization_logos",
        transformation: [{ width: 200, height: 200, crop: "fill", quality: "auto" }],
      });
      organization.logo = uploadResult.secure_url;
    }

    await organization.save();

    res.json({
      success: true,
      organization,
      message: "Organization updated successfully",
    });
  } catch (error) {
    console.error("updateOrganization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating organization",
    });
  }
};

/**
 * List organizations (for admin/superuser)
 */
export const listOrganizations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [organizations, total] = await Promise.all([
      Organization.find(query)
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Organization.countDocuments(query),
    ]);

    res.json({
      success: true,
      organizations,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: organizations.length,
        totalOrganizations: total,
      },
    });
  } catch (error) {
    console.error("listOrganizations error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Add user to organization
 */
export const addUserToOrganization = async (req, res) => {
  try {
    const { userId, email, name, role = "user", permissions } = req.body;
    const organizationId = req.organizationId || req.body.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Check if we can add more users
    if (!(await organization.canAddUser())) {
      return res.status(403).json({
        success: false,
        message: `Organization user limit reached: Maximum ${organization.subscription.maxUsers} users`,
      });
    }

    let user;

    if (userId) {
      // Add existing user
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      user.organizationId = organization._id;
      user.role = role;
      user.permissions = permissions || getPermissionsForRole(role);
    } else if (email && name) {
      // Create new user
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required for new user",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        image: "/default-avatar.png",
        organizationId: organization._id,
        role,
        permissions: permissions || getPermissionsForRole(role),
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Either userId or (email + name + password) is required",
      });
    }

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        organizationId: user.organizationId,
      },
      message: "User added to organization successfully",
    });
  } catch (error) {
    console.error("addUserToOrganization error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error adding user to organization",
    });
  }
};

/**
 * Remove user from organization
 */
export const removeUserFromOrganization = async (req, res) => {
  try {
    const { userId } = req.params;
    const organizationId = req.organizationId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent removing the owner
    if (user.role === "owner" && user.organizationId.toString() === organizationId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove organization owner",
      });
    }

    user.organizationId = null;
    user.role = "user";
    user.permissions = [];
    await user.save();

    res.json({
      success: true,
      message: "User removed from organization successfully",
    });
  } catch (error) {
    console.error("removeUserFromOrganization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error removing user from organization",
    });
  }
};

/**
 * Get organization members
 */
export const getOrganizationMembers = async (req, res) => {
  try {
    const organizationId = req.organizationId || req.params.organizationId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      User.find({ organizationId })
        .select("name email image role permissions lastLogin createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ organizationId }),
    ]);

    res.json({
      success: true,
      members,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: members.length,
        totalMembers: total,
      },
    });
  } catch (error) {
    console.error("getOrganizationMembers error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update user role/permissions in organization
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check permissions
    const currentUser = req.user;
    if (currentUser.role !== "owner" && !currentUser.permissions?.includes(PERMISSIONS.USERS_MANAGE)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to update user role",
      });
    }

    if (role) {
      user.role = role;
    }

    if (permissions) {
      user.permissions = permissions;
    } else if (role) {
      // Set default permissions for role
      user.permissions = getPermissionsForRole(role);
    }

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating user role",
    });
  }
};

/**
 * Switch user's active organization (for users in multiple orgs)
 */
export const switchOrganization = async (req, res) => {
  try {
    const { organizationId } = req.body;
    const userId = req.userId;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Verify user belongs to this organization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // For now, users can only belong to one organization at a time
    // This endpoint prepares for future multi-org support
    if (user.organizationId && user.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    res.json({
      success: true,
      message: "Organization context switched successfully",
      organization: {
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
      },
    });
  } catch (error) {
    console.error("switchOrganization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error switching organization",
    });
  }
};

/**
 * Delete organization (soft delete by setting isActive to false)
 */
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Check permissions
    const user = req.user;
    if (user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only organization owner can delete the organization",
      });
    }

    // Soft delete
    organization.isActive = false;
    await organization.save();

    // Also deactivate all users in the organization
    await User.updateMany(
      { organizationId: id },
      { $set: { isActive: false, organizationId: null } }
    );

    res.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("deleteOrganization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting organization",
    });
  }
};

    await newJob.save();

    // Respond with success
    res.json({ success: true, newJob });
  } catch (error) {
    console.error("postJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get organization job applicants
// Fetches a list of applicants who have applied to the organization's job postings
export const getOrganizationJobApplicants = async (req, res) => {
  try {
    const organizationId = req.organization._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query with organization isolation if applicable
    const query = { organizationId };
    if (req.organizationId) {
      query.organizationId = req.organizationId;
    }

    const [applications, total] = await Promise.all([
      JobApplication.find(query)
        .populate('userId', 'name email image resume')
        .populate('jobId', 'title location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments(query)
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: applications.length,
        totalApplications: total,
      }
    });
  } catch (error) {
    console.error('getOrganizationJobApplicants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

// Get organization posted jobs
// Retrieves all jobs that the organization has posted so far
export const getOrganizationPostedJobs = async (req, res) => {
  try {
    // Get the organization ID from the authenticated request (set by middleware)
    const organizationId = req.organization._id;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID not found in request.",
      });
    }

    // Build query with organization isolation
    const query = { organizationId };
    if (req.organizationId) {
      query.organizationId = req.organizationId;
    }

    // Fetch all jobs posted by this organization, sorted by newest first
    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

    // Adding number of applicants for each job
    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.countDocuments({
          jobId: job._id,
        });
        const shortlistedCount = await JobApplication.countDocuments({
          jobId: job._id,
          status: "Shortlisted",
        });
        const isExpired = new Date(job.deadline) < new Date();
        const canRepost = isExpired && shortlistedCount === 0;

        // Spread job directly since .lean() returns plain objects
        return { ...job, applicants, shortlistedCount, isExpired, canRepost };
      })
    );

    // Send response with jobs
    return res.json({ success: true, jobsData });
  } catch (error) {
    // Handle unexpected server errors
    console.error("getOrganizationPostedJobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Change job application status
// Updates the status of a job application (e.g., pending → accepted/rejected) for a specific applicant
export const ChangeJobApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const organizationId = req.organization._id;

    // Validate input
    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and status are required.',
      });
    }

    if (!['Pending', 'Longlisted', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Longlisted, Shortlisted, or Rejected.',
      });
    }

    // Validate application ID format
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format.',
      });
    }

    // Find and update the application
    const statusStageMap = {
      Pending: "Applied",
      Longlisted: "Longlisted",
      Shortlisted: "Shortlisted",
      Rejected: "Rejected",
    };

    const application = await JobApplication.findOne({
      _id: applicationId,
      organizationId,
    }).populate('userId', 'name email')
     .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you are not authorized to update it.',
      });
    }

    application.status = status;
    application.stage = statusStageMap[status] || application.stage;
    application.timeline = application.timeline || [];
    application.timeline.push({
      stage: application.stage,
      status,
      note: `Status updated to ${status}`,
      changedBy: req.organization?.name || "Organization",
      changedAt: new Date(),
    });
    await application.save();

    res.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully.`,
      application,
    });
  } catch (error) {
    console.error('ChangeJobApplicationStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

// Repost expired jobs if there are no shortlisted applications
export const repostJob = async (req, res) => {
  try {
    const { id, deadline } = req.body;
    const organizationId = req.organization._id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Valid job ID is required." });
    }

    const originalJob = await Job.findById(id);
    if (!originalJob) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (originalJob.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized action." });
    }

    if (new Date(originalJob.deadline) > new Date()) {
      return res.status(400).json({
        success: false,
        message: "You can only repost after the current posting deadline.",
      });
    }

    const shortlistedCount = await JobApplication.countDocuments({
      jobId: originalJob._id,
      status: "Shortlisted",
    });

    if (shortlistedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot repost because this job has shortlisted candidates.",
      });
    }

    const newDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(newDeadline.getTime()) || newDeadline <= new Date()) {
      return res.status(400).json({ success: false, message: "Repost deadline must be a future date." });
    }

    const repostedJob = await Job.create({
      title: originalJob.title,
      description: originalJob.description,
      location: originalJob.location,
      category: originalJob.category,
      level: originalJob.level,
      salary: originalJob.salary,
      salaryMode: originalJob.salaryMode || "fixed",
      salaryAmount: originalJob.salaryAmount ?? null,
      salaryMin: originalJob.salaryMin ?? null,
      salaryMax: originalJob.salaryMax ?? null,
      salaryVisible: typeof originalJob.salaryVisible === "boolean" ? originalJob.salaryVisible : true,
      isNegotiable: originalJob.isNegotiable || false,
      organizationId: originalJob.organizationId,
      organizationId: originalJob.organizationId || null,
      visible: true,
      date: new Date(),
      deadline: newDeadline,
      repostedFrom: originalJob._id,
    });

    return res.json({ success: true, message: "Job reposted successfully.", job: repostedJob });
  } catch (error) {
    console.error("repostJob error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getOrganizationStages = async (req, res) => {
  return res.json({
    success: true,
    stages: req.organization.interviewStages || [],
  });
};

export const updateOrganizationStages = async (req, res) => {
  try {
    const { stages } = req.body;
    const updated = await Organization.findByIdAndUpdate(
      req.organization._id,
      { interviewStages: stages },
      { new: true }
    ).lean();
    return res.json({ success: true, stages: updated.interviewStages });
  } catch (error) {
    console.error("updateOrganizationStages error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, notes = "" } = req.body;
    const application = await JobApplication.findOne({
      _id: applicationId,
      organizationId: req.organization._id,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    const meetToken = Math.random().toString(36).slice(2, 10);
    const meetLink = `https://meet.google.com/${meetToken}`;
    application.interview = {
      scheduledAt: new Date(scheduledAt),
      meetLink,
      reminderSent: false,
      notes,
    };
    application.stage = "Interview";
    application.timeline = application.timeline || [];
    application.timeline.push({
      stage: "Interview",
      status: application.status,
      note: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      changedBy: req.organization?.name || "Organization",
      changedAt: new Date(),
    });
    await application.save();

    return res.json({
      success: true,
      message: "Interview scheduled successfully.",
      interview: application.interview,
    });
  } catch (error) {
    console.error("scheduleInterview error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const submitInterviewFeedback = async (req, res) => {
  try {
    const { applicationId, ...feedback } = req.body;
    const application = await JobApplication.findOne({
      _id: applicationId,
      organizationId: req.organization._id,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    application.feedback = application.feedback || [];
    application.feedback.push(feedback);
    application.timeline = application.timeline || [];
    application.timeline.push({
      stage: application.stage || "Interview",
      status: application.status,
      note: "Interview feedback submitted",
      changedBy: feedback.interviewerName || "Interviewer",
      changedAt: new Date(),
    });
    await application.save();

    return res.json({ success: true, message: "Feedback recorded successfully." });
  } catch (error) {
    console.error("submitInterviewFeedback error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getInterviewAnalytics = async (req, res) => {
  try {
    const applications = await JobApplication.find({ organizationId: req.organization._id }).lean();
    const feedbackRows = applications.flatMap((a) => a.feedback || []);
    const avg = (key) =>
      feedbackRows.length
        ? (
            feedbackRows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0) /
            feedbackRows.length
          ).toFixed(2)
        : "0.00";

    return res.json({
      success: true,
      analytics: {
        feedbackCount: feedbackRows.length,
        interviewerSatisfaction: avg("satisfaction"),
        candidatePerformance: avg("candidateScore"),
        communication: avg("communication"),
        technical: avg("technical"),
      },
    });
  } catch (error) {
    console.error("getInterviewAnalytics error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const sendInterviewReminders = async (req, res) => {
  try {
    const now = new Date();
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const applications = await JobApplication.find({
      organizationId: req.organization._id,
      "interview.scheduledAt": { $gte: now, $lte: in24Hours },
      "interview.reminderSent": false,
    });

    for (const application of applications) {
      application.interview.reminderSent = true;
      application.timeline = application.timeline || [];
      application.timeline.push({
        stage: "Interview",
        status: application.status,
        note: "Automated interview reminder sent",
        changedBy: "System",
        changedAt: new Date(),
      });
      await application.save();
    }

    return res.json({
      success: true,
      message: `${applications.length} interview reminder(s) processed.`,
      count: applications.length,
    });
  } catch (error) {
    console.error("sendInterviewReminders error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getOrganizationNotifications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ organizationId: req.organization._id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const notifications = applications
      .flatMap((app) =>
        (app.timeline || []).map((event) => ({
          applicationId: app._id,
          stage: event.stage,
          status: event.status,
          note: event.note,
          changedAt: event.changedAt,
          changedBy: event.changedBy,
        }))
      )
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
      .slice(0, 20);

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("getOrganizationNotifications error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateOrganizationRichProfile = async (req, res) => {
  try {
    const { website = "", about = "", culture = "", benefits = [], teamHighlights = [] } = req.body;
    const updated = await Organization.findByIdAndUpdate(
      req.organization._id,
      { website, about, culture, benefits, teamHighlights },
      { new: true }
    ).lean();
    return res.json({ success: true, organization: updated });
  } catch (error) {
    console.error("updateOrganizationRichProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getOrganizationProfileCompleteness = async (req, res) => {
  const organization = req.organization;
  const checks = [
    Boolean(organization.image),
    Boolean(organization.companyLocation),
    Boolean(organization.companyPhone),
    Boolean(organization.recruiterName),
    Boolean(organization.website),
    Boolean(organization.about),
    Boolean(organization.culture),
    Array.isArray(organization.benefits) && organization.benefits.length > 0,
    Array.isArray(organization.teamHighlights) && organization.teamHighlights.length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  const percent = Math.round((completed / checks.length) * 100);
  return res.json({ success: true, completeness: percent, totalChecks: checks.length, completed });
};

// Change job visibility
// Toggles the visibility of a job posting (e.g., make a job visible or hidden from job seekers)
export const ChangeJobVisibility = async (req, res) => {
  try {
    // Extract the job ID from the request body
    const { id } = req.body;

    // Validate job ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid job ID is required.",
      });
    }

    // Get the authenticated organization's ID from the request (assumed set by auth middleware)
    const organizationId = req.organization._id;

    // Find the job by its ID
    const job = await Job.findById(id);

    // If job doesn't exist, return a 404 error
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Check if the job belongs to the authenticated organization
    if (organizationId.toString() !== job.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this job.",
      });
    }

    const nextVisibility = !job.visible;

    // Prevent hiding jobs that already have applications.
    if (!nextVisibility) {
      const applicationsCount = await JobApplication.countDocuments({ jobId: job._id });
      if (applicationsCount > 0) {
        return res.status(400).json({
          success: false,
          message: "Jobs with applications cannot be hidden.",
        });
      }
    }

    // Update only visibility to avoid re-validating legacy fields on full document save.
    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      { $set: { visible: nextVisibility } },
      { new: true }
    );

    // Respond with a success message and the updated job
    res.json({
      success: true,
      message: "Job visibility updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    // Log any unexpected server errors
    console.error("ChangeJobVisibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const buildOrganizationReport = async (organizationId) => {
  const [jobs, applications] = await Promise.all([
    Job.find({ organizationId }).sort({ createdAt: -1 }).lean(),
    JobApplication.find({ organizationId })
      .populate("jobId", "title")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Longlisted: 0, Shortlisted: 0, Rejected: 0 }
  );

  return {
    jobs,
    applications,
    statusCounts,
    totals: {
      jobs: jobs.length,
      applications: applications.length,
      longlisted: statusCounts.Longlisted,
      shortlisted: statusCounts.Shortlisted,
      pending: statusCounts.Pending,
      rejected: statusCounts.Rejected,
    },
  };
};

export const getOrganizationReportsSummary = async (req, res) => {
  try {
    const organization = req.organization;
    const report = await buildOrganizationReport(organization._id);
    return res.json({
      success: true,
      organization,
      ...report,
    });
  } catch (error) {
    console.error("getOrganizationReportsSummary error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const downloadOrganizationReportExcel = async (req, res) => {
  try {
    const organization = req.organization;
    const report = await buildOrganizationReport(organization._id);
    const csvLines = [];

    csvLines.push("Office Details");
    csvLines.push("Organization Name,Office Location,Office Phone,Recruiter,Recruiter Position,Organization Email,Logo URL");
    csvLines.push(
      `"${organization.name}","${organization.companyLocation}","${organization.companyPhone}","${organization.recruiterName}","${organization.recruiterPosition}","${organization.email}","${organization.image || ""}"`
    );
    csvLines.push("");
    csvLines.push("Summary");
    csvLines.push("Total Jobs,Total Applications,Longlisted,Shortlisted,Pending,Rejected");
    csvLines.push(
      `${report.totals.jobs},${report.totals.applications},${report.totals.longlisted},${report.totals.shortlisted},${report.totals.pending},${report.totals.rejected}`
    );
    csvLines.push("");
    csvLines.push("Jobs");
    csvLines.push("Title,Category,Level,Location,Salary Mode,Salary,Visible,Posted Date");
    report.jobs.forEach((job) => {
      csvLines.push(
        `"${job.title}","${job.category}","${job.level}","${job.location}","${job.salaryMode || 'fixed'}",${job.salary || 0},${
          job.visible ? "Yes" : "No"
        },"${new Date(job.date).toLocaleDateString()}"`
      );
    });
    csvLines.push("");
    csvLines.push("Applications");
    csvLines.push("Candidate Name,Candidate Email,Job Title,Status,Applied Date");
    report.applications.forEach((app) => {
      csvLines.push(
        `"${app.userId?.name || "N/A"}","${app.userId?.email || "N/A"}","${
          app.jobId?.title || "N/A"
        }","${app.status}","${new Date(app.date).toLocaleDateString()}"`
      );
    });

    const buffer = Buffer.from(csvLines.join("\n"), "utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${organization.name.replace(/\s+/g, "_")}_report.csv`
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    return res.send(buffer);
  } catch (error) {
    console.error("downloadOrganizationReportExcel error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const downloadOrganizationReportPDF = async (req, res) => {
  try {
    const organization = req.organization;
    const report = await buildOrganizationReport(organization._id);
    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${organization.name} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
          .logo { width: 72px; height: 72px; object-fit: contain; border: 1px solid #ddd; border-radius: 8px; }
          h1,h2 { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f6f7fb; }
        </style>
      </head>
      <body>
        <div class="header">
          <img class="logo" src="${organization.image || ""}" alt="Organization Logo" />
          <div>
            <h1>${organization.name} Report</h1>
            <div>Office: ${organization.companyLocation}</div>
            <div>Phone: ${organization.companyPhone}</div>
            <div>Recruiter: ${organization.recruiterName} (${organization.recruiterPosition})</div>
            <div>Email: ${organization.email}</div>
          </div>
        </div>
        <h2>Summary</h2>
        <table>
          <tr><th>Total Jobs</th><th>Total Applications</th><th>Longlisted</th><th>Shortlisted</th><th>Pending</th><th>Rejected</th></tr>
          <tr><td>${report.totals.jobs}</td><td>${report.totals.applications}</td><td>${report.totals.longlisted}</td><td>${report.totals.shortlisted}</td><td>${report.totals.pending}</td><td>${report.totals.rejected}</td></tr>
        </table>
      </body>
      </html>
    `;
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${organization.name.replace(/\s+/g, "_")}_report.html`
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  } catch (error) {
    console.error("downloadOrganizationReportPDF error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export default {
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
  // Organization authentication and management (merged from companyController)
  registerOrganization,
  loginOrganization,
  getOrganizationData,
  postJob,
  getOrganizationJobApplicants,
  getOrganizationPostedJobs,
  ChangeJobApplicationStatus,
  repostJob,
  getOrganizationStages,
  updateOrganizationStages,
  scheduleInterview,
  submitInterviewFeedback,
  getInterviewAnalytics,
  sendInterviewReminders,
  getOrganizationNotifications,
  updateOrganizationRichProfile,
  getOrganizationProfileCompleteness,
  ChangeJobVisibility,
  getOrganizationReportsSummary,
  downloadOrganizationReportExcel,
  downloadOrganizationReportPDF,
};
