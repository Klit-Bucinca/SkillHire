import React, { useEffect, useState } from "react";
import api from "utils/axiosInstance";

export default function MyServices() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [allServices, setAllServices] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, categoryRes, profileRes] = await Promise.all([
          api.get("/Service"),
          api.get("/Category"),
          api.get(`/WorkerProfile/user/${user.id}`),
        ]);

        setAllServices(serviceRes.data);
        setCategories(categoryRes.data);
        setMyServices(profileRes.data.services);
        setProfileId(profileRes.data.id);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchData();
  }, [user.id]);

  const handleAddService = async () => {
    const selectedService = allServices.find((s) => s.id === selectedServiceId);
    if (!selectedService || myServices.includes(selectedService.name)) return;

    try {
      await api.post("/WorkerService", {
        workerProfileId: profileId,
        serviceName: selectedService.id,
      });

      setMyServices((prev) => [...prev, selectedService.name]);
      setSelectedServiceId(null);
    } catch (err) {
      console.error("Error adding service", err);
    }
  };

  const handleRemoveService = async (serviceName) => {
    try {
      await api.delete("/WorkerService", {
        data: {
          workerProfileId: profileId,
          serviceName,
        },
      });
      setMyServices((prev) => prev.filter((s) => s !== serviceName));
    } catch (err) {
      console.error("Error removing service", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Manage Your Services</h2>

      {/* Section 1: Select from all existing services */}
      <div className="bg-white rounded shadow p-4 mb-10">
        <h3 className="font-medium mb-3">Available Services</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Select</th>
                <th className="py-2 px-4">Service</th>
                <th className="py-2 px-4">Category</th>
              </tr>
            </thead>
            <tbody>
              {allServices.map((service) => (
                <tr key={service.id} className="border-b">
                  <td className="py-2 px-4">
                    <input
                      type="radio"
                      name="selectedService"
                      value={service.id}
                      checked={selectedServiceId === service.id}
                      onChange={() => setSelectedServiceId(service.id)}
                    />
                  </td>
                  <td className="py-2 px-4">{service.name}</td>
                  <td className="py-2 px-4">
                    {categories.find((c) => c.id === service.categoryId)?.name || "Uncategorized"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={handleAddService}
          className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
        >
          Add Selected Service
        </button>
      </div>

      {/* Section 2: My services table */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-medium mb-3">Services You Offer</h3>
        {myServices.length === 0 ? (
          <p className="text-gray-500">You haven’t added any services yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Service</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myServices.map((svc, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{svc}</td>
                  <td>
                    <button
                      onClick={() => handleRemoveService(svc)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
