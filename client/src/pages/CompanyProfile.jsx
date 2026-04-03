import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const CompanyProfile = () => {
  const { companyData, backendUrl, api, fetchCompanyData } = useContext(AppContext);
  const [form, setForm] = useState({
    recruiterName: "",
    recruiterPosition: "",
    companyPhone: "",
    companyLocation: "",
    website: "",
    about: "",
    culture: "",
    benefits: "",
    teamHighlights: "",
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyData) return;
    setForm({
      recruiterName: companyData.recruiterName || "",
      recruiterPosition: companyData.recruiterPosition || "",
      companyPhone: companyData.companyPhone || "",
      companyLocation: companyData.companyLocation || "",
      website: companyData.website || "",
      about: companyData.about || "",
      culture: companyData.culture || "",
      benefits: Array.isArray(companyData.benefits) ? companyData.benefits.join(", ") : "",
      teamHighlights: Array.isArray(companyData.teamHighlights) ? companyData.teamHighlights.join(", ") : "",
    });
  }, [companyData]);

  const onSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append("image", image);
      const { data } = await api.post(`${backendUrl}/api/company/update-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success("Company profile updated");
        fetchCompanyData();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Company Profile</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2" placeholder="Recruiter name" value={form.recruiterName} onChange={(e) => setForm((p) => ({ ...p, recruiterName: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2" placeholder="Recruiter position" value={form.recruiterPosition} onChange={(e) => setForm((p) => ({ ...p, recruiterPosition: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2" placeholder="Company phone" value={form.companyPhone} onChange={(e) => setForm((p) => ({ ...p, companyPhone: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2" placeholder="Company location" value={form.companyLocation} onChange={(e) => setForm((p) => ({ ...p, companyLocation: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 sm:col-span-2" placeholder="Website" value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
          <textarea className="border rounded-lg px-3 py-2 sm:col-span-2" rows={3} placeholder="About company" value={form.about} onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 sm:col-span-2" placeholder="Culture" value={form.culture} onChange={(e) => setForm((p) => ({ ...p, culture: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2" placeholder="Benefits (comma separated)" value={form.benefits} onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2" placeholder="Team highlights (comma separated)" value={form.teamHighlights} onChange={(e) => setForm((p) => ({ ...p, teamHighlights: e.target.value }))} />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="border rounded-lg px-3 py-2 sm:col-span-2" />
        </div>
        <button onClick={onSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
          {saving ? "Saving..." : "Save Company Profile"}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;
