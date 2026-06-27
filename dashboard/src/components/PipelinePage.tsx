"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipeline, StageData } from "@/context/PipelineContext";
import { ATTACKS } from "@/constants/attacks";
import {
  Play, RotateCcw, ShieldCheck, Cpu,
  Terminal, ShieldAlert, HeartPulse, LineChart, FileText,
  Wrench, Activity, HelpCircle, CheckCircle2, Zap
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import CyberHealthGauge from "@/components/CyberHealthGauge";

interface FeatureItem {
  name: string;
  value: number;
  description?: string;
  is_anomalous?: boolean;
}

interface ActionItem {
  name?: string;
  action?: string;
  description?: string;
  detail?: string;
  id?: string;
  target?: string;
  automated?: boolean;
}

export default function PipelinePage() {
  const {
    pipelineStatus,
    currentStageIndex,
    selectedAttack,
    setSelectedAttack,
    stages,
    summary,
    allLogs,
    runSimulation,
    resetSimulation,
    pipelineError,
  } = usePipeline();

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allLogs]);

  const handleStart = async () => {
    await runSimulation(selectedAttack);
  };

  const isRunning = pipelineStatus === "running";
  const isCompleted = pipelineStatus === "completed";
  // activeStage = the LAST COMPLETED stage (to display its full data/reasoning in center panel)
  const activeStage = currentStageIndex > 0 && currentStageIndex <= stages.length ? stages[currentStageIndex - 1] : null;
  // processingStageNum = the NEXT stage being worked on by the backend (shown as "PROCESSING" in timeline)
  const processingStageNum = isRunning && currentStageIndex < 9 ? currentStageIndex + 1 : 0;

  const getStageIcon = (stageName: string, active: boolean) => {
    const size = "h-4.5 w-4.5";
    const color = active ? "text-white" : "text-gray-500";
    switch (stageName) {
      case "data_acquisition": return <Activity className={`${size} ${color}`} />;
      case "sliding_window": return <Cpu className={`${size} ${color}`} />;
      case "feature_extraction": return <LineChart className={`${size} ${color}`} />;
      case "threat_detection": return <ShieldAlert className={`${size} ${color}`} />;
      case "cyber_health": return <HeartPulse className={`${size} ${color}`} />;
      case "shap_explainability": return <Cpu className={`${size} ${color}`} />;
      case "threat_story": return <FileText className={`${size} ${color}`} />;
      case "defense_agent": return <Wrench className={`${size} ${color}`} />;
      case "vehicle_recovery": return <ShieldCheck className={`${size} ${color}`} />;
      default: return <HelpCircle className={`${size} ${color}`} />;
    }
  };

  // All values originate from backend response — derived from completed stages
  // so KPI values persist after a stage is passed, not just while it's active.
  const completedStages = stages.filter(s => s.status === "complete");
  const latestWithEcu = [...completedStages].reverse().find(s => s.data?.ecu_status != null);
  const latestWithHealth = [...completedStages].reverse().find(s => s.data?.health_score != null);
  const latestWithThreats = [...completedStages].reverse().find(s => s.data?.threat_count != null);
  const ecuStatus = latestWithEcu?.data?.ecu_status;
  const healthScore = latestWithHealth?.data?.health_score;
  const measuredMs = activeStage?.data?.duration_ms;
  const activeThreatCount = latestWithThreats?.data?.threat_count;
  const hasActiveThreat = activeThreatCount != null ? activeThreatCount > 0 : false;
  const estimatedRemaining = activeStage?.data?.estimated_remaining_seconds ?? null;

  // Determine if specific backend stages have completed yet
  const cyberHealthStageReached = currentStageIndex >= 5; // Stage 5 = cyber_health
  const threatDetectionReached = currentStageIndex >= 4; // Stage 4 = threat_detection

  return (
    <div className="space-y-6">
      {pipelineError && (
        <div className="px-4 py-2 rounded border border-red-500/30 bg-red-500/5 flex items-center gap-2 text-[10px] font-mono text-red-400">
          <span className="h-3 w-3 flex-shrink-0 inline-flex items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[8px] font-bold">!</span>
          Pipeline error: {pipelineError}
        </div>
      )}
      {/* Top Section: Attack Selection & Control */}
      <GlassCard className="flex flex-col gap-4 border border-white/10" hoverable={false}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-sm font-orbitron font-bold tracking-widest text-white uppercase">
              Pipeline Demonstration Controls
            </h2>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
              Select a cyber attack scenario and run inference pipeline sequentially
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetSimulation}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all font-mono text-[10px]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              RESET
            </button>
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-white text-black hover:bg-white/95 disabled:bg-white/40 disabled:text-black/50 font-orbitron font-bold text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              RUN SIMULATION
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5">
          {ATTACKS.map((atk) => {
            const isSelected = selectedAttack === atk.id;
            return (
              <button
                key={atk.id}
                onClick={() => !isRunning && setSelectedAttack(atk.id)}
                disabled={isRunning}
                className={`text-left p-3 rounded-lg border transition-all ${isSelected ? "border-white bg-white/[0.05]" : "border-white/[0.05] bg-black/30 hover:border-white/20"} disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-orbitron font-bold tracking-wider ${isSelected ? "text-white" : "text-gray-400"}`}>
                    {atk.label}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-white/10"}`} />
                </div>
                <p className="text-[8px] font-mono text-gray-500 mt-1 line-clamp-1 leading-tight">{atk.desc}</p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* KPI Bar — shows neutral states until backend stage data is available */}
      {currentStageIndex > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard className="flex items-center gap-3 py-2 px-4" hoverable={false}>
            <HeartPulse className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">Cyber Health</p>
              <p className="text-sm font-orbitron font-bold text-white">
                {cyberHealthStageReached && healthScore != null ? `${healthScore}%` : "—"}
              </p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3 py-2 px-4" hoverable={false}>
            <Activity className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">ECU Status</p>
              <p className={`text-sm font-orbitron font-bold ${ecuStatus === "compromised" ? "text-white" : ecuStatus === "warn" ? "text-gray-300" : "text-gray-500"}`}>
                {ecuStatus != null ? ecuStatus.toUpperCase() : "—"}
              </p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3 py-2 px-4" hoverable={false}>
            <ShieldAlert className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">Threats</p>
              <p className="text-sm font-orbitron font-bold text-white">
                {threatDetectionReached
                  ? (hasActiveThreat ? `${activeThreatCount} ACTIVE` : "0")
                  : "—"}
              </p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3 py-2 px-4" hoverable={false}>
            <Zap className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">Stage</p>
              <p className="text-sm font-orbitron font-bold text-white">{currentStageIndex}/9</p>
            </div>
            {estimatedRemaining != null && pipelineStatus === "running" && (
              <span className="ml-auto text-[8px] font-mono text-gray-500">
                ~{estimatedRemaining}s left
              </span>
            )}
          </GlassCard>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Pipeline Animation */}
        <div className="lg:col-span-4 space-y-3">
          <GlassCard className="h-full border border-white/10" hoverable={false}>
            <h3 className="text-xs font-orbitron tracking-widest text-gray-400 mb-4 uppercase">
              Sequential Pipeline Node Flow
            </h3>
            <div className="relative pl-8 space-y-4">
              <div className="absolute left-[13px] top-4 bottom-4 w-px bg-white/10" />
              {(isRunning || isCompleted) && (
                <motion.div
                  className="absolute left-[13px] top-4 w-px bg-white"
                  animate={{ height: `${isCompleted ? 100 : (completedStages.length > 0 ? (completedStages.length / 9) * 100 : 0)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              )}
              {stages.map((stage, idx) => {
                const stageNum = idx + 1;
                const isComplete = stage.status === "complete";
                const isProcessing = stageNum === processingStageNum;
                const isPending = stage.status === "pending" && !isProcessing;
                let nodeBorder = "border-white/10 bg-black";
                let textColor = "text-gray-600";
                if (isProcessing) {
                  nodeBorder = "border-white bg-white/[0.08] shadow-[0_0_15px_rgba(255,255,255,0.2)]";
                  textColor = "text-white font-bold";
                } else if (isComplete) {
                  nodeBorder = "border-white/40 bg-white/[0.02]";
                  textColor = "text-gray-400";
                } else if (isPending) {
                  nodeBorder = "border-white/10 bg-black";
                  textColor = "text-gray-600";
                }
                return (
                  <div key={stage.stage} className="relative flex items-center gap-3">
                    <div className={`absolute left-[-27px] w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${nodeBorder}`}>
                      {isProcessing ? (
                        <motion.div
                          className="absolute inset-[-3px] rounded-full border border-white/40"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      ) : null}
                      {getStageIcon(stage.stage, isProcessing || isComplete)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-orbitron tracking-wider ${textColor}`}>
                          {stageNum}. {stage.label}
                        </span>
                        {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" />}
                        {isProcessing && (
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="text-[8px] font-mono text-white tracking-widest"
                          >
                            PROCESSING
                          </motion.span>
                        )}
                        {isPending && (
                          <span className="text-[8px] font-mono text-gray-700 tracking-widest">PENDING</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Column 2: Stage Content */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {activeStage ? (
              <motion.div
                key={currentStageIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
              >
                <GlassCard className="min-h-[420px] flex flex-col border border-white/10" hoverable={false}>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                        STAGE {currentStageIndex} / 9 — {activeStage.data?.duration_ms?.toFixed(2) ?? "—"}ms
                      </span>
                      <h3 className="text-sm font-orbitron font-bold tracking-wider text-white mt-0.5">
                        {activeStage.label}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-mono border rounded ${ecuStatus === "compromised" ? "border-white/30 bg-white/10 text-white" : ecuStatus === "warn" ? "border-white/20 bg-white/5 text-gray-300" : "border-white/10 bg-white/[0.02] text-gray-400"}`}>
                      ECU: {ecuStatus != null ? ecuStatus.toUpperCase() : "—"}
                    </span>
                  </div>

                  {/* Stage Explanation Section */}
                  {activeStage.purpose && (
                    <div className="mb-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg text-[9px] font-mono space-y-2 leading-relaxed">
                      <div>
                        <span className="text-gray-600 font-semibold tracking-wider">PURPOSE:</span>
                        <span className="text-gray-400 ml-1">{activeStage.purpose}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-semibold tracking-wider">INPUTS:</span>
                        <span className="text-gray-400 ml-1">{activeStage.inputs}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-semibold tracking-wider">OUTPUTS:</span>
                        <span className="text-gray-400 ml-1">{activeStage.outputs}</span>
                      </div>
                      {activeStage.ai_reasoning && activeStage.ai_reasoning !== "Data ingestion — no AI applied" && activeStage.ai_reasoning !== "N/A" && (
                        <div>
                          <span className="text-gray-600 font-semibold tracking-wider">AI REASONING:</span>
                          <span className="text-gray-400 ml-1">{activeStage.ai_reasoning}</span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-white/5 mt-2">
                        <span className="text-white font-semibold tracking-wide">DECISION: </span>
                        <span className="text-white/80">{activeStage.decision}</span>
                      </div>
                    </div>
                  )}

                  {/* Stage-Specific Data Display */}
                  <div className="space-y-2 flex-1">
                    <StageDataRenderer stage={activeStage} healthScore={healthScore} />
                  </div>

                  {/* Timing footer */}
                  <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600">
                    <span>BACKEND EXECUTION TIME</span>
                    <span>{measuredMs?.toFixed(3) ?? "—"}ms (backend measured)</span>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center p-6 border border-white/5 rounded-xl bg-black/40">
                <ShieldCheck className="h-12 w-12 text-gray-800 mb-4" />
                <h4 className="text-xs font-orbitron tracking-widest text-gray-400 uppercase">
                  {pipelineStatus === "running" ? "Running Simulation..." : "Waiting for Simulation"}
                </h4>
                <p className="text-[10px] font-mono text-gray-600 max-w-xs mt-1.5 leading-relaxed">
                  {pipelineStatus === "running"
                    ? "Executing behavior twin inference pipeline. Waiting for backend response..."
                    : <>Select a cyber attack scenario above and click <span className="text-gray-400 font-semibold">RUN SIMULATION</span> to trigger real-time AI pipeline inference.</>}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: Log Console */}
        <div className="lg:col-span-3">
          <GlassCard className="h-[420px] flex flex-col border border-white/10 p-4" hoverable={false}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
              <Terminal className="h-3.5 w-3.5 text-gray-400" />
              <h3 className="text-xs font-orbitron tracking-widest text-gray-400 uppercase">
                Edge Inference Log
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[9px] text-gray-400 leading-snug">
              {allLogs.length > 0 ? (
                allLogs.slice(-100).map((evt, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-gray-600">
                      <span>[{evt.timestamp}]</span>
                      <span className={evt.level === "CRITICAL" ? "text-white font-bold" : evt.level === "WARN" ? "text-gray-300 font-semibold" : "text-gray-500"}>
                        {evt.level}
                      </span>
                    </div>
                    <p className={evt.level === "CRITICAL" ? "text-white font-semibold bg-white/5 px-1 py-0.5 rounded" : evt.level === "WARN" ? "text-gray-300" : "text-gray-400"}>
                      {evt.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-gray-700">
                  <span>console idle...</span>
                </div>
              )}
              <div ref={consoleEndRef} />
            </div>
            <div className="pt-2 border-t border-white/5 text-right text-[8px] font-mono text-gray-600">
              BUFFER: {allLogs.length} LINES
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Execution Summary */}
      <AnimatePresence>
        {isCompleted && summary && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="pt-2"
          >
            <GlassCard className="border border-white/10" hoverable={false}>
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <h3 className="text-xs font-orbitron tracking-widest text-white uppercase">
                  Pipeline Execution Summary
                </h3>
              </div>

              {/* Execution Flow Graph */}
              <div className="mb-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <p className="text-[9px] font-mono text-gray-600 mb-2 tracking-wider">EXECUTION FLOW</p>
                <p className="text-[9px] font-mono text-gray-300 leading-relaxed">
                  {summary.execution_graph}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono mb-4">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Attack Type</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide uppercase">{summary.attack_type}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Detection</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide uppercase">{summary.detection_status}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Target ECU</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide">{summary.affected_ecu} ({summary.affected_ecu_name})</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Health Delta</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide">{summary.health_before}% → {summary.health_during}% → {summary.health_after}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono mb-4">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Model Used</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide">{summary.model_used || "—"}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Features Extracted</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide">{summary.features_extracted_count ?? "—"}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Recovery Time</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide">{summary.recovery_time_ms}ms</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Final State</span>
                  <span className="text-white font-bold text-xs mt-1 block tracking-wide uppercase">{summary.final_vehicle_state}</span>
                </div>
              </div>

              {/* Detection Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[10px] font-mono">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Anomaly Score</span>
                  <span className="text-white font-bold text-xs mt-1 block">{summary.anomaly_score}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Confidence</span>
                  <span className="text-white font-bold text-xs mt-1 block">{(summary.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                  <span className="text-gray-500 block">Top Anomaly Driver</span>
                  <span className="text-white font-bold text-xs mt-1 block">{summary.top_anomaly_driver}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageDataRenderer({ stage, healthScore }: { stage: StageData; healthScore: number | undefined }) {
  const d = stage.data;

  // Extract threat/stability/pressure components safely
  const threatComp = d.threat_component ?? d.threatComponent;
  const stabilityComp = d.stability_component ?? d.stabilityComponent;
  const pressureComp = d.pressure_component ?? d.pressureComponent;

  switch (stage.stage) {
    case "data_acquisition":
      return (
        <div className="space-y-2 text-[10px] font-mono">
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Ingress Interface</span>
            <span className="text-white">{d.can_bus_interface}</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Total Dataset Windows</span>
            <span className="text-white">{d.total_windows_in_dataset?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Attack Type Windows</span>
            <span className="text-white">{d.attack_type_windows?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">ECUs Audited</span>
            <span className="text-white">{d.ecus_detected} nodes active</span>
          </div>
        </div>
      );

    case "sliding_window":
      return (
        <div className="space-y-2 text-[10px] font-mono">
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Window Size (W)</span>
            <span className="text-white font-semibold">{d.window_size} CAN frames</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Windows Generated</span>
            <span className="text-white">{d.windows_generated?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Overlap</span>
            <span className="text-white">{d.overlap}%</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Strategy</span>
            <span className="text-white">{d.strategy}</span>
          </div>
        </div>
      );

    case "feature_extraction":
      return (
        <div className="space-y-2">
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
            Extracted Feature Values (Active Window)
          </p>
          <div className="max-h-56 overflow-y-auto pr-1 space-y-1 text-[10px] font-mono">
            {d.features?.map((feat: FeatureItem) => (
              <div key={feat.name} className="flex justify-between py-1 px-1.5 bg-white/[0.01] border border-white/5 rounded">
                <span className="text-gray-400">{feat.name}</span>
                <span className="text-white font-semibold">{feat.value}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "threat_detection":
      return (
        <div className="space-y-2.5 text-[10px] font-mono">
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Classification</span>
            <span className={`font-bold ${d.classification === "anomaly" ? "text-white" : "text-gray-400"}`}>
              {d.classification?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Anomaly Score</span>
            <span className="text-white font-semibold">{d.anomaly_score}</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Confidence</span>
            <span className="text-white font-semibold">{d.confidence != null ? `${(d.confidence * 100).toFixed(1)}%` : "—"}</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Threshold</span>
            <span className="text-white">{d.threshold != null ? d.threshold : d.threshold_method}</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Model</span>
            <span className="text-white">{d.model}</span>
          </div>
        </div>
      );

    case "cyber_health":
      return (
        <div className="space-y-3 flex flex-col items-center">
          <CyberHealthGauge
            score={d.health_score ?? 0}
            size={150}
            showDetails={false}
            threatComponent={threatComp}
            stabilityComponent={stabilityComp}
            pressureComponent={pressureComp}
          />
          <div className="w-full space-y-1.5 text-[10px] font-mono">
            <div className="flex justify-between py-1 px-2 bg-white/[0.02] rounded">
              <span className="text-gray-500">Threat</span>
              <span className="text-white">{d.threat_component != null ? `${d.threat_component} / 40` : "—"}</span>
            </div>
            <div className="flex justify-between py-1 px-2 bg-white/[0.02] rounded">
              <span className="text-gray-500">Stability</span>
              <span className="text-white">{d.stability_component != null ? `${d.stability_component} / 30` : "—"}</span>
            </div>
            <div className="flex justify-between py-1 px-2 bg-white/[0.02] rounded">
              <span className="text-gray-500">Pressure</span>
              <span className="text-white">{d.pressure_component != null ? `${d.pressure_component} / 30` : "—"}</span>
            </div>
            <div className="flex justify-between py-1 px-2 bg-white/[0.02] rounded">
              <span className="text-gray-500">Risk Category</span>
              <span className={`font-semibold ${d.risk_category === "Critical" || d.risk_category === "High Risk" ? "text-white" : "text-gray-400"}`}>
                {d.risk_category}
              </span>
            </div>
          </div>
        </div>
      );

    case "shap_explainability":
      return (
        <div className="space-y-3">
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
            Feature Attribution Contributions
          </p>
          {d.features?.map((feat: FeatureItem, idx: number) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-gray-400">{feat.name}</span>
                <span className={`font-semibold ${feat.is_anomalous ? "text-white" : "text-gray-600"}`}>
                  {(feat.value * 100).toFixed(0)}% contribution
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${feat.is_anomalous ? "bg-white" : "bg-white/20"}`}
                  style={{ width: `${feat.value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );

    case "threat_story":
      return (
        <div className="space-y-3 text-[10px] font-mono">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded leading-relaxed text-gray-300 max-h-40 overflow-y-auto">
            {d.narrative}
          </div>
          <div className="flex justify-between py-1 px-2 bg-white/[0.02] rounded">
            <span className="text-gray-500">Risk Category</span>
            <span className="text-white font-semibold">{d.risk_category}</span>
          </div>
          {d.recommended_actions && typeof d.recommended_actions === "string" && (
            <div className="flex justify-between py-1 px-2 bg-white/[0.02] rounded">
              <span className="text-gray-500">Recommended Response</span>
              <span className="text-white font-semibold">{d.recommended_actions}</span>
            </div>
          )}
        </div>
      );

    case "defense_agent":
      return (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono bg-white/[0.02] p-2.5 rounded border border-white/5">
            <div>
              <span className="text-gray-500">Response Level</span>
              <p className="text-white font-bold font-orbitron tracking-wider mt-0.5">
                Level {d.response_level}: {(d.level_label || "").toUpperCase()}
              </p>
            </div>
            <div className="px-2 py-1 bg-white/10 text-white rounded text-[8px]">
              Autonomous: True
            </div>
          </div>
          {d.actions && d.actions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                Mitigation Actions Executed
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 text-[10px] font-mono">
                {d.actions.map((act: ActionItem, idx: number) => (
                  <div key={idx} className="p-2 bg-white/[0.01] border border-white/5 rounded">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">{act.name || act.action}</span>
                      <span className="text-[8px] text-gray-500">Executed</span>
                    </div>
                    <p className="text-gray-500 text-[9px] mt-0.5 leading-tight">{act.description || act.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case "vehicle_recovery":
      return (
        <div className="space-y-2 text-[10px] font-mono">
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Stabilization Time</span>
            <span className="text-white">{d.recovery_time_ms} ms</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Health Before Attack</span>
            <span className="text-white">{d.health_before_attack}%</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Health During Attack</span>
            <span className="text-white">{d.health_during_attack}%</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">Final Health</span>
            <span className="text-white font-semibold">{d.final_health}%</span>
          </div>
          <div className="flex justify-between py-1.5 px-2 bg-white/[0.02] border border-white/5 rounded">
            <span className="text-gray-500">ECUs Restored</span>
            <span className="text-white">{d.ecus_restored}</span>
          </div>
        </div>
      );

    default:
      return <p className="text-[10px] font-mono text-gray-500">Stage data not available</p>;
  }
}
