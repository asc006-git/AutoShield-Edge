import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";
import Sidebar from "@/components/Sidebar";
import StartupSequence from "@/components/StartupSequence";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoShield Edge | Behavioral Cyber Twin for Connected Vehicles",
  description: "Explainable, Predictive and Self-Healing Vehicle Cyber Immune System powered by Edge AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased h-full text-gray-100 overflow-hidden bg-black`}>
        <DashboardProvider>
          <StartupSequence />
          <div className="flex h-screen w-screen overflow-hidden bg-black relative">
            <div className="absolute inset-0 monochrome-grid -z-20 pointer-events-none" />
            <div className="absolute inset-0 scanlines opacity-[0.08] -z-10 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[150px] -z-15 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.015] blur-[120px] -z-15 pointer-events-none" />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
