import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { PipelineProvider } from "@/context/PipelineContext";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased h-full text-gray-100 overflow-hidden bg-black`}>
        <PipelineProvider>
          {children}
        </PipelineProvider>
      </body>
    </html>
  );
}
