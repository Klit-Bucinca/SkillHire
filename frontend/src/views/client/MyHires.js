/* eslint-disable */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "utils/axiosInstance";

const backendUrl = "https://localhost:7109";

const statusFromEnum = (val) => {
  if (typeof val === "string") return val;
  switch (val) {
    case 0:
      return "Pending";
    case 1:
      return "Accepted";
    case 2:
      return "Rejected";
    default:
      return String(val);
  }
};

const badgeClass = (status) =>
  status === "Accepted"
    ? "bg-emerald-100 text-emerald-700"
    : status === "Rejected"
    ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-800";

export default function MyHires() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchHires = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data: hires } = await api.get(`/Hire/client/${user.id}`);
      const { data: profiles } = await api.get("/WorkerProfile");

      const byUserId = new Map(profiles.map((p) => [p.userId, p]));
      const merged = hires.map((h) => ({
        ...h,
        statusText: statusFromEnum(h.status),
        profile: byUserId.get(h.workerId) || null,
      }));

      setRows(merged);
    } catch (err) {
      console.error("Failed to load hires", err);
      setError("Couldn't load your hires. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchHires();

    // 🔔 listen for changes (hires:changed event)
    const onChanged = () => {
      console.log("hires:changed → refreshing MyHires");
      fetchHires();
    };
    window.addEventListener("hires:changed", onChanged);

    return () => window.removeEventListener("hires:changed", onChanged);
  }, [fetchHires]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows
      .filter((r) =>
        statusFilter === "All" ? true : r.statusText === statusFilter
      )
      .filter((r) => {
        const name = (r.profile?.fullName || "").toLowerCase();
        const city = (r.profile?.city || "").toLowerCase();
        const notes = (r.notes || "").toLowerCase();
        return name.includes(q) || city.includes(q) || notes.includes(q);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rows, query, statusFilter]);

  return (
    <div className="min-h-screen bg-blueGray-50 pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blueGray-800 mb-6">My Hires</h1>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by worker, city, or notes…"
            className="w-full md:w-2/3 px-4 py-2 rounded-lg shadow bg-white focus:outline-none focus:ring-2 focus:ring-lightBlue-500 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-white text-sm"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-blueGray-400">Loading…</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-blueGray-400">No hires found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((h) => (
              <HireRow key={h.id} hire={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HireRow({ hire }) {
  const p = hire.profile;
  const status = hire.statusText;
  const photoUrl = p?.profilePhoto
    ? p.profilePhoto.startsWith("http")
      ? p.profilePhoto
      : `${backendUrl}${p.profilePhoto}`
    : "/img/placeholder.jpg";

  const name = p?.fullName || "Worker";
  const city = p?.city || "Unknown";
  const when = new Date(hire.date);

  return (
    <div className="bg-white border border-blueGray-100 rounded-lg shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={photoUrl}
          alt="avatar"
          className="w-40 h-40 rounded-md object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-blueGray-700 truncate">{name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass(
                status
              )}`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-blueGray-500">
            {city} • {when.toLocaleDateString()}{" "}
            <span className="text-blueGray-400">
              {when.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
          {status === "Accepted" && p?.phone && (
            <a
              href={"tel:" + p.phone}
              className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium w-fit"
            >
              <i className="fas fa-phone" />
              <span>{p.phone}</span>
            </a>
          )}
          {hire.notes && (
            <p className="text-xs text-blueGray-600 mt-1 truncate">
              Notes: {hire.notes}
            </p>
          )}
        </div>
      </div>
      {p?.photos?.length > 0 && (
        <div className="hidden sm:flex gap-1 ml-4">
          {p.photos.slice(0, 2).map((ph) => (
            <img
              key={ph.id}
              src={
                ph.imageUrl.startsWith("http")
                  ? ph.imageUrl
                  : `${backendUrl}${ph.imageUrl}`
              }
              alt="work"
              className="w-12 h-12 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}
