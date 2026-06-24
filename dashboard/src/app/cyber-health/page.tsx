"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import CyberHealthGauge from "@/components/CyberHealthGauge";
import { GlassCard } from "@/components/GlassCard";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, Shield, Activity, AlertTriangle,
  BarChart3, Target, BrainCircuit, Sigma
} from "lucide-react";

function getRiskCategory(score: number) {
  if (score >= 80) return { label: "Secure", sub: "All systems nominal", band: "Secure" };
  if (score >= 60) return { label: "Stable", sub: "Minor deviations detected", band: "Stable" };
  if (score >= 40) return { label: "Warning", sub: "Elevated risk factors", band: "Warning" };
  if (score >= 20) return { label: "High Risk", sub: "Significant threats present", band: "High Risk" };
  return { label: "Critical", sub: "Immediate action required", band: "Critical" };
}

function computeTrend(current: number, previous: number): { label: string; icon: React.ReactNode; color: string } {
  const diff = current - previous;
  if (diff > 2) return { label: "Improving", icon: <TrendingUp className="h-4 w-4" />, color: "text-gray-300" };
  if (diff < -2) return { label: "Degrading", icon: <TrendingDown className="h-4 w-4" />, color: "text-gray-500" };
  return { label: "Stable", icon: <Minus className="h-4 w-4" />, color: "text-gray-400" };
}

const THREAT_WEIGHT = 0.4;
const STABILITY_WEIGHT = 0.3;
const PRESSURE_WEIGHT = 0.3;

function computeComponents(score: number) {
  const threat = Math.max(0, Math.min(40, 40 - (100 - score) * 0.35));
  const stability = Math.max(0, Math.min(30, score * 0.28));
  const pressure = Math.max(0, Math.min(30, 30 - (100 - score) * 0.25));
  return { threat: Math.round(threat), stability: Math.round(stability), pressure: Math.round(pressure) };
}

function generateForecast(baseScore: number, count: number) {
  const forecast: { window: number; projected: number; band: string }[] = [];
  let val = baseScore;
  for (let i = 1; i <= count; i++) {
    const drift = (Math.random() - 0.5) * 6;
    val = Math.max(0, Math.min(100, val + drift));
    const band = getRiskCategory(val).band;
    forecast.push({ window: i, projected: Math.round(val), band });
  }
  return forecast;
}

