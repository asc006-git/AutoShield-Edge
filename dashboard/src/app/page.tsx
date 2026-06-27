"use client";

import dynamic from "next/dynamic";

const DemonstrationApp = dynamic(() => import("@/components/DemonstrationApp"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="font-orbitron text-sm text-white/20 tracking-[0.3em] animate-pulse">
        LOADING
      </div>
    </div>
  ),
});

export default function Home() {
  return <DemonstrationApp />;
}
