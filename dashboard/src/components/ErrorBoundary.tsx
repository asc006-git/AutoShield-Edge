"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in AutoShield app:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-black p-6">
          <div className="max-w-md w-full glass-panel border border-red-500/20 bg-red-500/5 p-6 rounded-lg text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-red-500 animate-bounce" />
            </div>
            <h1 className="font-orbitron font-bold text-lg text-white">Application Exception</h1>
            <p className="text-xs font-mono text-gray-400">
              An unexpected error occurred in the AutoShield visualizer pipeline.
            </p>
            <div className="p-3 bg-black/40 border border-white/5 rounded text-left overflow-x-auto max-h-[150px] scrollbar-thin">
              <pre className="text-[10px] font-mono text-red-400 leading-tight">
                {this.state.error?.toString() || "Unknown error"}
              </pre>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-white text-black font-orbitron font-bold text-xs rounded hover:bg-white/90 transition-all duration-200"
            >
              RETRY PIPELINE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
