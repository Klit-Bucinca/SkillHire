import React, { useEffect, useState, useCallback } from "react";
import api from "utils/axiosInstance";
import CardStats from "components/Cards/CardStats";

export default function HeaderStatsManager() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/Hire/admin/stats");
      setStats(data);
    } catch (e) {
      console.error("Failed to load admin stats", e);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchStats();
  }, [fetchStats]);


  useEffect(() => {
    const onChanged = () => {
      console.log("hires:changed → refreshing manager stats");
      fetchStats();
    };
    window.addEventListener("hires:changed", onChanged);
    return () => window.removeEventListener("hires:changed", onChanged);
  }, [fetchStats]);

  const n = (v) => (loading ? "…" : (v ?? 0).toString());
  const pct = (v) =>
    loading || v == null ? "" : `${Math.abs(v).toFixed(1)}%`;
  const arrow = (v) => (v >= 0 ? "up" : "down");
  const color = (v) => (v >= 0 ? "text-emerald-500" : "text-red-500");

  return (
    <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap">
          {/* Pending */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="PENDING"
              statTitle={n(stats?.pending)}
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="Awaiting response"
              statIconName="fas fa-hourglass-half"
              statIconColor="bg-yellow-500"
            />
          </div>

          {/* Accepted */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="ACCEPTED"
              statTitle={n(stats?.accepted)}
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="All accepted requests"
              statIconName="fas fa-check-circle"
              statIconColor="bg-emerald-500"
            />
          </div>

          {/* Acceptance Rate */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="ACCEPTANCE RATE"
              statTitle={
                loading
                  ? "…"
                  : `${(stats?.acceptanceRate ?? 0).toFixed(0)}%`
              }
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="Accepted / Decided"
              statIconName="fas fa-percentage"
              statIconColor="bg-indigo-500"
            />
          </div>

          {/* Total 7d Delta */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="TOTAL (7D Δ)"
              statTitle={loading ? "…" : ""}
              statArrow={stats ? arrow(stats.totalDelta7d) : ""}
              statPercent={stats ? pct(stats.totalDelta7d) : ""}
              statPercentColor={stats ? color(stats.totalDelta7d) : ""}
              statDescripiron="Change vs last week"
              statIconName="fas fa-chart-line"
              statIconColor="bg-lightBlue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
