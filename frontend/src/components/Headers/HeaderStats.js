/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import api from "utils/axiosInstance";
import CardStats from "components/Cards/CardStats";

export default function HeaderStatsAdmin() {
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

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // live refresh when hires/users change
  useEffect(() => {
    const onChanged = () => fetchStats();
    window.addEventListener("hires:changed", onChanged);
    window.addEventListener("users:changed", onChanged); // optional: dispatch after register
    return () => {
      window.removeEventListener("hires:changed", onChanged);
      window.removeEventListener("users:changed", onChanged);
    };
  }, [fetchStats]);

  const n = (v) => (loading ? "…" : (v ?? 0).toString());
  const pctText = (v) => (loading || v == null ? "" : `${Math.abs(v).toFixed(1)}%`);
  const arrow = (v) => (v >= 0 ? "up" : "down");
  const color = (v) => (v >= 0 ? "text-emerald-500" : "text-red-500");

  return (
    <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap">
          {/* Users Registered */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="USERS REGISTERED"
              statTitle={n(stats?.usersTotal)}
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="All users in the system"
              statIconName="fas fa-users"
              statIconColor="bg-indigo-500"
            />
          </div>

          {/* Requests (Total hires) */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="REQUESTS (TOTAL)"
              statTitle={n(stats?.totalHires)}
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="All hire requests"
              statIconName="fas fa-clipboard-list"
              statIconColor="bg-lightBlue-500"
            />
          </div>

          {/* Pending */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="PENDING"
              statTitle={n(stats?.pending)}
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="Awaiting worker action"
              statIconName="fas fa-hourglass-half"
              statIconColor="bg-yellow-500"
            />
          </div>

          {/* Acceptance Rate */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
            <CardStats
              statSubtitle="ACCEPTANCE RATE"
              statTitle={loading ? "…" : `${(stats?.acceptanceRate ?? 0).toFixed(0)}%`}
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="Accepted / Decided"
              statIconName="fas fa-percentage"
              statIconColor="bg-emerald-500"
            />
          </div>

          {/* (Optional) 7d Δ of total requests */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 mt-4">
            <CardStats
              statSubtitle="TOTAL REQUESTS (7D Δ)"
              statTitle={loading ? "…" : ""}
              statArrow={stats ? arrow(stats.totalDelta7d) : ""}
              statPercent={stats ? pctText(stats.totalDelta7d) : ""}
              statPercentColor={stats ? color(stats.totalDelta7d) : ""}
              statDescripiron="Change vs previous 7 days"
              statIconName="fas fa-chart-line"
              statIconColor="bg-pink-500"
            />
          </div>

          {/* (Optional) Active Workers (30d) */}
          <div className="w-full lg:w-6/12 xl:w-3/12 px-4 mt-4">
            <CardStats
              statSubtitle="ACTIVE WORKERS (30D)"
              statTitle={n(stats?.activeWorkers30d)}
              statArrow=""
              statPercent=""
              statPercentColor=""
              statDescripiron="Workers who handled ≥1 hire"
              statIconName="fas fa-user-cog"
              statIconColor="bg-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
