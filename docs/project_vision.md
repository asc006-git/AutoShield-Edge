# Project Vision: AutoShield Edge

## Mission

To build an **Explainable, Predictive, and Self-Healing Vehicle Cyber Immune System** that operates at the edge, providing real-time protection for modern vehicles against cyber threats without relying on cloud connectivity.

## Core Pillars

### 1. Edge AI for Automotive Cybersecurity
Traditional vehicle security solutions rely on cloud-based threat analysis, introducing latency and connectivity dependency. AutoShield Edge runs inference directly on edge hardware (ECU-grade SoCs) using optimized lightweight models, ensuring sub-millisecond threat detection.

### 2. Predictive Cyber Health Monitoring
Continuous assessment of vehicle health metrics — anomaly frequency, attack severity, sensor integrity — to produce a dynamic **Cyber Health Score (CHS)**. This enables predictive maintenance and proactive defense before attacks escalate.

### 3. Explainable Threat Intelligence
AI-driven black-box detection is insufficient for safety-critical automotive environments. AutoShield Edge integrates SHAP-based explanations and rule-based reasoning to provide human-readable threat rationales — essential for ISO 21434 compliance and security auditor trust.

### 4. Autonomous Self-Healing Response
Upon threat detection, the system deploys targeted response agents that:
- Isolate compromised ECUs
- Filter malicious CAN messages
- Reset authenticated communication channels
- Generate forensic incident logs

## Technology Stack

| Layer               | Technology                          |
|---------------------|-------------------------------------|
| ML Framework        | Scikit-learn, XGBoost, PyTorch (TBD)|
| Explainability      | SHAP, LIME                          |
| Edge Runtime        | ONNX Runtime, TensorFlow Lite       |
| Dashboard           | Streamlit                           |
| Data Processing     | Pandas, NumPy, Feature-engine       |
| Visualization       | Matplotlib, Seaborn, Plotly         |

## Phase Roadmap

| Phase | Focus                          | Deliverables                              | Status |
|-------|--------------------------------|-------------------------------------------|--------|
| 1     | Foundation & Data Analysis     | Project structure, EDA, dataset report     | ✅ Done |
| 2     | Preprocessing & Feature Engineering | Schema normalization, parquet pipeline | ✅ Done |
| 3     | Baseline Anomaly Detection     | Isolation Forest, evaluation metrics      | ✅ Done |
| 4     | Behavioral Cyber Twin          | Rolling-window features, behavioral profiling | ✅ Done |
| 5     | Explainability & Response Agents | SHAP integration, self-healing agent    | 🔜 Q3 2026 |
| 6     | Dashboard & Edge Deployment    | Streamlit UI, ONNX runtime, fleet view   | 🔜 Q4 2026 |

## Achievements (Phases 1–4)

- Successfully processed 17.5M CAN messages across 5 datasets (DoS, Fuzzy, Gear, RPM, Normal) with a chunked preprocessing pipeline achieving <25MB peak memory usage.
- Engineered 19 features per message: 11 raw CAN fields, 4 payload statistics, temporal delta, entropy, and 2 attack labels.
- Built an Isolation Forest baseline achieving F1=0.112 on single-message features, revealing the fundamental limitation of message-level detection.
- Developed the Behavioral Cyber Twin engine with 13 rolling-window features across 5 behavioral categories, achieving ~350:1 data reduction with preserved temporal attack signatures.
- Comprehensive documentation of methodology, results, and feature importance across 7 detailed reports.

## Guiding Principles

- **Safety First**: False negatives in attack detection can have life-threatening consequences.
- **Interpretability by Design**: Every detection must be explainable to a human analyst.
- **Edge-Optimized**: Models must run efficiently on constrained hardware.
- **Defense in Depth**: Multiple layers of detection and response.