export default function CyberHealthPage() {
  const { healthScore } = useDashboard();

  const [history, setHistory] = useState<{ time: string; score: number }[]>([]);
  const [forecast, setForecast] = useState<{ window: number; projected: number; band: string }[]>([]);
  const [previousScore, setPreviousScore] = useState(healthScore);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setHistory((prev) => {
        const next = [...prev, { time: timeStr, score: healthScore }];
        if (next.length > 30) next.shift();
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [healthScore]);

  useEffect(() => {
    const timer = setInterval(() => {
      setForecast(generateForecast(healthScore, 10));
    }, 5000);
    setForecast(generateForecast(healthScore, 10));
    return () => clearInterval(timer);
  }, [healthScore]);

  useEffect(() => {
    setPreviousScore(healthScore);
  }, [healthScore]);

  const components = useMemo(() => computeComponents(healthScore), [healthScore]);
  const risk = useMemo(() => getRiskCategory(healthScore), [healthScore]);
  const trend = useMemo(() => computeTrend(healthScore, previousScore), [healthScore, previousScore]);

  const riskBands = [
    { min: 80, max: 100, label: "Secure", fill: "rgba(255,255,255,0.06)" },
    { min: 60, max: 80, label: "Stable", fill: "rgba(255,255,255,0.04)" },
    { min: 40, max: 60, label: "Warning", fill: "rgba(255,255,255,0.03)" },
    { min: 20, max: 40, label: "High Risk", fill: "rgba(0,0,0,0.15)" },
    { min: 0, max: 20, label: "Critical", fill: "rgba(0,0,0,0.2)" },
  ];

  const thresholdData = [
    { label: "Secure", range: "80 – 100", color: "text-gray-200" },
    { label: "Stable", range: "60 – 79", color: "text-gray-300" },
    { label: "Warning", range: "40 – 59", color: "text-gray-400" },
    { label: "High Risk", range: "20 – 39", color: "text-gray-500" },
    { label: "Critical", range: "0 – 19", color: "text-gray-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-orbitron tracking-wider text-gray-100 flex items-center gap-2">
          <Activity className="h-6 w-6 text-gray-300" />
          CYBER HEALTH ANALYTICS
        </h1>
        <p className="text-sm text-gray-400 font-mono mt-1">
          Multi-dimensional vehicle health scoring engine. Real-time immunity posture assessment.
        </p>
      </div>

      <div className="flex flex-col items-center py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <CyberHealthGauge score={healthScore} size={280} animated />
        </motion.div>

        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-xl font-orbitron font-bold tracking-widest text-gray-200">
            {risk.label.toUpperCase()}
          </div>
          <div className="text-sm font-mono text-gray-500 mt-1">{risk.sub}</div>
          <div className={`flex items-center justify-center gap-1.5 mt-2 text-sm font-mono ${trend.color}`}>
            {trend.icon}
            <span>{trend.label}</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-5 w-5 text-gray-300" />
            <span className="text-xs font-orbitron font-semibold tracking-wider text-gray-300">THREAT COMPONENT</span>
          </div>
          <div className="text-2xl font-bold font-orbitron tracking-wide text-gray-100 mb-2">
            {components.threat}<span className="text-sm font-mono text-gray-500">/40</span>
          </div>
          <div className="h-2.5 bg-black/40 border border-white/5 rounded-full overflow-hidden p-[1px]">
            <motion.div
              className="h-full bg-gray-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(components.threat / 40) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs font-mono text-gray-500 mt-2">
            Inverse anomaly density score
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-5 w-5 text-gray-300" />
            <span className="text-xs font-orbitron font-semibold tracking-wider text-gray-300">STABILITY COMPONENT</span>
          </div>
          <div className="text-2xl font-bold font-orbitron tracking-wide text-gray-100 mb-2">
            {components.stability}<span className="text-sm font-mono text-gray-500">/30</span>
          </div>
          <div className="h-2.5 bg-black/40 border border-white/5 rounded-full overflow-hidden p-[1px]">
            <motion.div
              className="h-full bg-gray-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(components.stability / 30) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs font-mono text-gray-500 mt-2">
            Signal variance & drift resilience
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="h-5 w-5 text-gray-300" />
            <span className="text-xs font-orbitron font-semibold tracking-wider text-gray-300">PRESSURE COMPONENT</span>
          </div>
          <div className="text-2xl font-bold font-orbitron tracking-wide text-gray-100 mb-2">
            {components.pressure}<span className="text-sm font-mono text-gray-500">/30</span>
          </div>
          <div className="h-2.5 bg-black/40 border border-white/5 rounded-full overflow-hidden p-[1px]">
            <motion.div
              className="h-full bg-gray-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(components.pressure / 30) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs font-mono text-gray-500 mt-2">
            Bus load & resource pressure index
          </div>
        </GlassCard>
      </div>

      <GlassCard hoverable={false}>
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
          <Activity className="h-5 w-5 text-gray-300" />
          <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider">HEALTH TIMELINE</h3>
          <span className="text-[10px] font-mono text-gray-600 ml-auto">Rolling 30-window view</span>
        </div>
        <div className="w-full h-64 bg-black/20 rounded-lg p-2 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              {riskBands.map((band) => (
                <ReferenceArea
                  key={band.label}
                  y1={band.min}
                  y2={band.max}
                  fill={band.fill}
                  stroke="none"
                />
              ))}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" stroke="#4b5563" fontSize={9} fontFamily="monospace" />
              <YAxis domain={[0, 100]} stroke="#4b5563" fontSize={9} fontFamily="monospace" tickCount={6} />
              {[20, 40, 60, 80].map((v) => (
                <ReferenceLine key={v} y={v} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
              ))}
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color: "#fff",
                }}
                formatter={(value: any) => [`${value}`, "Health Score"]}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#ffffff"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#healthGradient)"
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[10px] font-mono">
          {riskBands.map((band) => (
            <div key={band.label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded border border-white/10"
                style={{ background: band.fill }}
              />
              <span className="text-gray-500">{band.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard hoverable={false}>
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-300" />
          <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider">HEALTH FORECAST</h3>
          <span className="text-[10px] font-mono text-gray-600 ml-auto">Next 10 windows projected</span>
        </div>
        <div className="w-full h-48 bg-black/20 rounded-lg p-2 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              {riskBands.map((band) => (
                <ReferenceArea
                  key={band.label}
                  y1={band.min}
                  y2={band.max}
                  fill={band.fill}
                  stroke="none"
                />
              ))}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="window" stroke="#4b5563" fontSize={9} fontFamily="monospace" label={{ value: "Window", position: "insideBottomRight", offset: -5, style: { fill: "#6b7280", fontSize: 9 } }} />
              <YAxis domain={[0, 100]} stroke="#4b5563" fontSize={9} fontFamily="monospace" tickCount={6} />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#ffffff"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: "#ffffff", strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 1, fill: "#000" }}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard hoverable={false}>
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
          <BrainCircuit className="h-5 w-5 text-gray-300" />
          <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider">SCORING METHODOLOGY</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sigma className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-orbitron font-semibold tracking-wider text-gray-300">COMPOSITE FORMULA</span>
            </div>
            <div className="p-4 bg-black/40 border border-white/5 rounded-lg font-mono text-sm text-center">
              <span className="text-gray-200 font-semibold">CyberHealth</span>
              <span className="text-gray-500"> = </span>
              <span className="text-gray-300">Threat(40%)</span>
              <span className="text-gray-500"> + </span>
              <span className="text-gray-400">Stability(30%)</span>
              <span className="text-gray-500"> + </span>
              <span className="text-gray-500">Pressure(30%)</span>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono text-gray-400">
              <p className="flex items-start gap-2">
                <Target className="h-3.5 w-3.5 text-gray-300 mt-0.5 shrink-0" />
                <span><strong className="text-gray-300">Threat (40%):</strong> Measures inverse anomaly density. Higher values indicate fewer intrusion signals per window.</span>
              </p>
              <p className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span><strong className="text-gray-300">Stability (30%):</strong> Evaluates signal variance, inter-message gap consistency, and payload drift resilience.</span>
              </p>
              <p className="flex items-start gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-gray-500 mt-0.5 shrink-0" />
                <span><strong className="text-gray-300">Pressure (30%):</strong> Bus load index factoring CAN packet rate, CPU utilization, and memory pressure relative to baseline.</span>
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-orbitron font-semibold tracking-wider text-gray-300">RISK CATEGORY THRESHOLDS</span>
            </div>
            <div className="overflow-hidden border border-white/5 rounded-lg bg-black/30">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-black/60 text-gray-400 border-b border-white/5 font-orbitron tracking-wider text-[10px]">
                    <th className="p-3">CATEGORY</th>
                    <th className="p-3">SCORE RANGE</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {thresholdData.map((row) => (
                    <tr key={row.label} className="hover:bg-white/5 transition-colors">
                      <td className={`p-3 font-semibold ${row.color}`}>{row.label}</td>
                      <td className="p-3 text-gray-400 font-mono">{row.range}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          row.label === "Secure" ? "border-gray-300 text-gray-200 bg-white/5" :
                          row.label === "Stable" ? "border-gray-400 text-gray-300 bg-white/5" :
                          row.label === "Warning" ? "border-gray-500 text-gray-400 bg-white/5" :
                          row.label === "High Risk" ? "border-gray-600 text-gray-500 bg-black/40" :
                          "border-gray-700 text-gray-600 bg-black/40"
                        }`}>
                          {row.label === "Secure" ? "Nominal" :
                           row.label === "Stable" ? "Monitoring" :
                           row.label === "Warning" ? "Elevated" :
                           row.label === "High Risk" ? "Critical" : "Emergency"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
