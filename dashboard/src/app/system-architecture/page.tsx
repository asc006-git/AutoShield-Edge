"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Server,
  Container,
  BarChart3,
  Clock,
  ArrowDown,
  BrainCircuit,
  Radio,
  Filter,
  LineChart,
  HeartPulse,
  FileText,
  Wrench,
} from "lucide-react"
import GlassCard from "@/components/GlassCard"

interface Phase {
  id: number
  name: string
  description: string
  status: "complete" | "active"
  metric?: string
  icon: React.ReactNode
}

const phases: Phase[] = [
  {
    id: 1,
    name: "Data Acquisition",
    description: "Ingest raw CAN bus packets from vehicular network interfaces at high frequency.",
    status: "complete",
    icon: <Radio className="h-4 w-4" />,
  },
  {
    id: 2,
    name: "Preprocessing Pipeline",
    description: "Filter, normalize, and extract features from raw telemetry streams.",
    status: "complete",
    icon: <Filter className="h-4 w-4" />,
  },
  {
    id: 3,
    name: "Baseline Anomaly Detection",
    description: "Lightweight statistical baseline for quick outlier screening.",
    status: "complete",
    metric: "F1 = 0.112",
    icon: <LineChart className="h-4 w-4" />,
  },
  {
    id: 4,
    name: "Behavioral Cyber Twin",
    description: "Digital twin profiling normal ECU behavior patterns over a sliding window.",
    status: "complete",
    metric: "W = 50",
    icon: <BrainCircuit className="h-4 w-4" />,
  },
  {
    id: 5,
    name: "Behavioral Threat Detection",
    description: "Ensemble ML classifiers identifying known and zero-day attack patterns.",
    status: "complete",
    metric: "F1 = 0.815",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  {
    id: 6,
    name: "Cyber Health Score Engine",
    description: "Aggregate multi-dimensional health scoring of the vehicle's cyber posture.",
    status: "complete",
    metric: "0 \u2013 100",
    icon: <HeartPulse className="h-4 w-4" />,
  },
  {
    id: 7,
    name: "Explainable Threat Story Engine",
    description: "Generate human-readable narratives explaining detection rationale.",
    status: "active",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 8,
    name: "Self-Healing Response Agent",
    description: "Autonomous policy-driven mitigation and containment actions.",
    status: "active",
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    id: 9,
    name: "Dashboard & Integration",
    description: "Visualize telemetry, alerts, and system status in real-time.",
    status: "active",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
]

const pipelineRows: Phase[][] = [
  phases.slice(0, 3),
  phases.slice(3, 6),
  phases.slice(6, 9),
]

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const

const dataFlowSteps = [
  { label: "CAN Bus", icon: <Radio className="h-3.5 w-3.5" /> },
  { label: "Preprocessing", icon: <Filter className="h-3.5 w-3.5" /> },
  { label: "Feature Engineering", icon: <GitBranch className="h-3.5 w-3.5" /> },
  { label: "Detection", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  { label: "Health Score", icon: <HeartPulse className="h-3.5 w-3.5" /> },
  { label: "Story Engine", icon: <FileText className="h-3.5 w-3.5" /> },
  { label: "Response", icon: <Wrench className="h-3.5 w-3.5" /> },
]

const techStack = [
  { category: "Backend / ML", items: ["Python 3.11+", "scikit-learn", "pandas / NumPy", "FastAPI", "ONNX Runtime"] },
  { category: "Frontend", items: ["Next.js 16 (App Router)", "React 19", "Tailwind CSS v4", "framer-motion", "Recharts"] },
  { category: "Infrastructure", items: ["Docker / Podman", "MongoDB / Redis", "Edge Node (ARM64)", "MQTT / WebSocket"] },
]

const keyMetrics = [
  { label: "F1 Score Improvement", value: "+0.703", sub: "Baseline 0.112 \u2192 0.815" },
  { label: "Data Reduction", value: "94.7%", sub: "After preprocessing pipeline" },
  { label: "Detection Latency", value: "< 3 ms", sub: "Per-packet inference (edge)" },
  { label: "False Positive Rate", value: "< 0.01%", sub: "Adaptive threshold tuning" },
  { label: "Sliding Window", value: "W = 50", sub: "Frames for behavioral profile" },
  { label: "Health Score Range", value: "0 \u2013 100", sub: "Aggregate cyber posture" },
]

export default function SystemArchitecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-orbitron tracking-wider text-gray-100 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-gray-300" />
          SYSTEM ARCHITECTURE
        </h1>
        <p className="text-sm text-gray-500 font-mono mt-1">
          End-to-end pipeline overview of the AutoShield Edge platform &mdash; from CAN bus acquisition to autonomous
          self-healing response.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        {pipelineRows.map((row, rowIdx) => (
          <div key={rowIdx} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {row.map((phase) => (
                <motion.div key={phase.id} variants={fadeInUp}>
                  <GlassCard className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center w-7 h-7 rounded-full border text-[11px] font-bold font-orbitron ${
                            phase.status === "active"
                              ? "border-white/30 bg-white/10 text-white"
                              : "border-gray-600 bg-gray-900 text-gray-400"
                          }`}
                        >
                          {phase.id}
                        </span>
                        <span
                          className={`p-1 rounded ${
                            phase.status === "active"
                              ? "bg-white/10 text-white"
                              : "bg-gray-800/60 text-gray-400"
                          }`}
                        >
                          {phase.icon}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                          phase.status === "active"
                            ? "border-white/30 bg-white/5 text-white"
                            : "border-gray-700 bg-gray-900 text-gray-500"
                        }`}
                      >
                        {phase.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider mb-1">
                      {phase.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono leading-relaxed flex-1">
                      {phase.description}
                    </p>
                    {phase.metric && (
                      <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Gauge className="h-3 w-3 text-gray-500" />
                        {phase.metric}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
            {rowIdx < pipelineRows.length - 1 && (
              <div className="flex justify-center">
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <span className="w-16 h-px bg-white/10" />
                  <ArrowDown className="h-4 w-4" />
                  <span className="w-16 h-px bg-white/10" />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-4" hoverable={false}>
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <GitBranch className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider">
              DATA FLOW
            </h3>
          </div>
          <div className="space-y-0">
            {dataFlowSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-700 bg-gray-900 text-gray-400">
                    {step.icon}
                  </span>
                  <span className="text-xs font-mono text-gray-300">{step.label}</span>
                </motion.div>
                {i < dataFlowSteps.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="h-3 w-3 text-gray-600" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-4" hoverable={false}>
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <Server className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider">
              TECHNOLOGY STACK
            </h3>
          </div>
          <div className="space-y-4">
            {techStack.map((group) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 text-[11px] font-mono bg-white/5 border border-white/10 rounded text-gray-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-4" hoverable={false}>
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-orbitron font-semibold text-gray-200 tracking-wider">
              KEY METRICS
            </h3>
          </div>
          <div className="space-y-3">
            {keyMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div>
                  <p className="text-xs font-mono text-gray-400">{metric.label}</p>
                  <p className="text-[10px] font-mono text-gray-600">{metric.sub}</p>
                </div>
                <span className="text-sm font-orbitron font-bold text-gray-100 tracking-wider">
                  {metric.value}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
