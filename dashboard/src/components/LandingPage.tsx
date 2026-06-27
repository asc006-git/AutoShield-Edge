"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePipeline, AttackType } from "@/context/PipelineContext";
import { ArrowRight, Cpu, ShieldCheck, Zap, Radio, HeartPulse, Terminal } from "lucide-react";
import GlassCard from "@/components/GlassCard";

const systemPhases = [
  { id: 1, name: "Data Acquisition", sub: "Raw CAN messages capture" },
  { id: 2, name: "Preprocessing", sub: "Delta-time, hex parsing" },
  { id: 3, name: "Baseline IDS", sub: "Isolation Forest (per-packet)" },
  { id: 4, name: "Cyber Twin", sub: "Sliding-window behavioral twin" },
  { id: 5, name: "Behavioral IDS", sub: "OC-SVM Ensemble (consensus)" },
  { id: 6, name: "Cyber Health Engine", sub: "aggregate 0-100 cyber score" },
  { id: 7, name: "Threat Story", sub: "Attribution & AI narrative" },
  { id: 8, name: "Defense Agent", sub: "Autonomous levels containment" },
  { id: 9, name: "Vehicle Recovery", sub: "Recalibration & Segment restore" },
];

const ATTACK_OPTIONS: { id: AttackType; label: string; desc: string }[] = [
  { id: "normal", label: "Normal Driving", desc: "No attack — baseline behavior" },
  { id: "dos", label: "DoS Injection", desc: "CAN bus flooding attack" },
  { id: "fuzzy", label: "Fuzzy Attack", desc: "Random malicious CAN IDs" },
  { id: "gear", label: "Gear Spoof", desc: "Fabricated gear messages" },
  { id: "rpm", label: "RPM Spoof", desc: "Fabricated RPM messages" },
];

export default function LandingPage() {
  const { setCurrentPage, selectedAttack, setSelectedAttack, runSimulation } = usePipeline();

  const handleStartDemo = async () => {
    await runSimulation(selectedAttack);
    setCurrentPage("pipeline");
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden p-6 md:p-12 lg:p-16">
      {/* Volumetric ambient background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] rounded-full bg-white blur-[250px] opacity-[0.02] animate-pulse duration-10000" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-white blur-[200px] opacity-[0.015]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 monochrome-grid opacity-[0.05] pointer-events-none -z-10" />
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none -z-10" />

      {/* Top Header bar */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2.5">
          <Cpu className="h-5 w-5 text-white/70" />
          <span className="font-orbitron font-bold text-sm tracking-widest text-white">AUTOSHIELD EDGE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider">SECURE CONNECTED ARCHITECTURE</span>
          <span className="px-2 py-0.5 text-[8px] font-mono border border-white/20 rounded bg-white/5 text-gray-400">v2.0.0</span>
        </div>
      </header>

      {/* Main hero area */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 max-w-7xl mx-auto w-full mb-12">
        {/* Left Side: Branding + CTA */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]"
            >
              <ShieldCheck className="h-3 w-3 text-white/80" />
              <span className="text-[9px] font-mono text-gray-300 tracking-wider uppercase">
                Deployed AI Cyber Immune System
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-orbitron text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-none text-glow"
            >
              AUTOSHIELD
              <span className="block font-orbitron text-glow-intense text-white/80 mt-1">EDGE</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-gray-400 font-mono leading-relaxed max-w-lg"
          >
            A Behavioral Cyber Twin platform for connected vehicles. Utilizing windowed One-Class SVM models and SHAP explainability on the edge, AutoShield provides zero-shot threat detection and autonomous self-healing recovery.
          </motion.p>

          {/* Attack selector */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap gap-2"
          >
            {ATTACK_OPTIONS.map((atk) => {
              const isSelected = selectedAttack === atk.id;
              return (
                <button
                  key={atk.id}
                  onClick={() => setSelectedAttack(atk.id)}
                  className={`px-3 py-1.5 rounded text-[9px] font-orbitron font-bold tracking-wider border transition-all duration-200 ${
                    isSelected
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                  title={atk.desc}
                >
                  {atk.label.toUpperCase()}
                </button>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2"
          >
            <button
              onClick={handleStartDemo}
              className="group flex items-center gap-2.5 px-6 py-3 rounded-lg border border-white/20 bg-white text-black font-semibold text-xs font-orbitron tracking-widest hover:bg-black hover:text-white hover:border-white/40 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.25)]"
            >
              START LIVE DEMONSTRATION
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </motion.div>

          {/* Quick stats badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-600 block">ENSEMBLE F1</span>
              <span className="font-orbitron font-bold text-base text-gray-300">0.815</span>
              <span className="text-[8px] font-mono text-gray-500 block">vs 0.112 Baseline</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-600 block">EDGE LATENCY</span>
              <span className="font-orbitron font-bold text-base text-gray-300">&lt; 3.2ms</span>
              <span className="text-[8px] font-mono text-gray-500 block">Real-time inference</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-600 block">REDUCTION</span>
              <span className="font-orbitron font-bold text-base text-gray-300">350:1</span>
              <span className="text-[8px] font-mono text-gray-500 block">Windowed pooling</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Vehicle Blueprint & Pipeline Visual */}
        <div className="lg:col-span-6 flex flex-col gap-6 justify-center">
          <GlassCard className="relative overflow-hidden border border-white/10 bg-black/40 p-6 flex flex-col justify-center min-h-[360px]" hoverable={false}>
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <Terminal className="h-3 w-3 text-gray-400" />
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">SYSTEM ARCHITECTURE PHASES</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5 mt-8">
              {systemPhases.map((phase) => (
                <div
                  key={phase.id}
                  className="p-3 rounded bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between hover:border-white/15 transition-all duration-300 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-orbitron font-semibold text-gray-500">PHASE {phase.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-orbitron font-bold text-white tracking-wide truncate">{phase.name}</h3>
                    <p className="text-[8px] font-mono text-gray-500 mt-0.5 line-clamp-1 leading-tight">{phase.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-500">
              <span className="flex items-center gap-1"><Radio className="h-2.5 w-2.5 text-gray-400" /> CAN Ingress: 1250 pkt/s</span>
              <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-gray-400" /> Autonomous Countermeasures</span>
              <span className="flex items-center gap-1"><HeartPulse className="h-2.5 w-2.5 text-gray-400" /> Safe Recovery</span>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Footer info */}
      <footer className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-gray-600 gap-4 mt-6">
        <div>
          <span>© 2026 DEEPMIND ADVANCED AGENTIC DEVELOPMENT — AUTOSHIELD EDGE DEMO</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">MODEL SCHEMAS</a>
          <a href="#" className="hover:text-white transition-colors">THREAT PLAYBOOKS</a>
          <a href="#" className="hover:text-white transition-colors">SECURITY ENCLAVE</a>
        </div>
      </footer>
    </div>
  );
}
