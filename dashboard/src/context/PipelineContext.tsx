"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from "react";

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
    features?: { name: string; value: number; description?: string; is_anomalous?: boolean }[];
    actions?: { name?: string; action?: string; description?: string; detail?: string }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  backendOnline: boolean;
  pipelineError: string | null;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const TEMPLATE_STAGES: StageData[] = [
  {
    stage: "data_acquisition",
    stage_number: 1,
    label: "CAN Bus Data Acquisition",
    purpose: "Capture raw CAN bus messages from the vehicle's OBD-II interface for behavioral analysis",
    inputs: "CAN 2.0B bus traffic from 7 Electronic Control Units (ECUs)",
    outputs: "Structured behavioral window dataset",
    ai_reasoning: "Data ingestion — no AI applied. Raw CAN messages are parsed, labeled, and prepared.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "sliding_window",
    stage_number: 2,
    label: "Sliding Window Segmentation",
    purpose: "Group consecutive CAN messages into fixed-size windows (W=50) to capture temporal behavior patterns",
    inputs: "Raw CAN message stream",
    outputs: "Non-overlapping sequential windows",
    ai_reasoning: "Sliding windows transform raw message sequences into fixed-size behavioral segments.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "feature_extraction",
    stage_number: 3,
    label: "Behavioral Feature Extraction",
    purpose: "Compute statistical features from each behavioral window that characterize CAN bus communication behavior",
    inputs: "Behavioral windows of CAN messages",
    outputs: "13-dimensional feature vector per window",
    ai_reasoning: "Features capture distinct behavioral signatures of CAN bus activity.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "threat_detection",
    stage_number: 4,
    label: "AI Threat Detection Engine",
    purpose: "Detect anomalous CAN bus behavior by comparing the feature vector against the One-Class SVM model",
    inputs: "13-dimensional behavioral feature vector",
    outputs: "Classification: Anomaly/Normal, Anomaly score, Confidence",
    ai_reasoning: "One-Class SVM learns the boundary of normal CAN behavior during training.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "cyber_health",
    stage_number: 5,
    label: "Cyber Health Score Engine",
    purpose: "Compute continuous vehicle cyber health score from threat, stability, and pressure components",
    inputs: "OC-SVM anomaly scores and feature z-scores",
    outputs: "Continuous 0-100 cyber health score",
    ai_reasoning: "Health = Threat (40 pts) + Stability (30 pts) + Pressure (30 pts) with exponential decay.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "shap_explainability",
    stage_number: 6,
    label: "Feature Attribution Engine",
    purpose: "Identify which behavioral features most influenced the anomaly detection decision using z-score deviation analysis",
    inputs: "Behavioral feature vectors and baseline normal statistics",
    outputs: "Per-feature contribution scores ranking drivers of the anomaly signal",
    ai_reasoning: "Feature attribution uses z-score deviation analysis to identify which behavioral features deviate most from learned normal baselines. Each feature's value is compared against its normal distribution computed from thousands of normal driving windows. Features with large normalized deviations are flagged as anomalous contributors, providing per-instance explainability.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "threat_story",
    stage_number: 7,
    label: "Explainable Threat Story",
    purpose: "Transform model predictions and feature attributions into a human-readable narrative",
    inputs: "Anomaly score, Feature attribution, health score",
    outputs: "Natural language threat narrative with root cause analysis",
    ai_reasoning: "Narrative generator maps anomaly signatures to known attack patterns.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "defense_agent",
    stage_number: 8,
    label: "Autonomous Defense Agent",
    purpose: "Autonomously deploy targeted countermeasures to contain, mitigate, and neutralize the verified threat",
    inputs: "Attack type, Target ECU, Anomaly confidence, Health score",
    outputs: "Response Level (0-4) with mitigation actions executed",
    ai_reasoning: "Policy-based response engine mapping attack severity to containment playbook.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  },
  {
    stage: "vehicle_recovery",
    stage_number: 9,
    label: "Vehicle Recovery & Stabilization",
    purpose: "Verify that all vehicle systems return to secure operating state after threat mitigation",
    inputs: "Mitigation actions, Post-mitigation ECU status",
    outputs: "Final health, Vehicle state, Recovery time",
    ai_reasoning: "Post-recovery verification runs automated checks on all 7 ECUs to confirm secure state.",
    decision: "Awaiting execution...",
    status: "pending",
    data: { duration_ms: 0, logs: [] }
  }
];

export const PipelineProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<PageState>("landing");
  const [selectedAttack, setSelectedAttack] = useState<AttackType>("dos");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [stages, setStages] = useState<StageData[]>(TEMPLATE_STAGES);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeStreamControllerRef = useRef<AbortController | null>(null);

  // Check backend connectivity on mount
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) setBackendOnline(true);
      } catch { setBackendOnline(false); }
    };
    check();
    checkIntervalRef.current = setInterval(check, 15000);
    return () => { if (checkIntervalRef.current) clearInterval(checkIntervalRef.current); };
  }, []);

  const abortStream = useCallback(() => {
    if (activeStreamControllerRef.current) {
      activeStreamControllerRef.current.abort();
      activeStreamControllerRef.current = null;
    }
  }, []);

  const resetSimulation = useCallback(() => {
    abortStream();
    setPipelineStatus("idle");
    setCurrentStageIndex(0);
    setStages(TEMPLATE_STAGES);
    setSummary(null);
    setPipelineError(null);
  }, [abortStream]);

  const runSimulation = async (attackType: AttackType) => {
    resetSimulation();
    setPipelineError(null);
    setPipelineStatus("running");
    const controller = new AbortController();
    activeStreamControllerRef.current = controller;
    try {
      const res = await fetch(`${API_URL}/api/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: attackType }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(detail.detail || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream in response");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.substring(6);
            try {
              const eventData = JSON.parse(dataStr);
              if (eventData.stage) {
                setStages((prev) => {
                  return prev.map((s) => {
                    if (s.stage === eventData.stage) {
                      return { ...eventData, status: "complete" };
                    }
                    return s;
                  });
                });
                setCurrentStageIndex(eventData.stage_number);
              } else if (eventData.summary) {
                setSummary(eventData.summary);
                setPipelineStatus("completed");
              }
            } catch (err) {
              console.error("Error parsing SSE chunk:", err);
            }
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setPipelineError(e instanceof Error ? e.message : "Unknown error");
      setPipelineStatus("idle");
    } finally {
      if (activeStreamControllerRef.current === controller) {
        activeStreamControllerRef.current = null;
      }
    }
  };

  // Collect logs from completed stages (derived state)
  const collectedLogs = useMemo(() => {
    const collected: LogEvent[] = [];
    for (const stage of stages) {
      if (stage.status === "complete") {
        const stageLogs = stage.data?.logs;
        if (stageLogs && Array.isArray(stageLogs)) {
          collected.push(...stageLogs);
        }
      }
    }
    return collected;
  }, [stages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortStream();
  }, [abortStream]);

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
        allLogs: collectedLogs,
        runSimulation,
        resetSimulation,
        backendOnline,
        pipelineError,
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
