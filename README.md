# AutoShield Edge

**Behavioral Cyber Twin for Connected Vehicles**

<<<<<<< HEAD
> **Theme:** AI at the Edge Solutions for Automotive 
> **Subtheme:** Edge AI for Automotive Cybersecurity
=======
[![Python](https://img.shields.io/badge/python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-orange)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

AutoShield Edge is an edge-AI cyber immune system for connected vehicles. It uses a Behavioral Cyber Twin — a real-time digital replica of CAN bus communication patterns — to detect zero-day cyber attacks with explainable AI, assess vehicle cyber health, and deploy autonomous self-healing countermeasures.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [AI Pipeline](#ai-pipeline)
- [System Workflow](#system-workflow)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Machine Learning Methodology](#machine-learning-methodology)
- [Supported Attack Types](#supported-attack-types)
- [Pipeline Stages](#pipeline-stages)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Datasets](#datasets)
- [Trained Model](#trained-model)
- [Evaluation Metrics](#evaluation-metrics)
- [Achievements](#achievements)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

Modern vehicles contain 100+ million lines of code across 70+ Electronic Control Units (ECUs) connected by internal Controller Area Network (CAN) buses. These networks lack basic security controls — no encryption, no authentication, no integrity checks. A single compromised ECU can send forged CAN messages to disable brakes, manipulate steering, or override engine controls.

AutoShield Edge addresses this by deploying a **Behavioral Cyber Twin** — a real-time machine learning model that learns the normal communication patterns of each vehicle and flags deviations indicative of cyber attacks. The system:

- Processes CAN bus messages into behavioral windows
- Extracts 13 statistical features per window
- Runs inference through a One-Class SVM (OC-SVM) trained exclusively on normal driving data
- Computes a 0–100 Cyber Health Score from anomaly signals
- Generates explainable feature attributions for each detection
- Produces human-readable threat narratives with root cause analysis
- Deploys autonomous defense actions across 5 response levels
- Recovers vehicle systems and verifies post-mitigation integrity

All inference runs on the edge with no runtime training — the model is pre-trained offline and loaded at startup.
>>>>>>> 7134c19 (RC: restore all visualizations, reports, documentation; fix gitignore; add smoke tests)

---

## Problem Statement

- **CAN buses have no built-in security** — no encryption, authentication, or access control
- **100M+ lines of code** across 70+ ECUs create an enormous attack surface
- **Signature-based IDS** cannot detect zero-day or novel attacks
- **Centralized cloud detection** introduces latency and connectivity dependency
- **Existing ML-based approaches** lack explainability and autonomous response
- **17.5M CAN messages** in the benchmark dataset demonstrate the data volume challenge

---

## Solution

AutoShield Edge provides an **edge-native, explainable, and autonomous** defense pipeline:

| Capability | Approach |
|---|---|
| **Zero-day detection** | One-class anomaly detection (unsupervised) |
| **Explainability** | Per-feature z-score attribution per window |
| **Cyber health** | 0–100 composite score with trend forecasting |
| **Threat narrative** | Rule-based story generation with root cause |
| **Autonomous response** | 5-level defense agent with targeted playbooks |
| **Edge deployment** | Inference-only backend, no runtime training |

---

## Key Features

- **Behavioral Cyber Twin**: Rolling-window digital replica of CAN bus behavior (13 features, W=50)
- **Zero-Shot Anomaly Detection**: One-Class SVM trained only on normal data — detects any unseen attack pattern
- **Cyber Health Score Engine**: 0–100 continuous health score with 3 components (Threat, Stability, Pressure)
- **Feature Attribution Engine**: Per-instance explainability via z-score deviation analysis
- **Threat Story Engine**: Human-readable narratives with root cause attribution and impact assessment
- **Autonomous Defense Agent**: 5-level response (Monitor → Alert → Contain → Mitigate → Emergency)
- **Real-Time Dashboard**: Next.js frontend with live SSE streaming of all 9 pipeline stages
- **Inference-Only Backend**: OC-SVM model loaded at startup; no runtime training

---

## AI Pipeline

```
CAN Messages (17.5M)
    │
    ▼
┌─────────────────────────────────────────────────────┐
│          OFFLINE PREPROCESSING & TRAINING            │
│                                                     │
│  Raw CAN CSV/TXT → Preprocessing (19 features)      │
│  → Behavioral Windowing (W=50, 13 features)         │
│  → OC-SVM Training (normal data only)               │
│  → Save model to data/models/ocsvm_model.joblib     │
└─────────────────────────────────────────────────────┘
    │ (model + data loaded at startup)
    ▼
┌─────────────────────────────────────────────────────┐
│          RUNTIME INFERENCE PIPELINE                  │
│                                                     │
│  1. Data Acquisition     → Load behavioral windows   │
│  2. Sliding Window       → Segment into W=50 frames  │
│  3. Feature Extraction   → Compute 13 features       │
│  4. Threat Detection     → OC-SVM anomaly score      │
│  5. Cyber Health Score   → 0–100 composite score     │
│  6. Feature Attribution  → Z-score contributions     │
│  7. Threat Story         → Narrative + root cause    │
│  8. Defense Agent        → 5-level response          │
│  9. Vehicle Recovery     → Health restoration        │
└─────────────────────────────────────────────────────┘
    │ (SSE streamed to frontend)
    ▼
            Next.js Dashboard
```

---

## System Workflow

1. **User selects an attack scenario** from 5 options (Normal, DoS Flood, Fuzzing, Gear Spoof, RPM Spoof)
2. **Backend executes the 9-stage pipeline** using real precomputed behavioral data and the loaded OC-SVM model
3. **SSE streams each stage** with execution metadata, logs, and computed values
4. **Frontend renders each stage** as it arrives — timeline, content panel, log console
5. **Summary aggregates all stages** into an execution flow graph with health delta metrics

---

## Architecture Overview

```
┌──────────────┐       SSE Streaming        ┌──────────────┐
│   FastAPI    │ ◄──────────────────────►   │   Next.js    │
│   Backend    │    POST /api/pipeline/run   │   Frontend   │
│   :8000      │    GET  /api/health         │   :3000      │
│              │    GET  /api/stats          │              │
└──────┬───────┘                             └──────────────┘
       │
       ▼
┌──────────────┐
│  Data Layer  │
│  ─────────── │
│  behavioral/ │  ← 5 parquet files (W=50)
│  models/     │  ← ocsvm_model.joblib + scaler.joblib
└──────────────┘
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | FastAPI 0.115 (Python 3.11) |
| **Model** | One-Class SVM (scikit-learn 1.5) |
| **Data Processing** | pandas 2.2, NumPy 1.26, pyarrow 17 |
| **API Server** | Uvicorn 0.30 |
| **Frontend Framework** | Next.js 16 (TypeScript 5) |
| **UI Library** | React 19, Framer Motion 12 |
| **Icons** | Lucide React 1.21 |
| **Styling** | Tailwind CSS 4 |
| **Serialization** | Joblib (model), parquet (data) |

---

## Backend Architecture

The backend (`src/api/main.py`) is a single-file FastAPI application that:

1. **Loads data at startup**: Reads 5 behavioral parquet files (normal, dos, fuzzy, gear, rpm × W=50)
2. **Loads pre-trained model**: Deserializes OC-SVM from `data/models/ocsvm_model.joblib`
3. **Executes inference**: `decision_function()` on all loaded data
4. **Computes health scores**: Exponential z-score decay formula with 3 components
5. **Streams pipeline results**: SSE with per-stage metadata and timing
6. **Falls back to precomputed stories/actions**: `reports/threat_stories.json` and `reports/response_history.json`

### Key Modules

| Module | Path | Purpose |
|---|---|---|
| `CyberHealthEngine` | `src/cyber_health/cyber_health_engine.py` | 0–100 health scoring with trend/forecast |
| `ThreatStoryEngine` | `src/threat_explanation/threat_story_engine.py` | Rule-based narrative generation |
| `SelfHealingAgent` | `src/response_agent/self_healing_agent.py` | 5-level autonomous defense agent |

---

## Frontend Architecture

The dashboard is a Next.js 16 app with React 19, organized as:

```
dashboard/src/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout + PipelineProvider
│   ├── page.tsx             # Entry point with ErrorBoundary
│   └── globals.css          # Global styles + Tailwind theme
├── components/              # React components
│   ├── DemonstrationApp.tsx  # Root orchestrator with header/nav
│   ├── LandingPage.tsx       # Landing page with stats + attack picker
│   ├── PipelinePage.tsx      # 9-stage pipeline demo with timeline
│   ├── CyberHealthGauge.tsx  # SVG arc gauge for health score
│   ├── GlassCard.tsx         # Reusable glassmorphism card
│   └── ErrorBoundary.tsx     # Render error recovery
├── constants/
│   └── attacks.ts           # Shared attack definitions
└── context/
    └── PipelineContext.tsx   # Global state + SSE streaming + API calls
```

---

## Machine Learning Methodology

### Model: One-Class SVM

- **Algorithm**: `OneClassSVM(nu=0.01, kernel='rbf', gamma='scale')`
- **Training data**: 19,777 normal driving behavioral windows (W=50)
- **Test data**: 351,166 windows (19,777 normal + 331,389 attack)
- **Features**: 13 behavioral features across 5 categories
- **Threshold**: 5th percentile of training decision function scores

### Feature Categories

| Category | Features |
|---|---|
| Communication Rate | `messages_per_second` |
| CAN Diversity | `unique_can_ids_window`, `can_id_entropy` |
| Timing | `window_delta_time_mean`, `window_delta_time_std`, `window_delta_time_min`, `window_delta_time_max` |
| Payload | `window_payload_mean`, `window_payload_std`, `window_payload_entropy_mean` |
| Attack Pressure | `message_burst_score`, `frequency_spike_score`, `payload_instability_score` |

### Cyber Health Formula

```
Health = Threat Component (40 pts)
       + Stability Component (30 pts)
       + Pressure Component (30 pts)

Each component = exponential decay of z-score deviation
               from learned normal baselines
```

---

## Supported Attack Types

| Attack | ID | Description | Target ECU |
|---|---|---|---|
| Normal Driving | `normal` | Baseline nominal traffic | None |
| DoS Flood | `dos` | CAN gateway saturation | Central Gateway (0x0A) |
| Fuzzing | `fuzzy` | Payload byte injection | ABS Module (0x32) |
| Gear Spoofing | `gear` | TCU signal manipulation | Transmission Control (0x1A) |
| RPM Spoofing | `rpm` | ECU velocity override | Engine Control (0x12) |

---

## Pipeline Stages

### Stage 1: Data Acquisition
Load behavioral window dataset from parquet files. Identify attack-type-specific windows.

### Stage 2: Sliding Window Segmentation
Segment CAN message streams into non-overlapping windows of W=50 frames to capture temporal behavioral patterns.

### Stage 3: Behavioral Feature Extraction
Compute 13 statistical features per window across 5 behavioral dimensions: communication rate, CAN ID diversity, timing regularity, payload statistics, and attack pressure.

### Stage 4: AI Threat Detection Engine
Run the OC-SVM model inference — measures how far each window's feature vector deviates from the learned normal boundary. Windows below the 5th percentile threshold are flagged as anomalies.

### Stage 5: Cyber Health Score Engine
Compute a 0–100 health score from three components: threat severity (anomaly score), behavioral stability (CAN diversity + timing), and attack pressure (burst + frequency intensity).

### Stage 6: Feature Attribution Engine
Analyze z-score deviations of each feature from learned normal baselines to identify which behavioral signals most contribute to the anomaly classification.

### Stage 7: Explainable Threat Story
Generate a human-readable narrative with root cause attribution, risk category, impact assessment, and recommended response actions.

### Stage 8: Autonomous Defense Agent
Select and deploy a response level (0–4) based on attack severity, affected ECU criticality, and current vehicle state. Executes targeted mitigation actions.

### Stage 9: Vehicle Recovery & Stabilization
Compute health recovery trajectory, verify all ECUs return to secure state, and report end-to-end mitigation latency.

---

## API Overview

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Backend health check |
| `GET` | `/api/stats` | Model statistics (F1, latency, reduction) |
| `GET` | `/api/telemetry` | Runtime telemetry (CAN rate, CPU, latency) |
| `GET` | `/api/cyber-health` | Current cyber health score + forecast |
| `GET` | `/api/cyber-health/history` | Sampled health score history |
| `GET` | `/api/detection/models` | Precomputed model metrics |
| `GET` | `/api/detection/per-attack` | Per-attack health statistics |
| `GET` | `/api/detection/features` | Feature importance ranking |
| `GET` | `/api/twin/status` | Digital twin baseline metrics |
| `GET` | `/api/twin/ecus` | ECU status definitions |
| `GET` | `/api/story` | Single threat story |
| `GET` | `/api/stories` | All 5 threat stories |
| `GET` | `/api/defense` | Current defense level status |
| `POST` | `/api/defense/respond` | Execute defense for attack type |
| `GET` | `/api/system/architecture` | Pipeline phase descriptions |
| `POST` | `/api/pipeline/run` | **Execute full pipeline (SSE)** |
| `GET` | `/api/performance/metrics` | Detailed model comparison metrics |

---

## Project Structure

```
AutoShield-Edge/
├── assets/                       # Generated evaluation visualizations (9 PNG files)
├── dashboard/                    # Next.js 16 frontend
│   ├── src/
│   │   ├── app/                  # App Router pages + layout
│   │   ├── components/           # 6 React components
│   │   ├── constants/            # Shared attack definitions
│   │   └── context/              # Pipeline context + SSE streaming
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── data/
│   ├── behavioral/               # 5 behavioral window parquet files (W=50)
│   └── models/                   # Trained OC-SVM model + StandardScaler
├── reports/
│   ├── *.md                      # 14 evaluation reports (Phases 1-8)
│   ├── threat_stories.json       # 5 attack threat story examples
│   └── response_history.json     # 5 defense response decisions
├── scripts/
│   └── generate_visualizations.py  # Evaluation figure generator
├── src/
│   ├── api/
│   │   ├── main.py               # FastAPI application (17 endpoints, 1500 lines)
│   │   ├── requirements.txt      # Python dependencies
│   │   └── test_api.py           # 9 pytest smoke tests
│   ├── cyber_health/
│   │   ├── __init__.py
│   │   └── cyber_health_engine.py  # 0-100 health scoring engine
│   ├── response_agent/
│   │   ├── __init__.py
│   │   └── self_healing_agent.py   # 5-level autonomous defense
│   └── threat_explanation/
│       ├── __init__.py
│       └── threat_story_engine.py  # Narrative generation engine
├── .env                          # Environment variables
├── .env.example                  # Documented environment template
├── .gitignore
└── README.md
```

---

## Screenshots

The following screenshots can be captured from the running application. All images correspond to `assets/*.png` in the repository and frontend views at `http://localhost:3000`.

### Frontend Views

| View | Description | Location |
|---|---|---|
| **Landing Page** | System stats (F1, latency, reduction, CAN rate), 5 attack selectors, 9-phase architecture grid, START button | `http://localhost:3000` |
| **Attack Selection** | Attack type picker (Normal/DoS/Fuzzy/Gear/RPM) on both Landing and Pipeline pages | Landing page hero area |
| **Live Pipeline Execution** | 9-stage sequential timeline with animated progress, stage content panel, and log console | Pipeline page during `pipelineStatus === "running"` |
| **Behavioral Feature Extraction** | Stage 3 — 13 extracted feature values with category groupings | Pipeline stage 3 content panel |
| **Threat Detection Stage** | Stage 4 — OC-SVM classification result, anomaly score, confidence, model info | Pipeline stage 4 content panel |
| **Cyber Health Gauge** | Stage 5 — SVG arc gauge (0–100) with Threat/Stability/Pressure breakdown bars | Pipeline stage 5 content panel |
| **Feature Attribution** | Stage 6 — Per-feature contribution bars with anomalous feature highlighting | Pipeline stage 6 content panel |
| **Threat Story Generation** | Stage 7 — Full narrative text with risk category and recommended actions | Pipeline stage 7 content panel |
| **Self-Healing Response** | Stage 8 — Response level badge, autonomous mode indicator, action list | Pipeline stage 8 content panel |
| **Vehicle Recovery** | Stage 9 — Health delta (Before→During→After), recovery time, ECUs restored | Pipeline stage 9 content panel |
| **Execution Summary** | Post-pipeline — Flow graph, attack details, anomaly score, confidence, top driver | Pipeline page after completion |
| **KPI Bar** | Top metrics bar: Cyber Health, ECU Status, Active Threats, Stage progress (with ~Xs remaining) | Pipeline page during execution |

### Generated Evaluation Charts (assets/)

| Image | Description | Source |
|---|---|---|
| `assets/model_comparison.png` | F1, Recall, Precision, AUC comparison across IF, LOF, OC-SVM | `scripts/generate_visualizations.py` |
| `assets/behavioral_confusion_matrix.png` | OC-SVM confusion matrix (351K windows) | `scripts/generate_visualizations.py` |
| `assets/per_attack_detection_rate.png` | Detection rate per attack type by model | `scripts/generate_visualizations.py` |
| `assets/feature_importance_proxy.png` | 13 features ranked by z-score deviation importance | `scripts/generate_visualizations.py` |
| `assets/phase_comparison.png` | Phase 3 → Phase 5 improvement (F1: 0.112 → 0.815) | `scripts/generate_visualizations.py` |
| `assets/anomaly_score_distribution.png` | Normal vs Attack OC-SVM decision score distributions | `scripts/generate_visualizations.py` |
| `assets/cyber_health_timeline.png` | 351K-window health score timeline by risk category | `src/cyber_health/cyber_health_engine.py` |
| `assets/cyber_health_distribution.png` | Health score histogram with category boundaries | `src/cyber_health/cyber_health_engine.py` |
| `assets/risk_category_distribution.png` | Bar chart: Secure / Stable / Warning / High Risk / Critical | `src/cyber_health/cyber_health_engine.py` |

---

## Setup Instructions

### Prerequisites

- **Python 3.11+** with `pip`
- **Node.js 20+** with `npm`
- **Data files**: Behavioral parquet files (`data/behavioral/*_w50.parquet`) and model files (`data/models/*.joblib`)

### Installation

```bash
# Clone the repository
git clone https://github.com/asc006-git/AutoShield-Edge.git
cd AutoShield-Edge

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

# Install backend dependencies
pip install -r src/api/requirements.txt

# Install frontend dependencies
cd dashboard
npm install
cd ..
```

### Backend Startup

```bash
# From the project root (with venv active):
python -m src.api.main
```

The API starts at `http://localhost:8000`. Health check: `http://localhost:8000/api/health`

### Frontend Startup

In a separate terminal:

```bash
cd dashboard
npm run dev
```

The dashboard loads at `http://localhost:3000`. The frontend connects to `http://localhost:8000` by default (configurable via `NEXT_PUBLIC_API_URL` environment variable).

---

## Usage Guide

### Demonstration Workflow

1. Open `http://localhost:3000` in a browser
2. View landing page stats (F1 score, edge latency, data reduction, CAN rate)
3. Select an attack type (DoS, Fuzzing, Gear Spoof, RPM Spoof, or Normal)
4. Click **START LIVE DEMONSTRATION**
5. Watch the 9-stage pipeline execute in real time:
   - **Timeline** (left): Animated progress through stages
   - **Stage Content** (center): Purpose, inputs, outputs, AI reasoning, decision, and stage-specific data
   - **Log Console** (right): Backend execution logs with timestamps
   - **KPI Bar** (top): Cyber health, ECU status, threat count, stage progress
6. After all 9 stages complete, review the **Execution Summary** with flow graph and health delta

---

## Datasets

The model was trained and evaluated on the **AutoShield Edge CAN Bus Attack Dataset**, which contains 17.5M CAN 2.0B messages across 5 scenarios:

| Dataset | Messages | Label |
|---|---|---|
| Normal Driving | 988,871 | Normal |
| DoS Attack | 3,665,771 | Attack |
| Fuzzy Attack | 3,838,860 | Attack |
| Gear Spoofing | 4,443,142 | Attack |
| RPM Spoofing | 4,621,702 | Attack |

**Preprocessing**: Raw CSV/TXT → 19 per-message features → behavioral windowing (W=50) → 13 window-level features → OC-SVM training/inference.

---

## Trained Model

| Property | Value |
|---|---|
| **Algorithm** | One-Class SVM |
| **Kernel** | RBF (gamma='scale') |
| **Nu** | 0.01 |
| **Training samples** | 19,777 normal windows |
| **Features** | 13 behavioral features |
| **Window size** | 50 CAN frames |
| **Threshold** | 5th percentile of training scores |
| **Serialization** | Joblib (`data/models/ocsvm_model.joblib`) |

---

## Evaluation Metrics

### Model Comparison (Behavioral Window Features, W=50)

| Model | Precision | Recall | F1 Score | AUC |
|---|---|---|---|---|
| Isolation Forest | 0.9936 | 0.4666 | 0.6350 | 0.8371 |
| Local Outlier Factor | 0.9956 | 0.6810 | 0.8088 | 0.9055 |
| **One-Class SVM** | **0.9957** | **0.6893** | **0.8146** | **0.8877** |

*Dynamic runtime metrics (sampled from loaded model at startup): F1=0.8125, Precision=0.9950, Recall=0.6866, AUC=0.8857*

### Improvement Over Baseline (Phase 3 → Phase 5)

| Metric | Phase 3 (per-message IF) | Phase 5 (behavioral OC-SVM) | Improvement |
|---|---|---|---|
| Precision | 0.4342 | 0.9957 | +129.3% |
| Recall | 0.0643 | 0.6893 | +972.0% |
| F1 | 0.1120 | 0.8146 | +627.3% |
| AUC | 0.5050 | 0.8877 | +75.8% |

*Note: The `/api/stats` endpoint dynamically samples 50,000 windows (random seed 42) to compute live metrics. The runtime F1 may vary slightly from the full-evaluation values above (observed: 0.8125 vs 0.8146).*

---

## Achievements

- **17.5M CAN messages** processed across 5 attack scenarios
- **350:1 data reduction** via behavioral windowing (W=50)
- **F1 = 0.815** with One-Class SVM on behavioral features
- **5 attack types** detected with zero-shot generalization
- **9-stage inference pipeline** with SSE streaming
- **5-level autonomous defense** agent with targeted playbooks
- **Explainable AI** with per-feature attribution per window
- **Inference-only backend** — no runtime training

---

## Limitations

- **Static model**: OC-SVM is trained offline and does not adapt to evolving vehicle behavior post-deployment
- **No real-time data capture**: Pipeline uses pre-recorded datasets; real OBD-II/CAN interface not integrated
- **Rule-based explanations**: Threat stories and feature attribution are computed via z-score heuristics, not SHAP values
- **No persistence**: Pipeline results are streamed but not stored; no audit trail across restarts
- **Single-vehicle focus**: Digital twin parameters are dataset-specific and not generalized across vehicle models
- **No authentication**: API endpoints are public; suitable only for demo/development environments

---

## Future Improvements

- **Online learning**: Incremental model updates as new normal data arrives
- **Real CAN interface**: Live OBD-II/CAN bus capture via python-can or SocketCAN
- **SHAP integration**: Compute real Shapley values for mathematically rigorous explanations
- **Database persistence**: Store pipeline results in SQLite/PostgreSQL for audit and analysis
- **Multi-vehicle support**: Fleet-level monitoring with vehicle-specific twin profiles
- **Authentication & rate limiting**: API security for production deployment
- **Mobile-responsive dashboard**: Enhanced mobile layout for the CyberHealthGauge
- **SSE reconnection**: Graceful recovery from dropped streaming connections

---

## Contributing

This project is developed and maintained internally. For questions, suggestions, or security disclosures, please open an issue on the repository or contact the maintainers directly.

---

## License

Proprietary. All rights reserved.

---

## Acknowledgements

- **CAN bus intrusion datasets** from the automotive security research community
- **scikit-learn** for One-Class SVM and evaluation metrics
- **FastAPI** for the asynchronous API framework
- **Next.js** and **Vercel** for the React-based frontend framework
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for declarative animations

---

## Contact

**Project**: AutoShield Edge  
**Organization**: DeepMind Advanced Agentic Development  
**Repository**: [github.com/asc006-git/AutoShield-Edge](https://github.com/asc006-git/AutoShield-Edge)
