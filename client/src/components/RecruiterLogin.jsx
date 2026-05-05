import React, { useContext, useState, useEffect, useCallback } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Building2, Phone, User, Briefcase, Mail, Lock, MapPin, X, ChevronRight,
} from "lucide-react";

const InputField = ({ icon: Icon, error, ...props }) => (
  <div>
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm"
    }`}>
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        className="outline-none text-sm w-full bg-transparent placeholder-gray-400 text-gray-800"
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
  </div>
);

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterPosition, setRecruiterPosition] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    setShowRecruiterLogin,
    backendUrl,
    setCompanyToken,
    setCompanyData,
    setToken,
    setUserData,
  } = useContext(AppContext);

  const handleAuthSuccess = useCallback(
    (data) => {
      localStorage.removeItem("Token");
      setToken(null);
      setUserData(null);
      setCompanyData(data.company);
      setCompanyToken(data.token);
      localStorage.setItem("companyToken", data.token);
      setShowRecruiterLogin(false);
      navigate("/dashboard");
    },
    [setCompanyData, setCompanyToken, setShowRecruiterLogin, navigate, setToken, setUserData]
  );

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (state === "Sign Up" && !isTextDataSubmitted) {
      setIsTextDataSubmitted(true);
      return;
    }

    try {
      setLoading(true);
      if (state === "Login") {
        const { data } = await axios.post(`${backendUrl}/api/company/login`, { email, password });
        data.success ? handleAuthSuccess(data) : toast.error(data.message);
      } else {
        const formPayload = new FormData();
        formPayload.append("name", name);
        formPayload.append("recruiterName", recruiterName);
        formPayload.append("recruiterPosition", recruiterPosition);
        formPayload.append("companyPhone", companyPhone);
        formPayload.append("email", email);
        formPayload.append("password", password);
        formPayload.append("companyLocation", companyLocation);
        if (image) formPayload.append("image", image);

        const { data } = await axios.post(`${backendUrl}/api/company/register`, formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        data.success ? handleAuthSuccess(data) : toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!image) { setImageUrl(null); return; }
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const handleFormTypeChange = (newType) => {
    setState(newType);
    setIsTextDataSubmitted(false);
    setName(""); setEmail(""); setPassword(""); setImage(null);
    setCompanyPhone(""); setRecruiterPosition(""); setRecruiterName(""); setCompanyLocation("");
  };

  const fillDemoRecruiter = (emailValue = "hr+1@slack.demo") => {
    setState("Login");
    setIsTextDataSubmitted(false);
    setPassword("SeedPass@123");
    setEmail(emailValue);
  };

  const stepLabels = state === "Sign Up"
    ? ["Company Info", "Upload Logo"]
    : ["Sign In"];

  const currentStep = state === "Sign Up" ? (isTextDataSubmitted ? 1 : 0) : 0;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex justify-center items-center p-4"
      onClick={(e) => e.target === e.currentTarget && setShowRecruiterLogin(false)}
    >
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

        {/* Close button */}
        <button
          onClick={() => setShowRecruiterLogin(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Recruiter Portal
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {state === "Login" ? "Welcome back" : isTextDataSubmitted ? "Upload your logo" : "Create your account"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {state === "Login"
                ? "Sign in to manage postings and candidates"
                : isTextDataSubmitted
                ? "Add a company logo to complete your profile"
                : "Set up your company account to start hiring"}
            </p>
          </div>

          {/* Step indicator for Sign Up */}
          {state === "Sign Up" && (
            <div className="flex items-center gap-2 mb-6">
              {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < currentStep
                        ? "bg-blue-600 text-white"
                        : i === currentStep
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${i === currentStep ? "text-blue-600" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 h-px ${i < currentStep ? "bg-blue-300" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <form onSubmit={onSubmitHandler} className="space-y-3">
            {state === "Login" && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillDemoRecruiter("hr+1@slack.demo")}
                  className="w-full text-xs font-medium rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 py-2 hover:bg-indigo-100 transition-colors"
                >
                  Use Demo Company (Slack)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoRecruiter("hr+2@amazon.demo")}
                  className="w-full text-xs font-medium rounded-lg border border-gray-200 bg-gray-50 text-gray-700 py-2 hover:bg-gray-100 transition-colors"
                >
                  Use Demo Company (Amazon)
                </button>
              </div>
            )}
            {/* Logo Upload Step */}
            {state === "Sign Up" && isTextDataSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <label htmlFor="recruiter-image" className="cursor-pointer group">
                  <div className="relative w-24 h-24">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Company logo preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-200 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center gap-1 group-hover:border-blue-500 transition-colors">
                        <Building2 className="w-8 h-8 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Upload</span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                      <span className="text-white text-lg leading-none">+</span>
                    </div>
                  </div>
                  <input
                    id="recruiter-image"
                    onChange={(e) => setImage(e.target.files[0])}
                    type="file"
                    accept="image/*"
                    hidden
                  />
                </label>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {image ? image.name : "Click to upload company logo"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                </div>
              </div>
            ) : (
              <>
                {state === "Sign Up" && (
                  <>
                    <InputField icon={Building2} type="text" placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <InputField icon={Phone} type="text" placeholder="Company contact number" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} required />
                    <InputField icon={MapPin} type="text" placeholder="Company location (City, Country)" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} required />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField icon={User} type="text" placeholder="Your full name" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} required />
                      <InputField icon={Briefcase} type="text" placeholder="Your position" value={recruiterPosition} onChange={(e) => setRecruiterPosition(e.target.value)} required />
                    </div>
                    <div className="border-t border-gray-100 pt-3" />
                  </>
                )}

                <InputField icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <InputField icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                {state === "Login" && (
                  <div className="text-right">
                    <button type="button" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Forgot password?
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm mt-2 transition-colors shadow-sm"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : state === "Login" ? (
                <><span>Sign In</span> <ChevronRight className="w-4 h-4" /></>
              ) : isTextDataSubmitted ? (
                "Create Account"
              ) : (
                <><span>Continue</span> <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-sm text-center text-gray-500 mt-5 pt-4 border-t border-gray-100">
            {state === "Login" ? (
              <>New to the platform?{" "}
                <button onClick={() => handleFormTypeChange("Sign Up")} className="text-blue-600 hover:text-blue-800 font-semibold">
                  Create account
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => handleFormTypeChange("Login")} className="text-blue-600 hover:text-blue-800 font-semibold">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLogin;
