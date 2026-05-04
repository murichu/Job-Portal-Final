import { useState } from "react";
import axios from "axios";

export default function Onboarding() {
  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" });

  const handleSubmit = async () => {
    await axios.post("/api/onboarding", form);
    alert("Account created! Please login.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-xl font-bold">Create Your Company</h1>
        <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
        <input placeholder="Company Name" onChange={e => setForm({...form, companyName: e.target.value})} />
        <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 w-full">Create Account</button>
      </div>
    </div>
  );
}
