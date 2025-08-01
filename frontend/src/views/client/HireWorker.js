/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "utils/axiosInstance";

const backendUrl = "https://localhost:7109";

export default function HireWorker() {
  const history = useHistory();

  const [workers, setWorkers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/WorkerProfile");
        setWorkers(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      workers.filter((w) =>
        (w.fullName || "").toLowerCase().includes(term) ||
        (w.city || "").toLowerCase().includes(term) ||
        (w.services || []).some((s) => s.toLowerCase().includes(term))
      )
    );
  }, [search, workers]);


  return (
    <div className="min-h-screen bg-blueGray-50 pt-32 pb-12 px-4">
      
      <div className="max-w-4xl mx-auto">
        {/* Search bar */}
        <div className="flex justify-center mb-10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workers…"
            className="w-full md:w-2/3 px-5 py-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-lightBlue-500 bg-white text-sm"
          />
        </div>

        {busy ? (
          <p className="text-center text-blueGray-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-blueGray-400">No workers found.</p>
        ) : (
          <div className="space-y-8 mx-auto max-w-3xl">
            {filtered.map((w) => (
              <WorkerRow key={w.id} worker={w} onView={() => history.push(`/client/worker/${w.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function WorkerRow({ worker, onView }) {
  // derive display name
  const displayName = worker.fullName || `${worker.name || ""} ${worker.surname || ""}`.trim() || "Unnamed Worker";

  const cover = worker.photos?.[0]?.imageUrl || worker.profilePhoto;
  const photoUrl = cover ? (cover.startsWith("http") ? cover : `${backendUrl}${cover}`) : "/img/placeholder.jpg";

  const thumbs = (worker.photos || []).slice(1, 3);
  const serviceSentence = worker.services?.length
    ? `Provides ${worker.services.slice(0, 3).join(", ")}${worker.services.length > 3 ? " and more" : ""}`
    : null;

  return (
    <div className="bg-white border border-blueGray-100 rounded-lg shadow flex overflow-hidden w-full p-4">
      {/* square cover image 160×160 */}
      <div className="w-40 h-40 flex-shrink-0 overflow-hidden rounded-md">
        <img src={photoUrl} alt="cover" className="w-full h-full object-cover" />
      </div>

      {/* content */}
      <div className="flex-1 px-5 flex flex-col justify-between text-sm">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-blueGray-700 truncate">
              {worker.fullName || "Unnamed Worker"}
            </h3>
            <p className="text-blueGray-400 text-xs flex items-center gap-1 mt-0.5">
              <i className="fas fa-map-marker-alt" /> {worker.city || "Unknown"}
            </p>
          </div>
          {worker.yearsExperience && (
            <span className="text-[10px] bg-lightBlue-100 text-lightBlue-600 font-semibold px-2 py-0.5 rounded self-start whitespace-nowrap">
              {worker.yearsExperience} yrs
            </span>
          )}
        </div>

        {/* services chips */}
        {worker.services?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 text-[11px]">
            {worker.services.slice(0, 4).map((s) => (
              <span key={s} className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">
                {s}
              </span>
            ))}
            {worker.services.length > 4 && (
              <span className="text-blueGray-400">+{worker.services.length - 4}</span>
            )}
          </div>
        )}

        {serviceSentence && (
          <p className="text-[11px] text-blueGray-500 mt-2 line-clamp-2">
            {serviceSentence}
          </p>
        )}

        {/* thumbnails */}
        {thumbs.length > 0 && (
          <div className="flex gap-2 mt-3">
            {thumbs.map((p) => (
              <img
                key={p.id}
                src={p.imageUrl.startsWith("http") ? p.imageUrl : `${backendUrl}${p.imageUrl}`}
                alt="thumb"
                className="w-16 h-16 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center pl-4">
        <button
          onClick={onView}
          className="bg-lightBlue-500 hover:bg-lightBlue-600 text-white text-xs font-semibold px-4 py-2 rounded"
        >
          Hire
        </button>
      </div>
    </div>
  );
}
