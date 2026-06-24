"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";

const ECU_NODES = [
  { label: "CGW", canId: "0x0A" },
  { label: "ECU", canId: "0x12" },
  { label: "TCU", canId: "0x1A" },
  { label: "EPS", canId: "0x24" },
  { label: "ABS", canId: "0x32" },
  { label: "BCM", canId: "0x48" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function StartupSequence() {
  const { completeStartup } = useDashboard();
  const [phase, setPhase] = useState(0);
  const [show, setShow] = useState(true);
  const [score, setScore] = useState(0);
  const [litEcu, setLitEcu] = useState(-1);

  const advancePhase = useCallback(() => {
    setPhase((p) => Math.min(p + 1, 7));
  }, []);

  useEffect(() => {
    if (phase >= 7) return;
    const delays = [500, 900, 600, 900, 1100, 900, 1000];
    const t = setTimeout(advancePhase, delays[phase]);
    return () => clearTimeout(t);
  }, [phase, advancePhase]);

  useEffect(() => {
    if (phase === 4) {
      ECU_NODES.forEach((_, i) => {
        setTimeout(() => setLitEcu(i), i * 180);
      });
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 6) {
      setScore(0);
      const interval = setInterval(() => {
        setScore((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 22);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 7) {
      const t = setTimeout(() => {
        completeStartup();
        setShow(false);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [phase, completeStartup]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 monochrome-grid-dense opacity-30 pointer-events-none" />

          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white blur-[160px]" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-white blur-[120px]" />
          </div>

          <div className="absolute top-0 left-0 right-0 h-px scanner-line pointer-events-none" />

          <motion.div
            className="flex flex-col items-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {phase >= 1 && (
              <motion.div
                key="vehicle"
                variants={staggerItem}
                className="mb-6 opacity-0"
                style={{ animation: phase >= 1 ? "none" : undefined }}
              >
                <svg
                  width="200"
                  height="70"
                  viewBox="0 0 200 70"
                  fill="none"
                  className="vehicle-glow"
                >
                  <motion.path
                    d="M18 50 L22 35 Q25 27 32 24 L55 20 Q65 18 75 20 L135 20 Q145 18 155 20 L172 26 Q180 30 183 38 L186 50 L175 52 L160 48 L145 52 Q140 54 135 52 L75 52 Q70 54 65 52 L48 48 L30 52 L18 50 Z"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="rgba(255,255,255,0.03)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M38 26 L58 23 L78 23 L82 34 L44 34 Z"
                    stroke="white"
                    strokeWidth="1"
                    fill="rgba(255,255,255,0.06)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M86 23 L126 23 L136 34 L92 34 Z"
                    stroke="white"
                    strokeWidth="1"
                    fill="rgba(255,255,255,0.06)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: "easeInOut" }}
                  />
                  <motion.circle
                    cx="52"
                    cy="50"
                    r="7"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="rgba(255,255,255,0.06)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                  />
                  <motion.circle
                    cx="148"
                    cy="50"
                    r="7"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="rgba(255,255,255,0.06)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                  />
                  <motion.line
                    x1="52"
                    y1="43"
                    x2="52"
                    y2="50"
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 1.1 }}
                  />
                  <motion.line
                    x1="148"
                    y1="43"
                    x2="148"
                    y2="50"
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 1.1 }}
                  />
                </svg>
              </motion.div>
            )}

            {phase >= 2 && (
              <motion.div
                key="logo"
                variants={staggerItem}
                className="text-center"
              >
                <h1 className="font-orbitron text-4xl md:text-7xl font-bold tracking-[0.15em] text-white text-glow-strong">
                  AUTOSHIELD
                  <br />
                  <span className="text-5xl md:text-8xl">EDGE</span>
                </h1>
              </motion.div>
            )}

            {phase >= 3 && (
              <motion.p
                key="tagline"
                variants={staggerItem}
                className="mt-3 text-xs md:text-sm text-gray-500 tracking-[0.25em] uppercase font-mono"
              >
                Behavioral Cyber Twin for Connected Vehicles
              </motion.p>
            )}

            {phase >= 4 && (
              <motion.div
                key="canbus"
                variants={staggerItem}
                className="mt-10 w-full max-w-xl px-6"
              >
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-[8%] right-[8%] h-px bg-gray-800 top-1/2" />
                  {ECU_NODES.map((ecu, i) => {
                    const isLit = i <= litEcu;
                    return (
                      <motion.div
                        key={ecu.canId}
                        className="relative flex flex-col items-center z-10"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.12, duration: 0.35, ease: "backOut" }}
                      >
                        <div
                          className={`w-px h-5 transition-colors duration-500 ${
                            isLit ? "bg-white/50" : "bg-gray-800"
                          }`}
                        />
                        <motion.div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                            isLit
                              ? "border-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.35)]"
                              : "border-gray-700 bg-black"
                          }`}
                        >
                          <motion.div
                            className={`w-2 h-2 rounded-full transition-all duration-500 ${
                              isLit ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" : "bg-gray-700"
                            }`}
                          />
                        </motion.div>
                        <span
                          className={`text-[9px] font-mono mt-1.5 tracking-wider transition-all duration-500 ${
                            isLit ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {ecu.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase >= 5 && (
              <motion.div
                key="shield"
                variants={staggerItem}
                className="mt-8"
              >
                <svg
                  width="72"
                  height="86"
                  viewBox="0 0 72 86"
                  fill="none"
                  className="vehicle-glow"
                >
                  <motion.path
                    d="M36 4 L68 18 L68 44 Q68 66 36 82 Q4 66 4 44 L4 18 Z"
                    stroke="white"
                    strokeWidth="2"
                    fill="rgba(255,255,255,0.02)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M24 42 L34 52 L50 34"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>
            )}

            {phase >= 6 && (
              <motion.div
                key="score"
                variants={staggerItem}
                className="mt-8 text-center"
              >
                <div className="text-[10px] text-gray-600 font-mono tracking-[0.3em] mb-1">
                  CYBER HEALTH SCORE
                </div>
                <div className="font-orbitron text-5xl md:text-6xl font-bold text-white text-glow">
                  {score}%
                </div>
                <div className="mt-2 w-48 h-[2px] mx-auto bg-gray-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {phase >= 1 && phase < 7 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      phase >= dot ? "bg-white/60 shadow-[0_0_6px_rgba(255,255,255,0.4)]" : "bg-gray-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
