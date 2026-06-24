"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AttackType = "idle" | "dos" | "fuzzy" | "gear" | "rpm" | "normal";
export type MitigationStatus = "idle" | "monitoring" | "mitigating" | "mitigated";

export interface ThreatLog {
  id: string;
  timestamp: string;
  source: string;
  target: string;
  canId: string;
  anomalyScore: number;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string;
  status: "ACTIVE" | "MITIGATING" | "MITIGATED" | "DISMISSED";
  narrative: string;
}

export interface DefenseLog {
  id: string;
  timestamp: string;
  policyId: string;
  action: string;
  targetEcu: string;
  status: "PENDING" | "EXECUTED" | "VERIFIED" | "FAILED";
  details: string;
}

export interface ShapMetric {
  name: string;
  value: number;
  description: string;
  isAnomalous: boolean;
}

export interface EcuStatus {
  id: string;
  name: string;
  status: "secure" | "warn" | "compromised";
  packetRate: number;
  cpuLoad: number;
}

interface DashboardContextType {
  healthScore: number;
  activeThreatCount: number;
  simulationState: AttackType;
  mitigationState: MitigationStatus;
  isAutonomousMode: boolean;
  showStartup: boolean;
  threatLogs: ThreatLog[];
  defenseLogs: DefenseLog[];
  shapData: ShapMetric[];
  ecuStatuses: Record<string, EcuStatus>;
  vehicleStats: {
    canRate: number;
    cpuLoad: number;
    memoryUsage: number;
    inferenceLatency: number;
    dataReduction: string;
  };
  cyberTwinStats: {
    selectedEcu: string;
    msgFrequency: number;
    msgFrequencyNormal: number;
    payloadEntropy: number;
    payloadEntropyNormal: number;
    signalDrift: number;
  };
  triggerAttack: (attack: AttackType) => void;
  stopSimulation: () => void;
  executeMitigation: () => void;
  setAutonomousMode: (val: boolean) => void;
  setSelectedEcu: (ecu: string) => void;
  dismissThreat: (id: string) => void;
  completeStartup: () => void;
}

const defaultShap: ShapMetric[] = [
  { name: "Frequency Variance", value: 0.12, description: "Deviation in message arrival frequency", isAnomalous: false },
  { name: "Inter-Msg Gap Delta", value: 0.08, description: "Time difference between successive packets", isAnomalous: false },
  { name: "Payload Entropy", value: 0.15, description: "Randomness of CAN payload data", isAnomalous: false },
  { name: "CAN ID Range", value: 0.05, description: "Identifier out of expected range boundaries", isAnomalous: false },
  { name: "Payload Byte Variance", value: 0.09, description: "Drift in individual payload values", isAnomalous: false },
];

