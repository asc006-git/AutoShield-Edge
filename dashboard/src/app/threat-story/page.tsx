"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  BookOpen,
  BrainCircuit,
  Siren,
  Route,
  Crosshair,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sigma,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { GlassCard } from "@/components/GlassCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
} as const;

export default function ThreatStoryPage() {
  const { shapData, threatLogs, simulationState, mitigationState } = useDashboard();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const activeThreat =
    threatLogs.find((l) => l.status === "ACTIVE" || l.status === "MITIGATING") ||
    threatLogs.find((l) => l.status === "MITIGATED") ||
    threatLogs[0];

  const isActive = simulationState !== "idle" && simulationState !== "normal";
  const isMitigated = mitigationState === "mitigated";

  const anomalyFeatures = shapData.filter((s) => s.isAnomalous);
  const anomalyNames = anomalyFeatures.map((s) => s.name.toLowerCase());
  const anomalyList =
    anomalyFeatures.length > 0
      ? anomalyFeatures.map((s) => s.name).join(", ")
      : "none detected";

  const getSeverityLabel = () => {
    if (!activeThreat) return "None";
    return activeThreat.severity;
  };

  const getThreatSummary = () => {
    if (!activeThreat || !isActive) {
      return "No active threats detected. The vehicle ECU network is operating within expected statistical boundaries. All behavioral features remain within the nominal envelope.";
    }
    return `A ${activeThreat.type} attack has been detected on ${activeThreat.target} originating from ${activeThreat.source}. The anomaly consensus score reached ${(activeThreat.anomalyScore * 100).toFixed(0)}% with ${(activeThreat.confidence * 100).toFixed(0)}% model confidence. The attack is currently classified as ${activeThreat.severity} severity and is ${activeThreat.status.toLowerCase()}.`;
  };

  const getRootCause = () => {
    if (!isActive) return "All CAN bus metrics are stable. No root cause analysis required.";
    if (anomalyFeatures.length === 0) return "Anomaly detected but specific root cause features are within normal range thresholds. Further isolation required.";
    return `The primary root cause centers on anomalous behavior in ${anomalyFeatures.length} feature(s): ${anomalyList}. These features exhibited statistically significant deviations from the baseline behavioral model, triggering the Isolation Forest ensemble to flag the traffic as malicious.`;
  };

  const getAttackAttribution = () => {
    if (!activeThreat || !isActive) return "No attack attribution available — all systems nominal.";
    return `Attack vector attributed to CAN bus transaction ${activeThreat.canId}. The ${activeThreat.type} pattern matches known adversarial behavior models in the vehicle threat intelligence database. The source ECU (${activeThreat.source}) is exhibiting out-of-character transmission behavior inconsistent with its historical profile.`;
  };

  const getForecastedImpact = () => {
    if (!isActive) return "No impact forecast — vehicle is in a secure state.";
    let impact = "If left unmitigated, this attack could lead to ";
    switch (simulationState) {
      case "dos":
        impact += "complete CAN bus saturation, causing denial of service for critical safety messages including braking and steering commands. Gateway buffer overflow may propagate to adjacent bus segments.";
        break;
      case "fuzzy":
        impact += "corruption of safety-critical ABS calibration data, potentially causing unpredictable braking behavior and loss of vehicle stability control.";
        break;
      case "gear":
        impact += "erratic transmission behavior, unintended gear shifts, and potential drivetrain damage. Driver control signals may be overridden by spoofed TCU messages.";
        break;
      case "rpm":
        impact += "incorrect torque calculations, engine stall conditions, and erroneous tachometer readings that may cause the driver to misjudge vehicle state.";
        break;
      default:
        impact += "systemic degradation of in-vehicle network integrity and potential cascading ECU compromises.";
    }
    return impact;
  };

  const getRecommendedActions = () => {
    if (!isActive) return [{ action: "Continue passive monitoring", detail: "All systems nominal" }];
    if (isMitigated) return [{ action: "Verify system restoration", detail: "Run post-mitigation diagnostics on all affected ECUs" }, { action: "Review defense logs", detail: "Audit the autonomous response for completeness" }];
    const actions: { action: string; detail: string }[] = [];
    switch (simulationState) {
      case "dos":
        actions.push({ action: "Isolate compromised gateway node", detail: "Enable rate-limiting on 0x0A and reroute traffic" });
        actions.push({ action: "Activate backup bus segment", detail: "Switch non-critical traffic to redundant CAN channel" });
        break;
      case "fuzzy":
        actions.push({ action: "Hard-reset ABS module", detail: "Transmit recalibration sequence to 0x32" });
        actions.push({ action: "Block unmapped CAN IDs", detail: "Update acceptance filter to reject unknown frame addresses" });
        break;
      case "gear":
        actions.push({ action: "Lock gear position map", detail: "Restrict TCU to verified gear ratio values" });
        actions.push({ action: "Filter anomalous shift requests", detail: "Apply median filtering on gear position signals" });
        break;
      case "rpm":
        actions.push({ action: "Isolate RPM sensor stream", detail: "Separate engine control RPM from general bus traffic" });
        actions.push({ action: "Restore throttle map", detail: "Apply baseline calibration to Engine Control Unit 0x12" });
        break;
      default:
        actions.push({ action: "Escalate to security operations", detail: "Insufficient data for automated response" });
    }
    actions.push({ action: "Enable autonomous mitigation", detail: "Deploy self-healing policy engine" });
    return actions;
  };

  const getRuleReasoning = () => {
    if (!isActive || !activeThreat) {
      return {
        ruleId: "RULE-SAFE-001",
        expression: "IF deviation_drift < 0.15 AND payload_entropy IN (0.8, 1.8) THEN CLASS = NORMAL",
        explanation: "All telemetry features fall within the statistical normal envelope. No diagnostics override frames or frequency spikes observed.",
      };
    }
    switch (simulationState) {
      case "dos":
        return {
          ruleId: "RULE-ANOM-DOS-04",
          expression: "IF freq_variance > 0.85 AND inter_msg_gap < 0.15 THEN CLASS = ANOMALY (FLOOD)",
          explanation: "Consensus threshold exceeded via Isolation Forest spatial split. Target node receiving packets at a rate exceeding logical input buffer capacity by over 1,500%.",
        };
      case "fuzzy":
        return {
          ruleId: "RULE-ANOM-FUZZ-12",
          expression: "IF payload_entropy > 0.90 AND can_id_range > 0.70 THEN CLASS = ANOMALY (FUZZING)",
          explanation: "High-entropy payload sweep targeting unmapped safety-critical registers. Diagnostics faults triggered on ABS module.",
        };
      case "gear":
        return {
          ruleId: "RULE-ANOM-GEAR-07",
          expression: "IF payload_byte_variance > 0.80 AND freq_variance < 0.25 THEN CLASS = ANOMALY (SPOOFING)",
          explanation: "Gear position byte stream shows abrupt transitions inconsistent with physical shift mechanics. Values deviate from validated drive cycle map.",
        };
      case "rpm":
        return {
          ruleId: "RULE-ANOM-RPM-03",
          expression: "IF payload_byte_variance > 0.75 AND freq_variance < 0.35 THEN CLASS = ANOMALY (SPOOFING)",
          explanation: "RPM signal curve shows impossible acceleration rates. Telemetry diverges from physical sensor feedback model by over 3 standard deviations.",
        };
      default:
        return {
          ruleId: "RULE-ANOM-GEN-01",
          expression: "IF weighted_ensemble_consensus > 0.85 THEN CLASS = ANOMALY",
          explanation: "Ensemble consensus threshold triggered by cross-forest agreement across multiple behavioral dimensions.",
        };
    }
  };

  const reasoning = getRuleReasoning();
  const recommendations = getRecommendedActions();

  const chartBarColor = isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)";

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-orbitron tracking-wider text-gray-100 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-gray-300" />
              THREAT STORY ENGINE
            </h1>
            <p className="text-sm text-gray-500 font-mono mt-1">
              AI-generated narratives translating ML detection output into human-readable cyber threat analysis.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono text-gray-600 tracking-wider">THREAT STATUS</p>
            <p className={`text-xs font-mono mt-0.5 ${isActive ? "text-white" : "text-gray-400"}`}>
              {isActive ? `${activeThreat?.severity || "ACTIVE"}` : "ALL CLEAR"}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <motion.div variants={itemVariants}>
            <GlassCard hoverable={false}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-orbitron tracking-wider text-gray-200 flex items-center gap-2">
                    <Sigma className="h-4 w-4 text-gray-400" />
                    SHAP FEATURE ATTRIBUTION
                  </h3>
                  <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                    Feature contributions to the anomaly classification decision
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={shapData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      type="number"
                      stroke="#525252"
                      fontSize={10}
                      fontFamily="monospace"
                      domain={[0, 1]}
                      tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#d4d4d4"
                      fontSize={10}
                      fontFamily="monospace"
                      width={120}
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
                    <ReferenceLine
                      x={0.15}
                      stroke="rgba(255,255,255,0.12)"
                      strokeDasharray="3 3"
                      label={{
                        value: "threshold",
                        position: "top",
                        fill: "#737373",
                        fontSize: 9,
                        fontFamily: "monospace",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {shapData.map((entry, index) => {
                        const intensity = Math.min(255, Math.round(128 + entry.value * 400));
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={`rgb(${intensity}, ${intensity}, ${intensity})`}
                            fillOpacity={entry.isAnomalous ? 0.9 : 0.35}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-white/80" />
                  <span>Anomalous</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-white/20" />
                  <span>Normal</span>
                </div>
                <span className="ml-auto">Features above 15% threshold flagged</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <motion.div variants={itemVariants}>
            <GlassCard hoverable={false}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <BrainCircuit className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-sm font-orbitron tracking-wider text-gray-200">
                    AI NARRATIVE ANALYSIS
                  </h3>
                  <p className="text-[10px] font-mono text-gray-500">
                    Natural language explanation generated by the reasoning engine
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-white/5 border border-white/10 flex-shrink-0 mt-0.5">
                    <BrainCircuit className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-gray-600 mb-1">AI ASSISTANT</p>
                    <div className="text-xs font-mono text-gray-300 leading-relaxed space-y-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5">
                          — THREAT SUMMARY
                        </span>
                        <p>{getThreatSummary()}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5">
                          — ROOT CAUSE ANALYSIS
                        </span>
                        <p>{getRootCause()}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5">
                          — ATTACK ATTRIBUTION
                        </span>
                        <p>{getAttackAttribution()}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5">
                          — FORECASTED IMPACT
                        </span>
                        <p>{getForecastedImpact()}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5">
                          — RECOMMENDED ACTIONS
                        </span>
                        <div className="space-y-1.5 mt-1">
                          {recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2 rounded bg-black/30 border border-white/5"
                            >
                              <ShieldCheck className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[11px] text-gray-300 font-semibold">
                                  {rec.action}
                                </p>
                                <p className="text-[10px] text-gray-500">{rec.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <GlassCard hoverable={false}>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Route className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <h3 className="text-sm font-orbitron tracking-wider text-gray-200">
                RULE-BASED DECISION REASONER
              </h3>
              <p className="text-[10px] font-mono text-gray-500">
                Symbolic logic engine — deterministic rule matching overlay
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block">
                Matched Rule
              </span>
              <span className="text-sm font-mono font-bold text-gray-200 mt-1 block">
                {reasoning.ruleId}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/30 border border-white/5 md:col-span-2">
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block">
                Logical Expression
              </span>
              <code className="text-xs font-mono text-gray-300 mt-1 block leading-relaxed">
                {reasoning.expression}
              </code>
            </div>

            <div className="p-3 rounded-lg bg-black/30 border border-white/5 md:col-span-3">
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block">
                Explanation
              </span>
              <p className="text-xs font-mono text-gray-400 mt-1 leading-relaxed">
                {reasoning.explanation}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard hoverable={false}>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Crosshair className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <h3 className="text-sm font-orbitron tracking-wider text-gray-200">
                FEATURE ATTRIBUTION DETAILS
              </h3>
              <p className="text-[10px] font-mono text-gray-500">
                Per-feature z-scores, deviation direction, and behavioral context
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {shapData.map((feature) => {
              const isExpanded = expandedFeature === feature.name;
              const zScore = ((feature.value - 0.5) * 4).toFixed(2);
              const direction = feature.value > 0.5 ? "elevated" : "depressed";

              return (
                <div
                  key={feature.name}
                  className="rounded-lg border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFeature(isExpanded ? null : feature.name)}
                    className="w-full flex items-center gap-3 p-3 bg-black/30 hover:bg-black/50 transition-colors text-left"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        feature.isAnomalous ? "bg-white" : "bg-gray-600"
                      }`}
                    />
                    <span className="flex-1 text-xs font-mono text-gray-300 font-semibold">
                      {feature.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        feature.isAnomalous ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {feature.isAnomalous ? "ANOMALOUS" : "NORMAL"}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      z = {zScore}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="px-3 pb-3 border-t border-white/5"
                    >
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-2.5 rounded bg-black/40 border border-white/5">
                          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest block">
                            SHAP Value
                          </span>
                          <span className="text-xs font-mono text-gray-300 mt-0.5 block">
                            {(feature.value * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-black/40 border border-white/5">
                          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest block">
                            Z-Score
                          </span>
                          <span className="text-xs font-mono text-gray-300 mt-0.5 block">
                            {zScore} &sigma;
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-black/40 border border-white/5">
                          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest block">
                            Direction
                          </span>
                          <span className="text-xs font-mono text-gray-300 mt-0.5 block capitalize">
                            {direction}
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-black/40 border border-white/5 sm:col-span-3">
                          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest block">
                            Description
                          </span>
                          <p className="text-xs font-mono text-gray-400 mt-0.5 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
