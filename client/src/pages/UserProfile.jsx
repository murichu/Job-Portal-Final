import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const UserProfile = () => {
  const { userData, backendUrl, api, fetchUserData } = useContext(AppContext);
  const [name, setName] = useState(userData?.name || "");
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);
      const { data } = await api.post(`${backendUrl}/api/user/update-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success("Profile updated");
        fetchUserData();
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
    <>
      <Navbar />
      <div className="container px-4 2xl:px-20 mx-auto my-10 max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Candidate Profile</h1>
          <div className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Full name"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              disabled={saving}
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
