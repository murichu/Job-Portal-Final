import React, { useContext, useState, useEffect, useCallback } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, User, X, ChevronRight, Eye, EyeOff } from "lucide-react";

const UserLogin = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState("Login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [image, setImage] = useState(null);
  const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const {
    setShowUserLogin,
    backendUrl,
    setToken,
    setUserData,
    setCompanyToken,
    setCompanyData,
  } = useContext(AppContext);

  const validateForm = () => {
    const newErrors = {};
    if (formType === "Sign Up" && !formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formType === "Sign Up" && formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }, [errors]);

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

  const handleAuthSuccess = useCallback((data) => {
    localStorage.removeItem("companyToken");
    setCompanyToken(null);
    setCompanyData(null);
    setUserData(data.user);
    setToken(data.token);
    localStorage.setItem("Token", data.token);
    setShowUserLogin(false);
    toast.success(`Welcome${data.user?.name ? `, ${data.user.name.split(" ")[0]}` : ""}! 🎉`);
    navigate("/");
  }, [setCompanyData, setCompanyToken, setUserData, setToken, setShowUserLogin, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (formType === "Sign Up" && !isTextDataSubmitted) {
      setIsTextDataSubmitted(true);
      return;
    }

    setIsLoading(true);
    try {
      if (formType === "Login") {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email: formData.email,
          password: formData.password,
        });
        if (data.success) handleAuthSuccess(data);
        else toast.error(data.message);
      } else {
        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("email", formData.email);
        submitData.append("password", formData.password);
        if (image) submitData.append("image", image);

        const { data } = await axios.post(`${backendUrl}/api/user/register`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data.success) handleAuthSuccess(data);
        else toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormTypeChange = useCallback((newType) => {
    setFormType(newType);
    setIsTextDataSubmitted(false);
    setErrors({});
    setFormData({ name: "", email: "", password: "" });
    setImage(null);
    setShowPassword(false);
  }, []);

  const fillDemoUser = useCallback(() => {
    setFormType("Login");
    setIsTextDataSubmitted(false);
    setErrors({});
    setShowPassword(false);
    setFormData({
      name: "",
      email: "user1@demo.com",
      password: "SeedPass@123",
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex justify-center items-center p-4"
      onClick={(e) => e.target === e.currentTarget && setShowUserLogin(false)}
    >
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Top gradient accent */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500" />

        {/* Close */}
        <button
          onClick={() => setShowUserLogin(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          {/* Branding */}
          <div className="mb-6">
            <img src={assets.logo} alt="Logo" className="h-7 mb-4" />
            <h1 className="text-xl font-bold text-gray-900">
              {formType === "Login"
                ? "Welcome back"
                : isTextDataSubmitted
                ? "One last step"
                : "Create account"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {formType === "Login"
                ? "Sign in to find your next opportunity"
                : isTextDataSubmitted
                ? "Add a profile photo (optional)"
                : "Join thousands of job seekers"}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-3">
            {formType === "Login" && (
              <button
                type="button"
                onClick={fillDemoUser}
                className="w-full text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 py-2 hover:bg-blue-100 transition-colors"
              >
                Use Demo User Login
              </button>
            )}
            {/* Profile Photo Step */}
            {formType === "Sign Up" && isTextDataSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-3">
                <label htmlFor="user-image" className="cursor-pointer group">
                  <div className="relative w-24 h-24">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1 group-hover:border-blue-400 transition-colors">
                        <User className="w-8 h-8 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                      <span className="text-white text-base leading-none">+</span>
                    </div>
                  </div>
                  <input
                    id="user-image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    disabled={isLoading}
                  />
                </label>
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    {image ? image.name : "Click to add a photo"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">You can skip this — add it later</p>
                </div>
              </div>
            ) : (
              <>
                {formType === "Sign Up" && (
                  <div>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm"
                    }`}>
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        className="outline-none text-sm w-full bg-transparent placeholder-gray-400 text-gray-800"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        type="text"
                        placeholder="Full name"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm"
                  }`}>
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      className="outline-none text-sm w-full bg-transparent placeholder-gray-400 text-gray-800"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      type="email"
                      placeholder="Email address"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
                </div>

                <div>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm"
                  }`}>
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      className="outline-none text-sm w-full bg-transparent placeholder-gray-400 text-gray-800"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>}
                </div>

                {formType === "Login" && (
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
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm mt-2"
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {formType === "Login" ? "Signing in..." : isTextDataSubmitted ? "Creating account..." : "Processing..."}</>
              ) : formType === "Login" ? (
                <><span>Sign In</span><ChevronRight className="w-4 h-4" /></>
              ) : isTextDataSubmitted ? (
                "Finish & Create Account"
              ) : (
                <><span>Continue</span><ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5 pt-4 border-t border-gray-100">
            {formType === "Login" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => handleFormTypeChange("Sign Up")}
                  className="text-blue-600 hover:text-blue-800 font-semibold" disabled={isLoading}>
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => handleFormTypeChange("Login")}
                  className="text-blue-600 hover:text-blue-800 font-semibold" disabled={isLoading}>
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

export default UserLogin;