const INITIAL_ECUS: Record<string, EcuStatus> = {
  "0x0A": { id: "0x0A", name: "Central Gateway (CGW)", status: "secure", packetRate: 450, cpuLoad: 8 },
  "0x12": { id: "0x12", name: "Engine Control (ECU)", status: "secure", packetRate: 180, cpuLoad: 12 },
  "0x1A": { id: "0x1A", name: "Transmission Control (TCU)", status: "secure", packetRate: 120, cpuLoad: 6 },
  "0x24": { id: "0x24", name: "Electronic Power Steering (EPS)", status: "secure", packetRate: 200, cpuLoad: 14 },
  "0x32": { id: "0x32", name: "Anti-lock Braking (ABS)", status: "secure", packetRate: 150, cpuLoad: 9 },
  "0x48": { id: "0x48", name: "Body Control Module (BCM)", status: "secure", packetRate: 50, cpuLoad: 4 },
  "0x2C": { id: "0x2C", name: "Infotainment (IVI)", status: "secure", packetRate: 100, cpuLoad: 25 },
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [healthScore, setHealthScore] = useState(0);
  const [activeThreatCount, setActiveThreatCount] = useState(0);
  const [simulationState, setSimulationState] = useState<AttackType>("idle");
  const [mitigationState, setMitigationState] = useState<MitigationStatus>("idle");
  const [isAutonomousMode, setAutonomousMode] = useState(true);
  const [showStartup, setShowStartup] = useState(true);
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([]);
  const [defenseLogs, setDefenseLogs] = useState<DefenseLog[]>([]);
  const [shapData, setShapData] = useState<ShapMetric[]>(defaultShap);
  const [ecuStatuses, setEcuStatuses] = useState<Record<string, EcuStatus>>(INITIAL_ECUS);
  const [selectedEcu, setSelectedEcu] = useState("0x12");

  const [vehicleStats, setVehicleStats] = useState({
    canRate: 1250,
    cpuLoad: 11,
    memoryUsage: 38.4,
    inferenceLatency: 3.12,
    dataReduction: "350:1",
  });

  const [cyberTwinStats, setCyberTwinStats] = useState({
    selectedEcu: "0x12",
    msgFrequency: 10,
    msgFrequencyNormal: 10,
    payloadEntropy: 1.25,
    payloadEntropyNormal: 1.2,
    signalDrift: 0.02,
  });

  const completeStartup = () => {
    setShowStartup(false);
    setHealthScore(98);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleStats((prev) => {
        if (simulationState === "idle" || simulationState === "normal") {
          return {
            ...prev,
            canRate: 1250 + Math.floor(Math.random() * 60 - 30),
            cpuLoad: 11 + Math.floor(Math.random() * 4 - 2),
            memoryUsage: 38.4 + Number((Math.random() * 2 - 1).toFixed(1)),
            inferenceLatency: Number((3.12 + Math.random() * 0.2 - 0.1).toFixed(2)),
          };
        }
        if (simulationState === "dos") {
          return {
            ...prev,
            canRate: 8500 + Math.floor(Math.random() * 500),
            cpuLoad: 58 + Math.floor(Math.random() * 6 - 3),
            memoryUsage: 72.1 + Number((Math.random() * 4 - 2).toFixed(1)),
            inferenceLatency: Number((4.85 + Math.random() * 0.4 - 0.2).toFixed(2)),
          };
        }
        return {
          ...prev,
          canRate: 1450 + Math.floor(Math.random() * 100),
          cpuLoad: 24 + Math.floor(Math.random() * 5 - 2),
          memoryUsage: 51.8 + Number((Math.random() * 3 - 1.5).toFixed(1)),
          inferenceLatency: Number((3.72 + Math.random() * 0.3 - 0.15).toFixed(2)),
        };
      });

      setCyberTwinStats((prev) => {
        const target = getTargetEcuForAttack(simulationState);
        const isTarget = prev.selectedEcu === target;
        if (simulationState === "idle" || simulationState === "normal") {
          return {
            ...prev,
            msgFrequency: prev.msgFrequencyNormal + Number((Math.random() * 0.4 - 0.2).toFixed(2)),
            payloadEntropy: prev.payloadEntropyNormal + Number((Math.random() * 0.08 - 0.04).toFixed(3)),
            signalDrift: Number((Math.random() * 0.03).toFixed(3)),
          };
        }
        if (simulationState === "dos" && isTarget) {
          return {
            ...prev,
            msgFrequency: 120 + Math.floor(Math.random() * 10),
            payloadEntropy: 1.95 + Number((Math.random() * 0.1).toFixed(3)),
            signalDrift: 0.84,
          };
        }
        if (simulationState === "fuzzy" && isTarget) {
          return {
            ...prev,
            msgFrequency: 85 + Math.floor(Math.random() * 15),
            payloadEntropy: 2.85 + Number((Math.random() * 0.1).toFixed(3)),
            signalDrift: 0.72,
          };
        }
        if (simulationState === "gear" && isTarget) {
          return {
            ...prev,
            msgFrequency: 55 + Math.floor(Math.random() * 8),
            payloadEntropy: 1.75 + Number((Math.random() * 0.12).toFixed(3)),
            signalDrift: 0.63,
          };
        }
        if (simulationState === "rpm" && isTarget) {
          return {
            ...prev,
            msgFrequency: 80 + Math.floor(Math.random() * 12),
            payloadEntropy: 1.55 + Number((Math.random() * 0.15).toFixed(3)),
            signalDrift: 0.71,
          };
        }
        return {
          ...prev,
          msgFrequency: prev.msgFrequencyNormal + Number((Math.random() * 0.8 - 0.4).toFixed(2)),
          payloadEntropy: prev.payloadEntropyNormal + Number((Math.random() * 0.1 - 0.05).toFixed(3)),
          signalDrift: Number((Math.random() * 0.06).toFixed(3)),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulationState]);

  useEffect(() => {
    let normalFreq = 10;
    let normalEntropy = 1.2;
    if (selectedEcu === "0x0A") { normalFreq = 50; normalEntropy = 1.4; }
    else if (selectedEcu === "0x12") { normalFreq = 20; normalEntropy = 1.1; }
    else if (selectedEcu === "0x1A") { normalFreq = 15; normalEntropy = 0.95; }
    else if (selectedEcu === "0x24") { normalFreq = 25; normalEntropy = 0.8; }
    else if (selectedEcu === "0x32") { normalFreq = 30; normalEntropy = 0.85; }
    else if (selectedEcu === "0x2C") { normalFreq = 8; normalEntropy = 2.1; }

    setCyberTwinStats((prev) => ({
      ...prev,
      selectedEcu,
      msgFrequencyNormal: normalFreq,
      payloadEntropyNormal: normalEntropy,
    }));
  }, [selectedEcu]);

  const getTargetEcuForAttack = (attack: AttackType) => {
    switch (attack) {
      case "dos": return "0x0A";
      case "fuzzy": return "0x32";
      case "gear": return "0x1A";
      case "rpm": return "0x12";
      default: return "";
    }
  };

  const triggerAttack = (attack: AttackType) => {
    if (attack === "idle" || attack === "normal") return;
    setSimulationState(attack);
    setMitigationState("idle");
    setActiveThreatCount(1);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newThreat: ThreatLog;
    let attackShap: ShapMetric[];
    let ecusUpdates = { ...INITIAL_ECUS };

    switch (attack) {
      case "dos":
        setHealthScore(35);
        ecusUpdates["0x0A"] = { ...ecusUpdates["0x0A"], status: "compromised", packetRate: 7500, cpuLoad: 78 };
        newThreat = {
          id: `T-${Date.now()}`,
          timestamp,
          source: "0x2C",
          target: "0x0A",
          canId: "0x00A",
          anomalyScore: 0.96,
          confidence: 0.99,
          severity: "CRITICAL",
          type: "CAN Bus Flood DoS",
          status: "ACTIVE",
          narrative: "CAN bus flood detected. Gateway node 0x0A receiving messages at 7500 Hz. Core buffer overflow imminent. Gray zone threshold exceeded.",
        };
        attackShap = [
          { name: "Frequency Variance", value: 0.94, description: "Extremely high density of message packets", isAnomalous: true },
          { name: "Inter-Msg Gap Delta", value: 0.88, description: "Short time intervals between packets", isAnomalous: true },
          { name: "Payload Entropy", value: 0.12, description: "Payload is redundant and repeating", isAnomalous: false },
          { name: "CAN ID Range", value: 0.04, description: "Normal ID indicating spoofed native priority", isAnomalous: false },
          { name: "Payload Byte Variance", value: 0.05, description: "No variance in static payload bytes", isAnomalous: false },
        ];
        break;

      case "fuzzy":
        setHealthScore(22);
        ecusUpdates["0x32"] = { ...ecusUpdates["0x32"], status: "compromised", packetRate: 1200, cpuLoad: 45 };
        newThreat = {
          id: `T-${Date.now()}`,
          timestamp,
          source: "0x0A",
          target: "0x32",
          canId: "0x32B",
          anomalyScore: 0.98,
          confidence: 0.97,
          severity: "CRITICAL",
          type: "CAN Payload Fuzzing",
          status: "ACTIVE",
          narrative: "High-entropy random bits injected into safety-critical braking system CAN IDs. ABS diagnostics flag activated. Signal integrity compromised.",
        };
        attackShap = [
          { name: "Frequency Variance", value: 0.42, description: "Irregular packet timing profiles", isAnomalous: false },
          { name: "Inter-Msg Gap Delta", value: 0.35, description: "Jittery inter-message gaps", isAnomalous: false },
          { name: "Payload Entropy", value: 0.96, description: "Extreme randomness in data bytes", isAnomalous: true },
          { name: "CAN ID Range", value: 0.78, description: "Atypical CAN frame addresses", isAnomalous: true },
          { name: "Payload Byte Variance", value: 0.88, description: "Corrupted byte signals", isAnomalous: true },
        ];
        break;

      case "gear":
        setHealthScore(48);
        ecusUpdates["0x1A"] = { ...ecusUpdates["0x1A"], status: "compromised", cpuLoad: 34, packetRate: 380 };
        newThreat = {
          id: `T-${Date.now()}`,
          timestamp,
          source: "0x1A",
          target: "0x12",
          canId: "0x1A0",
          anomalyScore: 0.88,
          confidence: 0.94,
          severity: "HIGH",
          type: "Gear Shift Spoofing",
          status: "ACTIVE",
          narrative: "Transmission controller gear position injection. False gear ratio values deviate from expected drive cycle. Shifting logic corrupted.",
        };
        attackShap = [
          { name: "Frequency Variance", value: 0.22, description: "Slightly elevated transmission messaging", isAnomalous: false },
          { name: "Inter-Msg Gap Delta", value: 0.11, description: "Minor timing irregularities", isAnomalous: false },
          { name: "Payload Entropy", value: 0.14, description: "Structured but implausible gear values", isAnomalous: false },
          { name: "CAN ID Range", value: 0.09, description: "Expected transmission CAN identifiers", isAnomalous: false },
          { name: "Payload Byte Variance", value: 0.87, description: "Abrupt shift in gear position bytes", isAnomalous: true },
        ];
        break;

      case "rpm":
        setHealthScore(40);
        ecusUpdates["0x12"] = { ...ecusUpdates["0x12"], status: "compromised", cpuLoad: 52, packetRate: 420 };
        newThreat = {
          id: `T-${Date.now()}`,
          timestamp,
          source: "0x12",
          target: "0x0A",
          canId: "0x120",
          anomalyScore: 0.91,
          confidence: 0.96,
          severity: "HIGH",
          type: "RPM Signal Manipulation",
          status: "ACTIVE",
          narrative: "Engine control unit RPM values artificially inflated. Tachometer readings diverge from physical sensor feedback. Torque calculations affected.",
        };
        attackShap = [
          { name: "Frequency Variance", value: 0.31, description: "Irregular engine message frequency", isAnomalous: false },
          { name: "Inter-Msg Gap Delta", value: 0.18, description: "Unstable intervals between RPM frames", isAnomalous: false },
          { name: "Payload Entropy", value: 0.21, description: "Moderate randomness in signal data", isAnomalous: false },
          { name: "CAN ID Range", value: 0.06, description: "Standard engine CAN ID range", isAnomalous: false },
          { name: "Payload Byte Variance", value: 0.83, description: "Unnatural RPM value curves", isAnomalous: true },
        ];
        break;
    }

    setThreatLogs((prev) => [newThreat, ...prev]);
    setShapData(attackShap);
    setEcuStatuses(ecusUpdates);
    setSelectedEcu(getTargetEcuForAttack(attack));

    if (isAutonomousMode) {
      setTimeout(() => {
        initiateAutonomousDefense(attack);
      }, 3000);
    }
  };

  const initiateAutonomousDefense = (attack: AttackType) => {
    setMitigationState("mitigating");
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let policyId = "";
    let action = "";
    let targetEcu = "";
    let details = "";

    switch (attack) {
      case "dos":
        policyId = "POL-CGW-01";
        action = "Rate-Limit & Node Isolation";
        targetEcu = "0x0A";
        details = "Enabled rate-limiting on gateway interface. Compromised diagnostic port isolated. Switch to backup bus segment.";
        break;
      case "fuzzy":
        policyId = "POL-ABS-09";
        action = "ECU Recalibration Reset";
        targetEcu = "0x32";
        details = "Transmitted hard reset code to ABS module. Suspended unmapped IDs. Restored default safety matrix.";
        break;
      case "gear":
        policyId = "POL-TCU-04";
        action = "Gear Map Lock & Signal Filter";
        targetEcu = "0x1A";
        details = "Locked gear position map to verified range. Filtered anomalous shift requests. Restored transmission calibration.";
        break;
      case "rpm":
        policyId = "POL-ECU-07";
        action = "RPM Signal Recovery";
        targetEcu = "0x12";
        details = "Isolated engine control RPM sensor stream. Applied median filter to remove spiked values. Throttle map restored.";
        break;
    }

    const defenseAction: DefenseLog = {
      id: `D-${Date.now()}`,
      timestamp,
      policyId,
      action,
      targetEcu,
      status: "EXECUTED",
      details,
    };

    setDefenseLogs((prev) => [defenseAction, ...prev]);

    setTimeout(() => {
      setMitigationState("mitigated");
      setActiveThreatCount(0);
      setHealthScore(88);

      setThreatLogs((prev) =>
        prev.map((log) => (log.status === "ACTIVE" ? { ...log, status: "MITIGATED" } : log))
      );

      setEcuStatuses((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key].status === "compromised") {
            updated[key].status = "warn";
          }
        });
        return updated;
      });
    }, 3000);
  };

  const executeMitigation = () => {
    if (simulationState === "idle" || simulationState === "normal" || mitigationState === "mitigating" || mitigationState === "mitigated") return;
    initiateAutonomousDefense(simulationState);
  };

  const stopSimulation = () => {
    setSimulationState("idle");
    setMitigationState("idle");
    setActiveThreatCount(0);
    setHealthScore(98);
    setShapData(defaultShap);
    setEcuStatuses(INITIAL_ECUS);

    setThreatLogs((prev) =>
      prev.map((log) => (log.status === "ACTIVE" || log.status === "MITIGATING" ? { ...log, status: "DISMISSED" } : log))
    );
  };

  const dismissThreat = (id: string) => {
    setThreatLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, status: "DISMISSED" } : log))
    );
  };

  return (
    <DashboardContext.Provider
      value={{
        healthScore,
        activeThreatCount,
        simulationState,
        mitigationState,
        isAutonomousMode,
        showStartup,
        threatLogs,
        defenseLogs,
        shapData,
        ecuStatuses,
        vehicleStats,
        cyberTwinStats,
        triggerAttack,
        stopSimulation,
        executeMitigation,
        setAutonomousMode,
        setSelectedEcu,
        dismissThreat,
        completeStartup,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
