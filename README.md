# AutoShield Edge

**An Explainable, Predictive and Self-Healing Vehicle Cyber Immune System Powered by Edge AI**

> **Theme:** AI at the Edge Solutions for Automotive 
> **Subtheme:** Edge AI for Automotive Cybersecurity

---

## Problem Statement

Modern vehicles are increasingly software-defined, with over 100+ Electronic Control Units (ECUs) communicating via Controller Area Network (CAN) buses. These networks were designed decades ago without security in mind — no encryption, no authentication, no integrity checks. As vehicles become connected, the attack surface expands dramatically. A single compromised ECU can broadcast malicious CAN messages, leading to catastrophic safety failures: engine shutdown, brake manipulation, or steering override.

The automotive industry urgently needs a real-time, intelligent, and autonomous cybersecurity system that can detect, explain, and respond to threats at the edge — without relying on cloud connectivity.

---

## Existing Challenges

| Challenge | Description |
|-----------|-------------|
| **Legacy CAN Bus** | No built-in security; messages are broadcast in plaintext |
| **Resource Constraints** | ECUs have limited compute, memory, and power |
| **Real-Time Requirements** | Detection must happen in milliseconds, not seconds |
| **Class Imbalance** | Attacks are rare (99.99%+ normal traffic) |
| **Unstructured Data** | CAN datasets vary in schema, format, and labeling |
| **Explainability Gap** | ML models detect anomalies but cannot explain *why* |
| **No Autonomous Response** | Most systems alert only; they do not act |

---

## Proposed Solution

**AutoShield Edge** is a comprehensive vehicle cyber immune system that operates entirely at the edge. It combines:

- **Behavioral Cyber Twin** — A digital behavioral model of each vehicle's CAN bus, built from rolling-window statistical features that capture normal communication patterns.
- **Vehicle Cyber Health Score** — A continuous 0–100 health metric derived from real-time behavioral deviation analysis, enabling fleet-wide security posture monitoring.
- **Threat Detection Engine** — An unsupervised ensemble of Isolation Forest, LOF, and behavioral profile-matching models that detect zero-day attacks without labeled training data.
- **Self-Healing Agent** — An autonomous response module capable of filtering malicious messages, resetting compromised ECUs, and isolating network segments without human intervention.
- **Explainable Threat Analysis** — SHAP-based explanation engine and rule-based reasoner that translates model decisions into human-readable threat narratives for security analysts.

---

## Key Innovations

1. **Rolling-Window Behavioral Fingerprinting** — Converts raw CAN messages into behavioral feature windows (W=10/50/100) achieving ~350:1 data reduction while preserving temporal attack signatures.
2. **Unsupervised Zero-Day Detection** — Trained exclusively on normal driving data; detects novel attack patterns without requiring labeled attack samples.
3. **Edge-Native Architecture** — Optimized for ARM Cortex and NVIDIA Jetson platforms with ONNX runtime inference under 5ms per window.
4. **Autonomous Self-Healing** — Rule-based and ML-guided response policies that execute mitigation actions in under 50ms.
5. **Explainable by Design** — Every detection includes feature attribution, behavioral drift analysis, and plain-English threat description.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AutoShield Edge                           │
├─────────────────────────────────────────────────────────────┤
│   ┌──────────────────┐   ┌──────────────────────────────┐  │
│   │   CAN Bus        │   │   Preprocessing Pipeline     │  │
│   │   Message        │──▶│   - Schema Normalization     │  │
│   │   Capture        │   │   - Hex Decoding             │  │
│   └──────────────────┘   │   - Feature Extraction       │  │
│                          │   - Temporal Alignment        │  │
│                          └──────────────┬───────────────┘  │
│                                         │                  │
│                          ┌──────────────▼───────────────┐  │
│                          │   Behavioral Cyber Twin      │  │
│                          │   - Rolling-Window Features  │  │
│                          │   - Behavioral Profiles      │  │
│                          │   - Drift Detection          │  │
│                          └──────────────┬───────────────┘  │
│                                         │                  │
│              ┌───────────────────────────┼──────────┐     │
│              ▼                           ▼          │     │
│   ┌──────────────────┐   ┌──────────────────────┐  │     │
│   │ Threat Detection │   │ Cyber Health Score   │  │     │
│   │ Engine           │   │ (0–100)              │  │     │
│   │ - Ensemble Models│   │ - Behavioral Drift   │  │     │
│   │ - Anomaly Scores │   │ - Attack Severity    │  │     │
│   │ - Confidence     │   │ - Temporal Decay     │  │     │
│   └────────┬─────────┘   └──────────┬───────────┘  │     │
│            │                        │               │     │
│   ┌────────▼────────────────────────▼───────────┐  │     │
│   │    Explainable Threat Analysis               │  │     │
│   │    - SHAP Attribution                        │  │     │
│   │    - Rule-Based Reasoning                    │  │     │
│   │    - Threat Narrative Generation             │  │     │
│   └───────────────────┬──────────────────────────┘  │     │
│                       │                              │     │
│   ┌───────────────────▼──────────────────────────┐  │     │
│   │    Self-Healing Agent                         │  │     │
│   │    - Message Filtering                       │  │     │
│   │    - ECU Reset / Isolation                   │  │     │
│   │    - Mitigation Policy Engine                │  │     │
│   └──────────────────────────────────────────────┘  │     │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Progress

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Foundation & EDA — Dataset exploration, statistical analysis, 7 research visualizations |
| **Phase 2** | ✅ Complete | Preprocessing — Schema normalization, feature engineering, chunked parquet conversion (17.5M rows, 19 features, <25MB peak memory) |
| **Phase 3** | ✅ Complete | Anomaly Detection — Isolation Forest baseline on single-message features (F1=0.112); identified need for behavioral features |
| **Phase 4** | ✅ Complete | Behavioral Cyber Twin — Rolling-window feature engine (W=10/50/100), 13 behavioral features, ~350:1 data reduction |
| **Phase 5** | 🔜 In Progress | Self-Healing Agent — Policy engine design and simulation environment |
| **Phase 6** | 🔜 Planned | Dashboard & Integration — Streamlit UI, fleet monitoring, ONNX deployment |

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Languages** | Python 3.10+ |
| **Data Processing** | Pandas, NumPy, PyArrow |
| **Machine Learning** | Scikit-learn (Isolation Forest, LOF, ensemble), Imbalanced-learn |
| **Explainability** | SHAP |
| **Visualization** | Matplotlib, Seaborn, Plotly |
| **Edge Deployment** | ONNX Runtime (targeting Jetson Nano / ARM Cortex) |
| **Backend / API** | FastAPI |
| **Dashboard** | Streamlit |
| **Infrastructure** | Docker, GitHub Actions |

