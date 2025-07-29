/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import api from "utils/axiosInstance";

const msg = (err) =>
  err?.response?.data?.message ??
  (typeof err?.response?.data === "object"
    ? JSON.stringify(err.response.data)
    : err?.response?.data) ??
  err?.message ??
  "Unexpected error";

export default function MyServices() {
  const user = JSON.parse(localStorage.getItem("user"));


  const [allServices, setAllServices] = useState([]);
  const [categories, setCategories]   = useState([]);

  const [profileId, setProfileId] = useState(null);
  const [myNames,   setMyNames]   = useState([]);

  const [pickId, setPickId] = useState(null);
  const [busy,   setBusy]   = useState(false);

  /* sort */
  const [sortBy,  setSortBy]  = useState("name");  
  const [sortDir, setSortDir] = useState("asc");  


  const load = async () => {
    const [svc, cat, prof] = await Promise.all([
      api.get("/Service"),
      api.get("/Category"),
      api.get(`/WorkerProfile/user/${user.id}`),
    ]);
    setAllServices(svc.data);
    setCategories(cat.data);
    setProfileId(prof.data.id);
    setMyNames(prof.data.services);
    setPickId(null);
  };
  useEffect(() => { load(); }, []);


  const sorted = useMemo(() => {
    const keyed = allServices.map((s) => ({
      ...s,
      categoryName: categories.find((c) => c.id === s.categoryId)?.name ?? "",
    }));
    const dir = sortDir === "asc" ? 1 : -1;
    return keyed.sort((a, b) => {
      const A = sortBy === "name" ? a.name : a.categoryName;
      const B = sortBy === "name" ? b.name : b.categoryName;
      return A.localeCompare(B) * dir;
    });
  }, [allServices, categories, sortBy, sortDir]);

 
  const onAdd = async () => {
    const svc = allServices.find((s) => s.id === pickId);
    if (!svc || myNames.includes(svc.name)) return;
    setBusy(true);
    try {
      await api.post("/WorkerService", {
        workerProfileId: profileId,
        serviceId: svc.id,
      });
      await load();
    } catch (err) {
      alert(msg(err));
    } finally {
      setBusy(false);
    }
  };


  const onRemove = async (name) => {
    const svc = allServices.find((s) => s.name === name);
    if (!svc) return;
    setBusy(true);
    try {
      await api.delete(`/WorkerService/${profileId}/${svc.id}`);
      await load();
    } catch (err) {
      alert(msg(err));
    } finally {
      setBusy(false);
    }
  };


  return (

    <div className="min-h-screen pt-32 px-4 md:px-10 w-full">
      <h2 className="text-xl font-semibold mb-6">Manage Your Services</h2>

      {/* ───────── Available services ─────────────────── */}
      <div className="bg-white rounded shadow p-4 mb-10 w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Available Services</h3>

          <div className="space-x-2 text-sm">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-4 py-1"
            >
              <option value="name">Service name</option>
              <option value="category">Category name</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              className="border rounded px-5 py-1"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Pick</th>
                <th className="py-2 px-4">Service</th>
                <th className="py-2 px-4">Category</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2 px-4">
                    <input
                      type="radio"
                      checked={pickId === s.id}
                      onChange={() => setPickId(s.id)}
                    />
                  </td>
                  <td className="py-2 px-4">{s.name}</td>
                  <td className="py-2 px-4">
                    {categories.find((c) => c.id === s.categoryId)?.name ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onAdd}
          disabled={!profileId || !pickId || busy}
          className={`mt-4 px-4 py-2 rounded text-white ${
            profileId && pickId && !busy
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {busy ? "Working…" : "Add selected"}
        </button>
      </div>

      {/* ───────── Services you offer ─────────────────── */}
      <div className="bg-white rounded shadow p-4 w-full">
        <h3 className="font-medium mb-3">Services You Offer</h3>

        {myNames.length === 0 ? (
          <p className="text-gray-500">You haven’t added any services yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Service</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {myNames.map((n) => (
                <tr key={n} className="border-b">
                  <td className="py-2">{n}</td>
                  <td>
                    <button
                      onClick={() => onRemove(n)}
                      disabled={busy}
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
