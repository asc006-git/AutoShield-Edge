"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import GlassCard from "@/components/GlassCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Radio,
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Search,
  Filter,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const pipelineSteps = [
  { icon: Radio, label: "CAN Messages", desc: "Raw bus packet ingestion" },
  { icon: Activity, label: "Behavioral Features", desc: "Statistical feature extraction" },
  { icon: AlertTriangle, label: "Anomaly Detection", desc: "Isolation Forest ensemble" },
  { icon: Brain, label: "Attack Classification", desc: "Weighted consensus voting" },
  { icon: CheckCircle, label: "Confidence Score", desc: "SHAP attribution & calibration" },
];

const featureImportance = [
  { name: "Frequency Variance", contribution: 0.28 },
  { name: "Payload Entropy", contribution: 0.22 },
  { name: "Inter-Msg Gap Delta", contribution: 0.18 },
  { name: "Payload Byte Variance", contribution: 0.15 },
  { name: "CAN ID Range", contribution: 0.12 },
  { name: "Signal Drift Rate", contribution: 0.05 },
];

const severityOptions = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export default function ThreatDetectionPage() {
  const { vehicleStats, threatLogs } = useDashboard();

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const filteredLogs = useMemo(() => {
    return threatLogs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.canId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity =
        severityFilter === "ALL" || log.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [threatLogs, searchQuery, severityFilter]);

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-white/20 text-white border-white/30";
      case "HIGH": return "bg-white/10 text-gray-300 border-white/20";
      case "MEDIUM": return "bg-white/5 text-gray-400 border-white/10";
      default: return "bg-black/30 text-gray-500 border-white/5";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE": return "text-white font-bold";
      case "MITIGATING": return "text-gray-300";
      case "MITIGATED": return "text-gray-400";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold font-orbitron tracking-wider text-gray-100 flex items-center gap-2">
          <Activity className="h-6 w-6 text-gray-300" />
          THREAT DETECTION ENGINE
        </h1>
        <p className="text-sm text-gray-500 font-mono mt-1">
          Machine learning detection pipeline — Isolation Forest ensemble processing CAN bus telemetry at the edge.
        </p>
      </div>

      <GlassCard hoverable={false} className="overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-2">
          {pipelineSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                  <step.icon className="h-5 w-5 text-gray-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-orbitron font-semibold tracking-wider text-gray-200 truncate">
                    {step.label}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 truncate">
                    {step.desc}
                  </div>
                </div>
              </motion.div>
              {idx < pipelineSteps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                  className="hidden lg:flex items-center flex-shrink-0"
                >
                  <motion.div
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-5 w-5 text-gray-600" />
                  </motion.div>
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">DETECTION LATENCY</span>
              <span className="text-2xl font-bold font-orbitron tracking-wide mt-1 block text-gray-100">
                {vehicleStats.inferenceLatency} ms
              </span>
            </div>
            <span className="p-2 rounded bg-white/5 border border-white/10 text-gray-400">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-gray-600">
            <span>SLA: &lt;5.00 ms</span>
            <span className="text-gray-400">EDGE</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">F1 SCORE</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-orbitron tracking-wide text-gray-100">
                  0.815
                </span>
                <span className="text-sm font-mono text-gray-600 line-through">0.112</span>
              </div>
            </div>
            <span className="p-2 rounded bg-white/5 border border-white/10 text-gray-400">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-gray-600">
            <span>Improvement</span>
            <span className="text-gray-300">+0.703</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">RECALL</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-orbitron tracking-wide text-gray-100">
                  68.93%
                </span>
                <span className="text-sm font-mono text-gray-600 line-through">6.43%</span>
              </div>
            </div>
            <span className="p-2 rounded bg-white/5 border border-white/10 text-gray-400">
              <Activity className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-gray-600">
            <span>Improvement</span>
            <span className="text-gray-300">+62.50%</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">PRECISION</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-orbitron tracking-wide text-gray-100">
                  94.21%
                </span>
                <span className="text-sm font-mono text-gray-600 line-through">36.07%</span>
              </div>
            </div>
            <span className="p-2 rounded bg-white/5 border border-white/10 text-gray-400">
              <CheckCircle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-gray-600">
            <span>Improvement</span>
            <span className="text-gray-300">+58.14%</span>
          </div>
        </GlassCard>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <GlassCard className="lg:col-span-5 flex flex-col" hoverable={false}>
          <div className="border-b border-white/5 pb-3 mb-4">
            <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              FEATURE IMPORTANCE
            </h3>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
              Top behavioral features — SHAP attribution scores
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={featureImportance}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    type="number"
                    stroke="#525252"
                    fontSize={10}
                    fontFamily="monospace"
                    domain={[0, 0.35]}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#d1d5db"
                    fontSize={10}
                    fontFamily="monospace"
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 10, 10, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, "Contribution"]}
                  />
                  <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                    {featureImportance.map((entry, index) => {
                      const intensity = Math.min(255, Math.round(128 + entry.contribution * 400));
                      const gray = intensity.toString(16).padStart(2, "0");
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={`rgb(${intensity}, ${intensity}, ${intensity})`}
                          fillOpacity={0.6 + entry.contribution * 0.4}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-gray-600">
            <span>Features ranked by mean SHAP value across ensemble</span>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-7 flex flex-col" hoverable={false}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                CLASSIFICATION TABLE
              </h3>
              <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                {filteredLogs.length} of {threatLogs.length} events
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search CAN ID / type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-44 pl-8 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex rounded-lg overflow-hidden border border-white/10 p-0.5 bg-black/40 text-[10px] font-mono">
                {severityOptions.map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2 py-1 transition-all ${
                      severityFilter === sev
                        ? "bg-white/15 text-white font-semibold"
                        : "text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    {sev === "ALL" ? "ALL" : sev.charAt(0) + sev.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-white/5 rounded-lg bg-black/20 flex-1">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-black/60 text-gray-500 border-b border-white/5 font-orbitron tracking-wider text-[10px] uppercase">
                  <th className="p-3 font-normal">Timestamp</th>
                  <th className="p-3 font-normal">CAN ID</th>
                  <th className="p-3 font-normal">Type</th>
                  <th className="p-3 font-normal">Score</th>
                  <th className="p-3 font-normal">Severity</th>
                  <th className="p-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-600 font-mono text-xs">
                      No matching threat events found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`transition-colors duration-200 ${
                        log.status === "ACTIVE"
                          ? "bg-white/[0.03]"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="p-3 whitespace-nowrap text-gray-400">{log.timestamp}</td>
                      <td className="p-3 whitespace-nowrap text-gray-200 font-semibold">{log.canId}</td>
                      <td className="p-3 whitespace-nowrap text-gray-300">{log.type}</td>
                      <td className="p-3 whitespace-nowrap text-gray-200">
                        {(log.anomalyScore * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold ${getSeverityClass(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`text-[11px] ${getStatusClass(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>

    </div>
  );
}
