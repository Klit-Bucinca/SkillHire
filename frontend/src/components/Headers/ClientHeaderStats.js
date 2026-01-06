import React, { useEffect, useState } from "react";
import api from "utils/axiosInstance";
import CardStats from "components/Cards/CardStats.js";

export default function HeaderStats() {
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        // Client role doesn't need to send clientId; server derives from JWT
        const { data } = await api.get("/Hire/client/stats");
        setStats({
          pending: data?.pending ?? 0,
          accepted: data?.accepted ?? 0,
          rejected: data?.rejected ?? 0,
          total: data?.total ?? 0,
        });
      } catch (e) {
        console.error(e);
        setErr("Couldn't load your hire stats.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helpers for titles while loading
  const fmt = (n) => (loading ? "…" : String(n));

  return (
    <>
      {/* Header */}
      <div
        className="relative bg-lightBlue-600"
        style={{ paddingTop: "5rem", paddingBottom: "4rem" }}
      >
        <div className="px-4 md:px-10 mx-auto w-full">
          {err && (
            <p className="mb-4 text-white/90 text-sm bg-white/10 rounded px-3 py-2 inline-block">
              {err}
            </p>
          )}
          {/* Card stats */}
          <div className="flex flex-wrap">
            {/* Pending */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="PENDING"
                statTitle={fmt(stats.pending)}
                statArrow="up"             
                statPercent=""            
                statPercentColor="text-emerald-500"
                statDescripiron="Hire Requests awaiting response"
                statIconName="fas fa-hourglass-half"
                statIconColor="bg-yellow-500"
              />
            </div>

            {/* Accepted */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="ACCEPTED"
                statTitle={fmt(stats.accepted)}
                statArrow="up"
                statPercent=""
                statPercentColor="text-emerald-500"
                statDescripiron="Requests accepted by workers"
                statIconName="fas fa-check-circle"
                statIconColor="bg-emerald-500"
              />
            </div>

            {/* Rejected */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="REJECTED"
                statTitle={fmt(stats.rejected)}
                statArrow="down"
                statPercent=""
                statPercentColor="text-red-500"
                statDescripiron="Requests rejected by workers"
                statIconName="fas fa-times-circle"
                statIconColor="bg-red-500"
              />
            </div>

            {/* Total */}
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="TOTAL"
                statTitle={fmt(stats.total)}
                statArrow="up"
                statPercent=""
                statPercentColor="text-emerald-500"
                statDescripiron="Overall requests sent"
                statIconName="fas fa-list-ol"
                statIconColor="bg-lightBlue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