---

## Project Structure

```
AutoShield-Edge/
├── assets/                    # Visualizations & research plots
├── docs/                      # Architecture & design documentation
│   └── project_vision.md      # Vision, roadmap & system design
├── reports/                   # Analysis reports by phase
│   ├── dataset_analysis_report.md
│   ├── final_feature_schema.md
│   ├── preprocessing_report.md
│   ├── anomaly_detection_report.md
│   ├── phase3_summary.md
│   ├── behavioral_feature_report.md
│   └── phase4_behavior_summary.md
├── scripts/                   # Analysis & investigation scripts
│   ├── dataset_analysis.py
│   └── investigate_features.py
├── src/                       # Core source code
│   ├── preprocessing/         # Phase 2: Data cleaning & feature engineering
│   │   └── preprocess_can_data.py
│   ├── anomaly_detection/     # Phase 3–4: ML models & behavioral engine
│   │   ├── isolation_forest_detector.py
│   │   └── behavioral_feature_engine.py
│   ├── cyber_health/          # Phase 5: Health scoring (placeholder)
│   ├── threat_explanation/    # Phase 5: XAI engine (placeholder)
│   ├── response_agent/        # Phase 5: Self-healing agent (placeholder)
│   └── dashboard/             # Phase 6: Monitoring UI (placeholder)
├── .gitignore
├── README.md
└── requirements.txt
```

---

## Roadmap

```
Phase 1 ████████████████████████████████ 100%  Foundation & EDA
Phase 2 ████████████████████████████████ 100%  Preprocessing Pipeline
Phase 3 ████████████████████████████████ 100%  Baseline Anomaly Detection
Phase 4 ████████████████████████████████ 100%  Behavioral Cyber Twin
Phase 5 ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 15%   Self-Healing & XAI
Phase 6 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%    Dashboard & Integration
```

### Near-Term Milestones (Q3 2026)
- [X] Phase 1: Dataset exploration and EDA complete
- [X] Phase 2: Preprocessing pipeline with parquet conversion
- [X] Phase 3: Isolation Forest baseline with evaluation
- [X] Phase 4: Behavioral Cyber Twin feature engine
- [ ] Phase 5a: Explainable Threat Analysis with SHAP
- [ ] Phase 5b: Self-Healing Agent policy engine
- [ ] Phase 6: Streamlit dashboard prototype

### Mid-Term Goals (Q4 2026)
- [ ] ONNX model export and edge deployment
- [ ] Real-time CAN bus integration (PCAN / SocketCAN)
- [ ] Multi-vehicle fleet monitoring
- [ ] Adversarial robustness evaluation

### Long-Term Vision (2027)
- [ ] Full zero-trust automotive security suite
- [ ] Over-the-air (OTA) policy updates
- [ ] OEM collaboration and production validation

---

## Future Work

1. **Enhanced Detection Ensemble** — Integrate XGBoost with behavioral features, autoencoder-based anomaly detection, and temporal convolution networks (TCN) for sequence-aware threat detection.
2. **Federated Behavioral Profiles** — Privacy-preserving fleet-wide model training using federated learning across vehicles.
3. **Multi-Bus Support** — Extend beyond CAN to CAN-FD, LIN, FlexRay, and Automotive Ethernet.
4. **Hardware Acceleration** — Quantized ONNX models targeting NVIDIA Jetson Orin, Raspberry Pi CM4, and automotive-grade SoCs.
5. **Regulatory Compliance** — Align with UN R155, ISO/SAE 21434, and upcoming NHTSA cybersecurity regulations.
6. **Red Team Tooling** — Build an adversary simulation framework for testing detection and response capabilities.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/asc006-git/AutoShield-Edge.git
cd AutoShield-Edge

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Linux / macOS
.venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run dataset analysis
python scripts/dataset_analysis.py

# Run preprocessing
python -m src.preprocessing.preprocess_can_data

# Run anomaly detection
python -m src.anomaly_detection.isolation_forest_detector

# Run behavioral feature engineering
python -m src.anomaly_detection.behavioral_feature_engine
```

> **Note:** Raw datasets (CSV/TXT) and processed parquet files are excluded from version control. See `.gitignore` for details. Place datasets in `dataset/` and processed data in `data/` following the expected directory structure.

---

## License

Proprietary — All Rights Reserved.  
**AutoShield Edge** © 2026
