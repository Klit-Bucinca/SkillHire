
import React, { useEffect, useState } from "react";
import api from "utils/axiosInstance";

const backendUrl = "https://localhost:7109";

export default function WorkerProfilePage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState({
    userId: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    yearsExperience: "",
    profilePhoto: "",
    services: [],
  });
  const [allServices, setAllServices] = useState([]);
  const [editMode, setEditMode] = useState({});


  useEffect(() => {
    (async () => {
      try {
        const [profileRes, userRes, serviceRes] = await Promise.all([
          api.get(`/WorkerProfile/user/${user.id}`),
          api.get(`/Users/${user.id}`),
          api.get(`/Service`),
        ]);

        setProfile((prev) => ({
          ...prev,
          ...profileRes.data, 
          fullName: `${userRes.data.name} ${userRes.data.surname}`,
          email: userRes.data.email,
        }));

        setAllServices(serviceRes.data);
        setEditMode({
          fullName: false,
          email: false,
          phone: false,
          city: false,
          yearsExperience: false,
        });
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    })();
  }, [user.id]);


  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = async (field) => {
    if (editMode[field]) {
      try {
        await api.put(`/WorkerProfile/${profile.id}`, {
          ...profile,
          userId: user.id,
        });
        alert("Profile updated");
      } catch (err) {
        console.error("Update error:", err);
      }
    }
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleServiceChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setProfile((prev) => ({ ...prev, services: selected }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(`/WorkerProfile/${profile.id}/upload-photo`, formData);
      setProfile((prev) => ({ ...prev, profilePhoto: res.data.photoUrl }));
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto mt-4 shadow-xl rounded-xl overflow-hidden bg-white/70 backdrop-blur-lg">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 mt-8">
            <img
              src={
                profile.profilePhoto
                  ? `${backendUrl}${profile.profilePhoto}`
                  : "/img/placeholder.jpg"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg ring-4 ring-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-20 px-8 pb-10 space-y-8">
          {/* Upload profile photo */}
          <div className="text-center">
            <input
              type="file"
              onChange={handlePhotoUpload}
              className="block mx-auto text-sm text-gray-600 file:rounded-full file:border-0 file:bg-purple-600 file:text-white file:px-4 file:py-2 file:cursor-pointer"
            />
          </div>

          {/* Editable fields */}
          {["fullName", "email", "phone", "city", "yearsExperience"].map((field) => (
            <div key={field} className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="w-40 font-medium capitalize text-gray-700">
                {field.replace(/([A-Z])/g, " $1")}:
              </label>
              <input
                name={field}
                value={profile[field] || ""}
                readOnly={!editMode[field]}
                onChange={handleFieldChange}
                className={`flex-1 px-4 py-2 rounded-md border focus:outline-none shadow-sm transition ${
                  !editMode[field]
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white focus:ring-2 focus:ring-purple-500"
                }`}
                type={field === "yearsExperience" ? "number" : "text"}
              />
              <button
                onClick={() => handleToggleEdit(field)}
                className={`text-sm px-4 py-1 rounded-lg transition duration-200 ${
                  editMode[field]
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {editMode[field] ? "Save" : "Edit"}
              </button>
            </div>
          ))}

          {/* Services list */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-700">Services Offered:</h4>

            {profile.services?.length ? (
              <ul className="list-disc list-inside space-y-1">
                {profile.services.map((svc) => (
                  <li key={svc}>{svc}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No services added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
