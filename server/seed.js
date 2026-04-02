import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Company from "./models/Company.js";
import Job from "./models/Job.js";
import JobApplication from "./models/JobApplication.js";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Connect DB
await mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("MongoDB connected");

// Common password for all
const COMMON_PASSWORD = "Raje1680!@#$";
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, salt);

// ====== Seed Companies ======
const companies = [
  {
    name: "TechCorp",
    email: "hr@techcorp.com",
    password: hashedPassword,
    image: "https://example.com/logo1.png",
    recruiterName: "Alice Johnson",
    recruiterPosition: "HR Manager",
    companyPhone: "123-456-7890",
    companyLocation: "New York, USA",
    isVerified: true,
  },
  {
    name: "InnovateX",
    email: "recruit@innovatex.com",
    password: hashedPassword,
    image: "https://example.com/logo2.png",
    recruiterName: "Bob Smith",
    recruiterPosition: "Recruitment Lead",
    companyPhone: "987-654-3210",
    companyLocation: "San Francisco, USA",
    isVerified: false,
  },
];

// ====== Seed Users ======
const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: hashedPassword,
    image: "https://example.com/user1.png",
    resume: "",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: hashedPassword,
    image: "https://example.com/user2.png",
    resume: "",
  },
];

// ====== Seed Jobs ======
const jobs = [
  {
    title: "Frontend Developer",
    description: "Build amazing UIs",
    location: "Remote",
    category: "Software",
    level: "Mid",
    salary: 80000,
    date: new Date(),
    visible: true,
    companyId: null, // will assign after inserting companies
  },
  {
    title: "Backend Engineer",
    description: "Work on APIs and databases",
    location: "New York",
    category: "Software",
    level: "Senior",
    salary: 120000,
    date: new Date(),
    visible: true,
    companyId: null,
  },
];

const seedDB = async () => {
  try {
    await Company.deleteMany();
    await User.deleteMany();
    await Job.deleteMany();
    await JobApplication.deleteMany();

    const createdCompanies = await Company.insertMany(companies);
    const createdUsers = await User.insertMany(users);

    // Assign jobs to first company
    jobs.forEach((job) => (job.companyId = createdCompanies[0]._id));
    const createdJobs = await Job.insertMany(jobs);

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
