/* eslint-disable */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import api from "utils/axiosInstance";

const backendUrl = "https://localhost:7109";

export default function HireWorker() {
  const history = useHistory();
  const [workers, setWorkers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [active, setActive] = useState(null);

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
      workers.filter((w) => {
        const full = (w.fullName || "").toLowerCase();
        const combined = `${w.name || ""} ${w.surname || ""}`.toLowerCase();
        const city = (w.city || "").toLowerCase();
        const services = (w.services || []).join(" ").toLowerCase();
        return full.includes(term) || combined.includes(term) || city.includes(term) || services.includes(term);
      })
    );
  }, [search, workers]);

  return (
    <div className="min-h-screen bg-blueGray-50 pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
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
              <WorkerRow key={w.id} worker={w} onView={() => setActive(w)} />
            ))}
          </div>
        )}
      </div>

      {active && <WorkerModal worker={active} onClose={() => setActive(null)} onHire={() => history.push(`/client/worker/${active.id}`)} />}
    </div>
  );
}

function WorkerModal({ worker, onClose, onHire }) {
  const displayName = worker.fullName || `${worker.name || ""} ${worker.surname || ""}`.trim();
  const photoUrl = worker.profilePhoto ? `${backendUrl}${worker.profilePhoto}` : "/img/placeholder.jpg";
  const photos = worker.photos || [];
  const servicesCount = worker.services ? worker.services.length : 0;
  const photosCount = photos.length;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-auto max-h-[90vh] p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-blueGray-800">Worker Profile</h2>
          <button onClick={onClose} className="text-blueGray-400 hover:text-blueGray-600 text-xl">&times;</button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <img src={photoUrl} alt="profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow mb-2" />
          <h3 className="text-xl font-semibold text-blueGray-700">{displayName}</h3>
          <div className="flex flex-col sm:flex-row gap-1 text-sm text-blueGray-500 mt-1">
            <span><i className="fas fa-map-marker-alt mr-1" />{worker.city || "Unknown"}</span>
            {worker.phone && <span className="sm:ml-4"><i className="fas fa-phone mr-1" />{worker.phone}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-blueGray-600 mb-6">
          {worker.yearsExperience && <p><strong>{worker.yearsExperience}</strong> years of experience</p>}
          <p><strong>{servicesCount}</strong> services offered</p>
          <p><strong>{photosCount}</strong> portfolio photos</p>
        </div>

        {worker.services?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {worker.services.map((s) => (
              <span key={s} className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        {photosCount > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {photos.map((p) => (
              <div key={p.id} className="space-y-1">
                <img
                  src={p.imageUrl.startsWith("http") ? p.imageUrl : `${backendUrl}${p.imageUrl}`}
                  alt="work"
                  className="w-full h-32 object-cover rounded shadow"
                />
                {p.description && <p className="text-[12px] text-blueGray-500 truncate">{p.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blueGray-400 mb-6">No portfolio photos yet.</p>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-blueGray-100 rounded hover:bg-blueGray-200">Close</button>
          <button onClick={onHire} className="px-5 py-2 text-sm bg-lightBlue-500 text-white rounded hover:bg-lightBlue-600">Hire</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function WorkerRow({ worker, onView }) {
  const displayName = worker.fullName || `${worker.name || ""} ${worker.surname || ""}`.trim() || "Unnamed Worker";
  const photoUrl = worker.profilePhoto ? `${backendUrl}${worker.profilePhoto}` : "/img/placeholder.jpg";
  const thumbs = (worker.photos || []).slice(0, 3);
  const hiddenCount = (worker.photos || []).length - 3;
  const serviceSentence = worker.services?.length ? `Provides ${worker.services.slice(0, 3).join(", ")}${worker.services.length > 3 ? " and more" : ""}` : null;

  return (
    <div className="bg-white border border-blueGray-100 rounded-lg shadow flex overflow-hidden w-full p-4">
      <div className="w-40 h-40 flex-shrink-0 overflow-hidden rounded-md">
        <img src={photoUrl} alt="cover" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 px-5 flex flex-col justify-between text-sm">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-blueGray-700 truncate">{displayName}</h3>
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
        {serviceSentence && <p className="text-[11px] text-blueGray-500 mt-2 line-clamp-2">{serviceSentence}</p>}
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
            {hiddenCount > 0 && (
              <div className="w-16 h-16 bg-blueGray-200 text-xs text-blueGray-600 flex items-center justify-center rounded">
                +{hiddenCount}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center pl-4">
        <button onClick={onView} className="bg-lightBlue-500 hover:bg-lightBlue-600 text-white text-xs font-semibold px-4 py-2 rounded">
          View & Hire
        </button>
      </div>
    </div>
  );
}
