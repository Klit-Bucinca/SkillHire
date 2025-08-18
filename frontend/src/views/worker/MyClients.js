/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import api from "utils/axiosInstance";

const STATUS = { Pending: 0, Accepted: 1, Rejected: 2 };

const statusFromEnum = (val) =>
  typeof val === "string"
    ? val
    : val === 1
    ? "Accepted"
    : val === 2
    ? "Rejected"
    : "Pending";

const badgeClass = (status) =>
  status === "Accepted"
    ? "bg-emerald-100 text-emerald-700"
    : status === "Rejected"
    ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-800";

export default function WorkerHireRequests() {
  const user = JSON.parse(localStorage.getItem("user")); // worker userId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // keep existing control
  const [saving, setSaving] = useState(null); // hireId while saving
  const [flash, setFlash] = useState(""); // <<< short success message

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        // hires addressed to this worker (by worker userId)
        const { data: hires } = await api.get(`/Hire/worker/${user.id}`);

        // best-effort: fetch client names
        const withClient = await Promise.all(
          hires.map(async (h) => {
            try {
              const { data: client } = await api.get(`/Users/${h.clientId}`);
              const fullName = `${client.name || ""} ${
                client.surname || ""
              }`.trim();
              return {
                ...h,
                statusText: statusFromEnum(h.status),
                clientFullName: fullName || `Client #${h.clientId}`,
                clientEmail: client.email || "",
              };
            } catch {
              return {
                ...h,
                statusText: statusFromEnum(h.status),
                clientFullName: `Client #${h.clientId}`,
                clientEmail: "",
              };
            }
          })
        );

        setRows(withClient.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (e) {
        console.error(e);
        setError("Couldn't load hire requests.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  // Existing filtered "list" honoring the top statusFilter and search box
  const list = useMemo(() => {
    const q = query.toLowerCase();
    return rows
      .filter((r) => (statusFilter === "All" ? true : r.statusText === statusFilter))
      .filter((r) => {
        const n = (r.clientFullName || "").toLowerCase();
        const e = (r.clientEmail || "").toLowerCase();
        const notes = (r.notes || "").toLowerCase();
        return n.includes(q) || e.includes(q) || notes.includes(q);
      });
  }, [rows, query, statusFilter]);

  // Pending cards section (respects whatever is in "list")
  const pendingList = useMemo(
    () => list.filter((r) => r.statusText === "Pending"),
    [list]
  );

  // Accepted table section (ALWAYS shows accepted regardless of statusFilter)
  const acceptedList = useMemo(() => {
    const q = query.toLowerCase();
    return rows
      .filter((r) => r.statusText === "Accepted")
      .filter((r) => {
        const n = (r.clientFullName || "").toLowerCase();
        const e = (r.clientEmail || "").toLowerCase();
        const notes = (r.notes || "").toLowerCase();
        return n.includes(q) || e.includes(q) || notes.includes(q);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rows, query]);

  // >>> Buttons call this
  const updateStatus = async (hireId, statusNumber) => {
    try {
      setSaving(hireId);
      await api.put(`/Hire/${hireId}`, { status: statusNumber }); // backend expects numbers

      setRows((prev) =>
        prev.map((r) =>
          r.id === hireId
            ? {
                ...r,
                statusText:
                  statusNumber === STATUS.Accepted
                    ? "Accepted"
                    : statusNumber === STATUS.Rejected
                    ? "Rejected"
                    : "Pending",
              }
            : r
        )
      );

      if (statusNumber === STATUS.Accepted) {
        setFlash("Request accepted");
        setTimeout(() => setFlash(""), 2200);
      }
    } catch (err) {
      console.error("Update failed", err.response?.data || err);
      alert(err.response?.data || "Couldn't update status. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-blueGray-50 pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blueGray-800 mb-6">Hire Requests</h1>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by client name, email, or notes…"
            className="w-full md:w-2/3 px-4 py-2 rounded-lg shadow bg-white focus:outline-none focus:ring-2 focus:ring-lightBlue-500 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-white text-sm"
          >
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
            <option>All</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-blueGray-400">Loading…</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            {/* Pending requests (cards) */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-blueGray-700 mb-3">
                Pending Requests
              </h2>
              {pendingList.length === 0 ? (
                <p className="text-blueGray-400">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingList.map((h) => (
                    <RequestRow
                      key={h.id}
                      hire={h}
                      saving={saving === h.id}
                      onAccept={() => updateStatus(h.id, STATUS.Accepted)}
                      onReject={() => updateStatus(h.id, STATUS.Rejected)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Accepted requests (table) */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-blueGray-700">
                  Accepted Requests
                </h2>
                {flash && (
                  <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {flash}
                  </span>
                )}
              </div>

              {acceptedList.length === 0 ? (
                <p className="text-blueGray-400">No accepted requests yet.</p>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                  <table className="min-w-full text-sm text-left text-blueGray-600">
                    <thead className="bg-blueGray-50 text-xs uppercase text-blueGray-500">
                      <tr>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedList.map((h) => (
                        <tr key={h.id} className="border-b border-blueGray-100">
                          <td className="px-4 py-3">{h.clientFullName}</td>
                          <td className="px-4 py-3">{h.clientEmail || "-"}</td>
                          <td className="px-4 py-3">
                            {new Date(h.date).toLocaleDateString()}{" "}
                            <span className="text-blueGray-400">
                              {new Date(h.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-3">{h.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RequestRow({ hire, onAccept, onReject, saving }) {
  const when = new Date(hire.date);
  const status = hire.statusText;

  return (
    <div className="bg-white border border-blueGray-100 rounded-lg shadow flex overflow-hidden w-full p-4">
      <div className="flex-1 pr-4 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-blueGray-700 truncate">
              {hire.clientFullName}
            </h3>
            {hire.clientEmail && (
              <p className="text-xs text-blueGray-500 truncate">
                {hire.clientEmail}
              </p>
            )}
            {hire.notes && (
              <p className="text-xs text-blueGray-600 mt-1 line-clamp-2">
                Notes: {hire.notes}
              </p>
            )}
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass(
              status
            )}`}
          >
            {status}
          </span>
        </div>
        <p className="text-[11px] text-blueGray-400 mt-1">
          {when.toLocaleDateString()}{" "}
          <span className="text-blueGray-300">
            {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={status !== "Pending" || saving}
          onClick={onAccept}
          className={`px-3 py-1 rounded text-xs font-semibold text-white ${
            status === "Pending" && !saving
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-emerald-300 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving…" : "Accept"}
        </button>
        <button
          disabled={status !== "Pending" || saving}
          onClick={onReject}
          className={`px-3 py-1 rounded text-xs font-semibold text-white ${
            status === "Pending" && !saving
              ? "bg-red-500 hover:bg-red-600"
              : "bg-red-300 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving…" : "Reject"}
        </button>
      </div>
    </div>
  );
}
