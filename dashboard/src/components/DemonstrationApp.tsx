"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipeline, PageState } from "@/context/PipelineContext";
import { Cpu, Shield, LogOut } from "lucide-react";
import LandingPage from "@/components/LandingPage";
import PipelinePage from "@/components/PipelinePage";

const PAGES: Record<PageState, React.FC> = {
  landing: LandingPage,
  pipeline: PipelinePage,
};

export default function DemonstrationApp() {
  const { currentPage, setCurrentPage } = usePipeline();

  const ActivePage = PAGES[currentPage];

  const showHeader = currentPage !== "landing";

  const tabs: { id: PageState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "pipeline", label: "Pipeline Demo", icon: Cpu },
  ];

  return (
    <div className="min-h-screen w-screen flex flex-col overflow-x-hidden bg-black text-gray-100 relative">
      {/* Global backgrounds */}
      <div className="absolute inset-0 monochrome-grid opacity-[0.05] pointer-events-none -z-20" />
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none -z-10" />

      {/* Volumetric background lights */}
      {showHeader && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-white/[0.012] blur-[160px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.008] blur-[140px]" />
        </div>
      )}

      {/* Header bar */}
      {showHeader && (
        <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <div 
            onClick={() => setCurrentPage("landing")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Shield className="h-4.5 w-4.5 text-white/80 group-hover:scale-105 transition-transform" />
            <span className="font-orbitron font-extrabold text-xs tracking-widest text-white">
              AUTOSHIELD <span className="text-white/60">EDGE</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5">
            {tabs.map((tab) => {
              const isActive = currentPage === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentPage(tab.id)}
                  className="relative px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider uppercase transition-colors"
                >
                  <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? "text-black" : "text-gray-400 hover:text-white"}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-white rounded-md z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions: exit demo */}
          <div>
            <button
              onClick={() => setCurrentPage("landing")}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-mono text-gray-500 hover:text-white border border-transparent hover:border-white/10 rounded transition-all"
            >
              <LogOut className="h-3 w-3" />
              EXIT DEMO
            </button>
          </div>
        </header>
      )}

      {/* Page Content area */}
      <main className={`flex-1 ${showHeader ? "p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full w-full"
          >
            <ActivePage />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
