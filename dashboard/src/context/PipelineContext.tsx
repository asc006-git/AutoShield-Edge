"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type AttackType = "normal" | "dos" | "fuzzy" | "gear" | "rpm";
export type PageState = "landing" | "pipeline";
export type PipelineStatus = "idle" | "running" | "completed";

export interface LogEvent {
  timestamp: string;
  level: "INFO" | "WARN" | "CRITICAL";
  message: string;
}

export interface StageData {
  stage: string;
  stage_number: number;
  label: string;
  purpose: string;
  inputs: string;
  outputs: string;
  ai_reasoning: string;
  decision: string;
  status: string;
  data: {
    duration_ms: number;
    logs: LogEvent[];
    [key: string]: any;
  };
}

export interface PipelineSummary {
  attack_type: string;
  detection_status: string;
  confidence: number;
  anomaly_score: number;
  detection_latency_ms: number;
  affected_ecu: string;
  affected_ecu_name: string;
  health_before: number;
  health_during: number;
  health_after: number;
  recovery_time_ms: number;
  mitigation_success: boolean;
  final_vehicle_state: string;
  total_pipeline_ms: number;
  execution_graph: string;
  total_windows: number;
  windows_analyzed: number;
  anomalous_features: number;
  top_anomaly_driver: string;
  defense_level: number;
  defense_label: string;
  model_used?: string;
  features_extracted_count?: number;
}

interface PipelineContextType {
  currentPage: PageState;
  setCurrentPage: (page: PageState) => void;
  selectedAttack: AttackType;
  setSelectedAttack: (attack: AttackType) => void;
  pipelineStatus: PipelineStatus;
  currentStageIndex: number;
  stages: StageData[];
  summary: PipelineSummary | null;
  allLogs: LogEvent[];
  runSimulation: (attackType: AttackType) => Promise<void>;
  resetSimulation: () => void;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<PageState>("landing");
  const [selectedAttack, setSelectedAttack] = useState<AttackType>("dos");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [stages, setStages] = useState<StageData[]>([]);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [allLogs, setAllLogs] = useState<LogEvent[]>([]);

  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearStageTimer = useCallback(() => {
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  }, []);

  const resetSimulation = useCallback(() => {
    clearStageTimer();
    setPipelineStatus("idle");
    setCurrentStageIndex(0);
    setStages([]);
    setSummary(null);
    setAllLogs([]);
  }, [clearStageTimer]);

  const runSimulation = async (attackType: AttackType) => {
    resetSimulation();
    try {
      const res = await fetch(`${API_URL}/api/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: attackType }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setStages(data.stages);
      setSummary(data.summary);
      setPipelineStatus("running");
      setCurrentStageIndex(1);
    } catch (e: any) {
      console.error("Pipeline run failed:", e.message);
      setPipelineStatus("idle");
    }
  };

  // Collect logs from completed stages
  useEffect(() => {
    if (currentStageIndex === 0 || stages.length === 0) return;
    const maxStage = Math.min(currentStageIndex, stages.length);
    const collected: LogEvent[] = [];
    for (let i = 0; i < maxStage; i++) {
      const stageLogs = stages[i].data?.logs;
      if (stageLogs && Array.isArray(stageLogs)) {
        collected.push(...stageLogs);
      }
    }
    setAllLogs(collected);
  }, [currentStageIndex, stages]);

  // Advance stages using backend-measured durations
  useEffect(() => {
    if (pipelineStatus !== "running" || stages.length === 0) return;

    if (currentStageIndex > 9) {
      setPipelineStatus("completed");
      return;
    }

    const stage = stages[currentStageIndex - 1];
    if (!stage) return;

    const displayTime = stage.data?.duration_ms ?? 500;

    clearStageTimer();
    stageTimerRef.current = setTimeout(() => {
      setCurrentStageIndex((prev) => prev + 1);
    }, displayTime);

    return () => clearStageTimer();
  }, [pipelineStatus, currentStageIndex, stages, clearStageTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearStageTimer();
  }, [clearStageTimer]);

  return (
    <PipelineContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedAttack,
        setSelectedAttack,
        pipelineStatus,
        currentStageIndex,
        stages,
        summary,
        allLogs,
        runSimulation,
        resetSimulation,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error("usePipeline must be used within a PipelineProvider");
  }
  return context;
};
