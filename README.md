<div align="center">

# AutoShield Edge

### Behavioral Cyber Twin for Connected Vehicle Cybersecurity
AI at the Edge Solution for Automotive Cybersecurity

</div>

---

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)

</div>

---

# Overview

AutoShield Edge is an Edge AI powered automotive cybersecurity platform designed to detect, explain, and autonomously respond to cyber attacks targeting connected vehicles.

Unlike traditional signature-based Intrusion Detection Systems (IDS), AutoShield Edge learns the normal behavioural characteristics of vehicle communication over the Controller Area Network (CAN Bus). Any deviation from this learned behavioural profile is treated as a potential cyber attack, enabling the system to identify both known and previously unseen threats.

The project introduces the concept of a **Behavioral Cyber Twin**, a virtual behavioural representation of the vehicle that continuously monitors communication patterns, evaluates cybersecurity health, explains attack causes, and recommends or executes appropriate defensive actions.

The complete solution consists of a FastAPI backend implementing the behavioural AI pipeline and a Next.js frontend that demonstrates the entire detection and response workflow in an interactive manner.

---

# Problem Statement

Modern vehicles have evolved into highly connected cyber-physical systems.

A typical vehicle contains between **50 and 100 Electronic Control Units (ECUs)** responsible for steering, braking, engine control, transmission, infotainment, Advanced Driver Assistance Systems (ADAS), and numerous safety-critical functions.

These ECUs communicate through the **Controller Area Network (CAN Bus)**.

Although CAN Bus is lightweight and efficient, it was originally designed without cybersecurity mechanisms such as:

- Message authentication
- Encryption
- Device identity verification
- Access control
- Confidential communication

As a result, if an attacker gains access to the vehicle network through compromised ECUs, diagnostic ports, infotainment systems, wireless interfaces, or aftermarket devices, malicious CAN frames can be injected into the network without being rejected.

Successful attacks can manipulate vehicle behaviour by transmitting forged messages that appear legitimate to other ECUs.

Examples include:

- Denial of Service attacks that flood the CAN Bus
- Fuzzy attacks that inject random CAN identifiers
- Gear spoofing attacks
- RPM spoofing attacks
- Sensor manipulation attacks
- Replay attacks
- ECU impersonation attacks

Because these messages often follow valid CAN formats, conventional security solutions struggle to distinguish malicious communication from legitimate traffic.

---

# Existing Challenges

Current automotive Intrusion Detection Systems primarily rely on one or more of the following approaches:

- Signature-based detection
- Rule-based detection
- Static threshold monitoring
- Message frequency analysis
- Blacklisted CAN identifiers

Although effective against previously known attacks, these approaches have significant limitations.

<div align="center">

| Existing Approach | Limitation |
|:-----------------:|:----------:|
| Signature-based IDS | Cannot detect zero-day attacks |
| Rule-based systems | Require continuous manual updates |
| Threshold monitoring | Produces high false positives |
| CAN ID filtering | Fails against spoofed legitimate identifiers |
| Payload inspection | Cannot understand behavioural context |

</div>

The most significant limitation is that existing systems analyse CAN messages independently.

However, cyber attacks often emerge as **behavioural changes across sequences of messages** rather than abnormalities within a single CAN frame.

This creates a need for behavioural intelligence instead of message-level inspection.

---

# Proposed Solution

AutoShield Edge addresses these limitations through a Behavioural Cyber Twin architecture.

Instead of analysing every CAN frame independently, the system observes communication over behavioural windows and learns how a healthy vehicle normally behaves.

The proposed workflow consists of:

1. Capturing CAN Bus traffic.
2. Creating behavioural windows from consecutive CAN messages.
3. Extracting behavioural features describing communication patterns.
4. Detecting anomalies using One-Class Machine Learning.
5. Computing a Vehicle Cyber Health Score.
6. Explaining the reason behind every detected anomaly.
7. Generating an understandable Threat Story.
8. Executing an appropriate self-healing response.
9. Monitoring recovery and restoring secure operation.

This architecture enables the system to detect behavioural deviations rather than relying solely on predefined attack signatures, allowing the identification of previously unseen attack patterns while maintaining explainability throughout the detection pipeline.

---

# Key Features

- Behavioral Cyber Twin Architecture
- Behavioural Window-Based Analysis
- One-Class Machine Learning for Zero-Day Detection
- Multi-Model Behavioural Threat Detection
- Vehicle Cyber Health Score (0–100)
- Explainable Threat Story Engine
- Self-Healing Response Agent
- Interactive End-to-End Demonstration
- FastAPI Inference Backend
- Next.js Visualization Dashboard
- Real-Time Pipeline Execution
- Explainable AI Driven Decision Making

---

# System Architecture

AutoShield Edge follows a layered Edge AI architecture where every layer has a specific responsibility in the cybersecurity pipeline. Instead of treating intrusion detection as a single classification task, the system decomposes the complete problem into multiple explainable stages that progressively transform raw CAN messages into cybersecurity decisions.

The architecture is divided into five major layers:

1. Data Acquisition Layer
2. Behavioral Intelligence Layer
3. AI Detection Layer
4. Explainability Layer
5. Autonomous Defense Layer

Each layer contributes information to the next while maintaining complete traceability of every decision generated by the system.

---

# High-Level Architecture

## High-Level System Architecture

```text
+--------------------+     +-------------------------+     +----------------------------+
| Connected Vehicle  | --> | CAN Bus Communication   | --> | Data Acquisition &         |
| (ECUs & Sensors)   |     | (Real-Time CAN Frames)  |     | Preprocessing              |
+--------------------+     +-------------------------+     +----------------------------+
                                                              |
                                                              v
+----------------------+     +---------------------------+     +--------------------------+
| Behavioral           | --> | Behavioral Feature        | --> | One-Class Behavioral AI  |
| Cyber Twin           |     | Extraction Engine         |     | Threat Detector          |
+----------------------+     +---------------------------+     +--------------------------+
                                                              |
                                                              v
+----------------------+     +---------------------------+     +--------------------------+
| Vehicle Cyber        | --> | Explainable Threat Story  | --> | Self-Healing Response    |
| Health Engine        |     | Engine                    |     | Agent                    |
+----------------------+     +---------------------------+     +--------------------------+
                                                              |
                                                              v
                                                +--------------------------------------+
                                                | Continuous Monitoring & Recovery     |
                                                +--------------------------------------+
```

---

# Behavioral Cyber Twin

The core innovation of AutoShield Edge is the **Behavioral Cyber Twin**.

Unlike a conventional Digital Twin that attempts to replicate the physical state of a vehicle, a Behavioral Cyber Twin models how the vehicle communicates over time.

Instead of learning the physical properties of components, it learns behavioural characteristics such as:

- Communication frequency
- CAN ID diversity
- Payload behaviour
- Timing characteristics
- ECU interaction patterns
- Network stability
- Attack pressure indicators

The Cyber Twin continuously compares current vehicle behaviour with the learned baseline of healthy communication.

Whenever behavioural deviations exceed acceptable limits, the Cyber Twin generates evidence for downstream AI modules.

The Cyber Twin therefore acts as the behavioural brain of the cybersecurity system rather than merely collecting telemetry.

---

# Why Behavioral Intelligence?

Traditional Intrusion Detection Systems analyse individual CAN frames independently.

However, many automotive cyber attacks are not distinguishable at the message level.

For example:

- A Gear Spoofing attack may transmit perfectly valid CAN frames.
- An RPM Spoofing attack often produces payloads that appear statistically normal.
- Replay attacks simply repeat legitimate messages.
- ECU impersonation uses existing CAN identifiers.

Although individual messages appear normal, their collective behaviour over time changes significantly.

AutoShield Edge therefore analyses **behavioural windows** rather than isolated CAN messages.

Instead of asking:

> "Is this CAN frame malicious?"

the system asks:

> "Is the overall behaviour of the vehicle still consistent with normal operation?"

This behavioural perspective enables detection of attacks that traditional message-level inspection cannot identify.

---

# Layer 1 — Data Acquisition Layer

The first layer receives raw CAN Bus communication from the connected vehicle.

Each CAN frame contains:

- Timestamp
- CAN Identifier
- Data Length Code (DLC)
- Payload Bytes (D0–D7)

Raw communication is collected without modifying the original packet sequence.

The preprocessing engine then performs:

- Dataset normalization
- Hexadecimal to integer conversion
- Missing payload handling
- Label generation
- Temporal ordering
- Feature preparation

The resulting data becomes suitable for behavioural analysis.

---

# Layer 2 — Behavioral Intelligence Layer

The Behavioral Intelligence Layer transforms millions of individual CAN messages into behavioural windows.

Instead of analysing every frame independently, consecutive messages are grouped together.

For the final implementation, a window size of **50 CAN messages** is used because it provides the best balance between:

- Detection accuracy
- Noise reduction
- Computational efficiency
- Edge deployment latency

For every behavioural window, the system extracts behavioural descriptors representing the communication characteristics of the vehicle.

This significantly reduces data dimensionality while preserving behavioural information necessary for anomaly detection.

---

# Layer 3 — AI Threat Detection Layer

The extracted behavioural features are forwarded to the Behavioural Threat Detection Engine.

The engine follows a one-class anomaly detection paradigm.

Instead of learning attacks, the model learns only healthy vehicle behaviour.

During inference, every behavioural window receives:

- An anomaly score
- Confidence score
- Threat classification

Multiple behavioural models were evaluated during experimentation:

<div align="center">

| Model | Purpose |
|:------:|:-------:|
| Isolation Forest | Baseline behavioural detector |
| Local Outlier Factor | Local density anomaly detection |
| One-Class SVM | Final production model |

</div>

Experimental evaluation demonstrated that One-Class SVM achieved the best overall balance between precision and recall, making it the selected inference engine.

---

# Layer 4 — Explainability Layer

Detection alone is insufficient in safety-critical automotive systems.

Engineers and drivers must understand **why** a decision was made.

The Explainability Layer transforms raw model outputs into human-understandable reasoning.

This layer consists of three major components.

### Vehicle Cyber Health Engine

Converts anomaly measurements into a normalized cybersecurity health score ranging from 0 to 100.

The score combines:

- Threat Component
- Behavioural Stability Component
- Attack Pressure Component

This enables cybersecurity status to be interpreted similarly to battery health or engine health.

---

### Threat Story Engine

The Threat Story Engine converts numerical AI outputs into structured explanations.

Instead of displaying probabilities alone, it produces narratives describing:

- What happened
- Why it happened
- Which features contributed
- Expected consequences
- Recommended actions

This allows engineers to interpret model decisions without analysing raw machine learning outputs.

---

### Root Cause Attribution

For every detected anomaly, the explainability engine identifies the behavioural features that contributed most strongly to the final prediction.

Examples include:

- Excessive CAN ID diversity
- Increased communication burst rate
- Payload instability
- Timing irregularities
- Network entropy changes

This attribution improves transparency and simplifies incident investigation.

---

# Layer 5 — Autonomous Defense Layer

After an attack has been detected and explained, the Self-Healing Response Agent determines the appropriate mitigation strategy.

The response engine considers:

- Threat severity
- Cyber Health Score
- Behavioural trend
- Forecasted degradation
- Detected attack type

Based on these factors, it selects one of five response levels.

<div align="center">

| Response Level | Action |
|:--------------:|:------:|
| Level 0 | Passive Monitoring |
| Level 1 | Warning |
| Level 2 | Containment |
| Level 3 | Critical Protection |
| Level 4 | Emergency Response |

</div>

Each response level activates predefined defensive playbooks designed specifically for different automotive cyber attacks.

The objective is not only to detect attacks but also to reduce their operational impact while maintaining vehicle safety.

---

# End-to-End Processing Pipeline

The complete AutoShield Edge workflow consists of nine sequential stages.

## Nine-Stage AI Pipeline

```text
+------------------+    +-------------------+    +----------------------+    +---------------------+    +----------------------+
| Stage 1          | -> | Stage 2           | -> | Stage 3             | -> | Stage 4            | -> | Stage 5             |
| Vehicle CAN Bus  |    | Behavioral Window |    | Behavioral Feature  |    | Behavioral Threat  |    | Cyber Health Score |
| Communication    |    | Generation        |    | Extraction          |    | Detection          |    | Calculation        |
+------------------+    +-------------------+    +----------------------+    +---------------------+    +----------------------+
                                                                                                                                  |
                                                                                                                                  v
+------------------+ <- +-------------------+ <- +----------------------+ <- +---------------------+
| Stage 9          |    | Stage 8           |    | Stage 7             |    | Stage 6            |
| Recovery &       |    | Self-Healing      |    | Threat Story        |    | Explainable AI     |
| Monitoring       |    | Response Agent    |    | Generation          |    | Analysis           |
+------------------+    +-------------------+    +----------------------+    +---------------------+
```

Each stage receives the outputs of the previous stage, ensuring complete traceability from raw CAN communication to the final cybersecurity decision.

The modular design allows future integration of additional detection models, response strategies, or hardware interfaces without modifying the remaining pipeline.

---

# Technology Stack

AutoShield Edge combines modern Edge AI, Machine Learning, Backend Engineering, and Interactive Visualization technologies to build an end-to-end automotive cybersecurity platform.

<div align="center">

| Layer | Technologies |
|:------:|:------------|
| Programming Language | Python 3.11, TypeScript |
| Frontend | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Uvicorn |
| Machine Learning | Scikit-learn |
| Data Processing | Pandas, NumPy, PyArrow |
| Visualization | Matplotlib |
| API Communication | REST API, JSON |
| Model | One-Class SVM, Isolation Forest, Local Outlier Factor |
| Storage | Parquet Dataset Format |
| Version Control | Git, GitHub |

</div>

---

# Repository Structure

The repository is organized into independent modules so that each component of the cybersecurity pipeline can evolve without affecting the remaining system.

```text
AutoShield-Edge
│
├── assets/
│   ├── Generated graphs
│   ├── Performance plots
│   └── Evaluation figures
│
├── dashboard/
│   ├── Next.js frontend
│   ├── React components
│   ├── API integration
│   └── Interactive demonstration
│
├── data/
│   ├── Behavioral windows
│   └── Processed datasets
│
├── dataset/
│   ├── Normal CAN traffic
│   ├── DoS attack
│   ├── Fuzzy attack
│   ├── Gear attack
│   └── RPM attack
│
├── reports/
│   ├── Experimental reports
│   ├── Performance summaries
│   └── Evaluation results
│
├── scripts/
│   ├── Dataset utilities
│   └── Analysis scripts
│
├── src/
│   ├── api/
│   ├── preprocessing/
│   ├── anomaly_detection/
│   ├── cyber_health/
│   ├── threat_explanation/
│   └── response_agent/
│
├── requirements.txt
└── README.md
```

---

# Dataset

AutoShield Edge is evaluated using publicly available automotive CAN Bus intrusion datasets containing both normal driving behaviour and multiple cyber attack scenarios.

The dataset represents communication between Electronic Control Units (ECUs) over the Controller Area Network (CAN Bus).

The project processes more than **17.5 million CAN messages**, making it suitable for behavioural learning rather than simple message classification.

---

## Dataset Summary

<div align="center">

| Dataset | Messages | Description |
|:--------:|:--------:|:-----------|
| Normal | 988,871 | Legitimate vehicle communication |
| DoS | 3,665,771 | CAN Bus flooding attack |
| Fuzzy | 3,838,860 | Random CAN identifier injection |
| Gear | 4,443,142 | Gear spoofing attack |
| RPM | 4,621,702 | RPM spoofing attack |

</div>

---

## Overall Dataset Statistics

<div align="center">

| Property | Value |
|:---------:|:-----:|
| Total CAN Messages | 17,558,346 |
| Number of Attack Types | 4 |
| Normal Messages | 988,871 |
| Attack Messages | 16,569,475 |
| Total Features After Preprocessing | 19 |
| Behavioral Window Size | 50 Messages |

</div>

---

# Data Preprocessing

Before behavioural analysis, every dataset undergoes a standardized preprocessing pipeline.

The preprocessing module performs the following operations:

- Schema normalization
- Hexadecimal to integer conversion
- Missing byte handling
- DLC-based payload correction
- Timestamp ordering
- Label generation
- Feature engineering
- Parquet conversion

The final processed dataset contains both original CAN information and engineered behavioural descriptors suitable for machine learning.

---

# Feature Engineering

Instead of relying only on raw CAN payloads, AutoShield Edge generates additional behavioural descriptors that capture communication dynamics.

The engineered features are divided into multiple categories.

---

## Raw CAN Features

<div align="center">

| Feature |
|:--------|
| Timestamp |
| CAN ID |
| DLC |
| D0 – D7 Payload Bytes |

</div>

---

## Statistical Features

<div align="center">

| Feature | Purpose |
|:--------:|:-------|
| Payload Mean | Average payload behaviour |
| Payload Standard Deviation | Payload variation |
| Payload Minimum | Minimum byte value |
| Payload Maximum | Maximum byte value |
| Payload Entropy | Information randomness |

</div>

---

## Temporal Features

<div align="center">

| Feature | Description |
|:--------:|:-----------|
| Delta Time | Time between consecutive CAN messages |

</div>

---

# Behavioral Feature Engineering

The Behavioral Cyber Twin transforms individual CAN frames into behavioural windows.

For each window, thirteen behavioural descriptors are extracted.

These descriptors describe **how the vehicle behaves** instead of **what a single CAN message contains**.

---

## Behavioral Features

<div align="center">

| Category | Features |
|:---------:|:--------|
| Communication Rate | Messages per Second |
| CAN Diversity | Unique CAN IDs |
| Network Entropy | CAN ID Entropy |
| Timing Behaviour | Mean Delta Time |
| Timing Behaviour | Standard Deviation of Delta Time |
| Timing Behaviour | Minimum Delta Time |
| Timing Behaviour | Maximum Delta Time |
| Payload Behaviour | Mean Payload |
| Payload Behaviour | Payload Standard Deviation |
| Payload Behaviour | Mean Payload Entropy |
| Attack Pressure | Message Burst Score |
| Attack Pressure | Frequency Spike Score |
| Attack Pressure | Payload Instability Score |

</div>

---

# Why Behavioral Features?

Traditional automotive intrusion detection evaluates one CAN message at a time.

However, many cyber attacks preserve valid message formats while altering communication behaviour.

Behavioural windows reveal information that individual messages cannot provide, including:

- Network congestion
- Timing anomalies
- Communication bursts
- CAN identifier diversity
- Payload instability
- Behavioural drift

These characteristics enable the detection of sophisticated attacks that evade message-level inspection.

---

# Machine Learning Pipeline

AutoShield Edge follows a one-class anomaly detection strategy.

Rather than learning examples of attacks, the model learns **normal vehicle behaviour**.

During deployment, any behavioural deviation from this learned baseline is considered suspicious.

The workflow consists of:

## Machine Learning Pipeline

```text
+-------------------+ --> +-------------------+ --> +-----------------------+ --> +---------------------+ --> +------------------+ --> +-----------------------+
| Raw CAN Messages  |     | Data              |     | Behavioral Windows    |     | Feature             |     | Feature Scaling  |     | One-Class SVM         |
|                   |     | Preprocessing     |     | (50 Messages)         |     | Engineering         |     |                  |     | Behavioral Learning   |
+-------------------+     +-------------------+     +-----------------------+     +---------------------+     +------------------+     +-----------------------+
                                                                                                                                                                 |
                                                                                                                                                                 v
                                                                                                                                            +-------------------------------+
                                                                                                                                            | Behavioral Threat Detection   |
                                                                                                                                            +-------------------------------+
```

---

# Model Evaluation

Three anomaly detection algorithms were evaluated during experimentation.

<div align="center">

| Model | Objective |
|:------:|:---------|
| Isolation Forest | Baseline anomaly detector |
| Local Outlier Factor | Local density anomaly detection |
| One-Class SVM | Final production model |

</div>

---

# Performance Comparison

<div align="center">

| Model | Precision | Recall | F1 Score | AUC |
|:------:|:---------:|:------:|:--------:|:---:|
| Isolation Forest | 0.9936 | 0.4666 | 0.6350 | 0.8371 |
| Local Outlier Factor | 0.9956 | 0.6810 | 0.8088 | 0.9055 |
| **One-Class SVM** | **0.9957** | **0.6893** | **0.8146** | **0.8877** |

</div>

The One-Class SVM achieved the highest F1 Score while maintaining an exceptionally low false positive rate, making it the selected inference model for AutoShield Edge.

---

# Why One-Class Learning?

Collecting labelled automotive attack datasets covering every possible cyber threat is impractical.

Instead of relying on attack examples, AutoShield Edge learns only healthy vehicle behaviour.

This enables:

- Zero-day attack detection
- Detection of previously unseen attacks
- Better adaptability
- Behaviour-based security
- Lower dependency on continuously updated signatures

This learning paradigm is particularly suitable for connected vehicles where new attack vectors emerge frequently.

---

# Backend Architecture

The backend of AutoShield Edge is implemented using **FastAPI** and serves as the intelligence layer of the entire system.

Unlike a traditional REST backend that only stores or retrieves data, the FastAPI backend performs the complete cybersecurity inference pipeline. It accepts vehicle behavioral data, processes it through the Behavioral Cyber Twin, executes anomaly detection, computes the Cyber Health Score, generates explainable threat narratives, determines defensive actions, and returns structured responses to the frontend.

Every stage of the pipeline is modular, allowing each component to operate independently while contributing to the complete cybersecurity workflow.

---

# Backend Modules

<div align="center">

| Module | Responsibility |
|:------:|:--------------|
| API Layer | REST endpoints and request handling |
| Preprocessing | Data normalization and behavioral window preparation |
| Behavioral Detection Engine | One-Class anomaly detection |
| Cyber Health Engine | Vehicle cybersecurity scoring |
| Threat Story Engine | Explainable AI reasoning |
| Self-Healing Response Agent | Automated defense decisions |
| Dashboard API | Frontend communication |

</div>

---

# Backend Processing Flow

## Backend Inference Pipeline

```text
+------------------+ --> +----------------------+ --> +----------------------+ --> +-----------------------+ --> +----------------------+
| Frontend Request |     | FastAPI API Layer    |     | Behavioral Cyber Twin|     | Feature Extraction    |     | One-Class SVM        |
+------------------+     +----------------------+     +----------------------+     +-----------------------+     +----------------------+
                                                                                                                                             |
                                                                                                                                             v
+----------------------+ --> +-------------------------+ --> +---------------------------+ --> +----------------------+
| Cyber Health Engine  |     | Threat Story Engine     |     | Self-Healing Response     |     | JSON API Response    |
+----------------------+     +-------------------------+     +---------------------------+     +----------------------+
```

---

# API Overview

The backend exposes REST APIs that allow the frontend to visualize every stage of the cybersecurity pipeline.

<div align="center">

| Endpoint | Description |
|:---------:|:-----------|
| `/api/pipeline/run` | Executes the complete behavioral cybersecurity pipeline |
| `/api/health` | Backend health status |
| `/api/stats` | System performance statistics |
| `/api/demo/attack-data` | Demonstration attack scenarios |
| `/api/cyber-health` | Cyber Health Score |
| `/api/threat-story` | Explainable threat narrative |
| `/api/defense` | Self-healing response |
| `/api/telemetry` | Vehicle telemetry |

</div>

---

# Behavioral Threat Detection Engine

The Behavioral Threat Detection Engine is the primary AI component responsible for detecting cyber attacks.

Instead of evaluating individual CAN messages, it analyses behavioral windows containing multiple consecutive CAN frames.

Each behavioral window is represented by thirteen engineered behavioral features.

The trained One-Class Support Vector Machine learns only healthy vehicle behavior during training.

During inference, every behavioral window receives:

- Anomaly Score
- Threat Confidence
- Behavioral Classification

Any significant deviation from the learned behavioral baseline is treated as a potential cyber attack.

---

# Threat Detection Workflow

## Behavioral Threat Detection Engine

```text
+----------------------+ --> +--------------------+ --> +---------------------+ --> +----------------------+ --> +-------------------------+
| Behavioral Window    |     | Feature Scaling    |     | One-Class SVM Model |     | Decision Function    |     | Anomaly Score           |
+----------------------+     +--------------------+     +---------------------+     +----------------------+     +-------------------------+
                                                                                                                                                  |
                                                                                                                                                  v
                                                                                                                               +------------------------------+
                                                                                                                               | Threat Classification       |
                                                                                                                               +------------------------------+
```

---

# Vehicle Cyber Health Engine

Raw anomaly scores are difficult for drivers and engineers to interpret.

AutoShield Edge therefore converts behavioral anomalies into an intuitive cybersecurity health metric ranging from **0 to 100**.

Higher scores represent healthier cybersecurity conditions.

Lower scores indicate increasing behavioral deviation and cyber risk.

The Cyber Health Score combines three independent behavioral dimensions.

---

## Cyber Health Components

<div align="center">

| Component | Weight | Purpose |
|:---------:|:------:|:-------|
| Threat Component | 40% | Severity of detected anomaly |
| Behavioral Stability | 30% | Consistency of vehicle behavior |
| Attack Pressure | 30% | Communication stress indicators |

</div>

---

## Risk Categories

<div align="center">

| Score | Category |
|:------:|:--------|
| 80 – 100 | Secure |
| 60 – 79 | Stable |
| 40 – 59 | Warning |
| 20 – 39 | High Risk |
| 0 – 19 | Critical |

</div>

---

## Cyber Health Formula

```text
Cyber Health Score

= Threat Component
+ Stability Component
+ Attack Pressure Component

Total Score = 100
```

Each component is derived from behavioral statistics and normalized using deviations from healthy vehicle behavior.

This allows cybersecurity status to be monitored similarly to battery health or engine diagnostics.

---

# Explainable Threat Story Engine

Detection alone is insufficient in automotive cybersecurity.

Security engineers must understand why the AI model reached its conclusion.

The Explainable Threat Story Engine transforms machine learning outputs into structured, human-readable explanations.

Instead of displaying only anomaly scores, the engine generates explanations describing:

- Current cybersecurity condition
- Detected attack type
- Root cause
- Behavioral abnormalities
- Primary contributing features
- Expected consequences
- Recommended actions

This significantly improves trust and interpretability.

---

## Example Threat Story

```text
Cyber Health: 24

Risk Level:
High Risk

Detected Threat:
Denial of Service Attack

Primary Cause:
Abnormally high message transmission rate.

Behavioral Changes:

• Increased communication frequency
• Reduced CAN diversity
• Elevated attack pressure

Recommended Action:

Isolate affected ECU.
Enable rate limiting.
Continue monitoring.
```

---

# Root Cause Attribution

Every detected anomaly includes an explanation identifying the behavioral features that contributed most strongly to the AI decision.

Typical explanations include:

- High CAN ID entropy
- Elevated message burst score
- Payload instability
- Communication frequency spikes
- Timing irregularities

These explanations allow cybersecurity engineers to investigate incidents more efficiently.

---

# Self-Healing Response Agent

After identifying a cyber attack, AutoShield Edge automatically determines an appropriate defensive strategy.

Instead of issuing generic alerts, the Response Agent selects actions according to:

- Attack severity
- Threat confidence
- Cyber Health Score
- Behavioral trend
- Attack type

This transforms intrusion detection into an active cyber defense mechanism.

---

# Response Levels

<div align="center">

| Level | Description |
|:------:|:-----------|
| 0 | Passive Monitoring |
| 1 | Warning |
| 2 | Containment |
| 3 | Critical Protection |
| 4 | Emergency Response |

</div>

---

# Response Workflow

## Autonomous Defense Workflow

```text
+---------------------+ --> +----------------------+ --> +-----------------------+ --> +------------------------+ --> +----------------------+
| Threat Detection    |     | Cyber Health Engine  |     | Threat Story Engine   |     | Response Decision      |     | Recommended Mitigation|
+---------------------+     +----------------------+     +-----------------------+     +------------------------+     +----------------------+
                                                                                                                                                 |
                                                                                                                                                 v
                                                                                                                               +------------------------------+
                                                                                                                               | Recovery Monitoring         |
                                                                                                                               +------------------------------+
```

---

# Frontend Demonstration

The frontend is implemented using **Next.js**, **React**, and **Tailwind CSS**.

Rather than acting as a conventional dashboard, it serves as an interactive demonstration platform that visualizes every stage of the Behavioral Cyber Twin.

The interface communicates with the FastAPI backend and displays the progress of the complete cybersecurity pipeline.

The demonstration is designed to help judges understand how behavioral information flows through the AI system.

---

# Demonstration Workflow

## Frontend Demonstration Workflow

```text
+-----------------+ --> +------------------+ --> +-------------------------+ --> +----------------------+ --> +----------------------+
| Landing Page    |     | Attack Selection |     | Run Live Demonstration  |     | Pipeline Execution   |     | Threat Detection     |
+-----------------+     +------------------+     +-------------------------+     +----------------------+     +----------------------+
                                                                                                                                             |
                                                                                                                                             v
+----------------------+ --> +-----------------------+ --> +--------------------------+
| Cyber Health Engine  |     | Threat Story Engine   |     | Self-Healing Response    |
+----------------------+     +-----------------------+     +--------------------------+
                                                                                               |
                                                                                               v
                                                                                 +--------------------------+
                                                                                 | Recovery Summary         |
                                                                                 +--------------------------+
```

---

# Frontend Features

- Interactive landing page
- Attack scenario selection
- Live pipeline execution
- Stage-by-stage visualization
- Cyber Health gauge
- Behavioral metrics
- Threat explanation
- Self-healing response visualization
- Recovery summary
- Performance dashboard

---

# End-to-End AI Workflow

The complete AutoShield Edge platform transforms raw CAN Bus communication into autonomous cybersecurity decisions.

## End-to-End AutoShield Edge Workflow

```text
+--------------------+ --> +---------------------+ --> +------------------------+ --> +-----------------------+
| Connected Vehicle  |     | CAN Bus Messages    |     | Behavioral Windows     |     | Feature Engineering   |
+--------------------+     +---------------------+     +------------------------+     +-----------------------+
                                                                                                                 |
                                                                                                                 v
+----------------------+ --> +----------------------+ --> +-------------------------+ --> +--------------------------+
| One-Class SVM AI     |     | Cyber Health Engine  |     | Threat Story Engine     |     | Self-Healing Response    |
+----------------------+     +----------------------+     +-------------------------+     +--------------------------+
                                                                                                                  |
                                                                                                                  v
                                                                                               +--------------------------------+
                                                                                               | Continuous Recovery &         |
                                                                                               | Security Monitoring           |
                                                                                               +--------------------------------+
```

This modular architecture enables AutoShield Edge to detect, explain, and respond to cyber threats while maintaining transparency throughout the entire decision-making process.

---

# Experimental Results

AutoShield Edge was evaluated using behavioral representations of CAN Bus communication generated from more than **17.5 million CAN messages**.

The evaluation focuses on the ability of the Behavioral Cyber Twin to detect malicious behavioral deviations instead of classifying individual CAN messages.

All experiments were performed using behavioral windows consisting of **50 consecutive CAN messages**, which provided the best balance between detection accuracy and computational efficiency.

---

# Model Evaluation

Three anomaly detection algorithms were evaluated.

<div align="center">

| Model | Precision | Recall | F1 Score | AUC |
|:------:|:---------:|:------:|:--------:|:---:|
| Isolation Forest | 0.9936 | 0.4666 | 0.6350 | 0.8371 |
| Local Outlier Factor | 0.9956 | 0.6810 | 0.8088 | 0.9055 |
| **One-Class SVM** | **0.9957** | **0.6893** | **0.8146** | **0.8877** |

</div>

The One-Class Support Vector Machine achieved the highest overall F1 Score while maintaining an exceptionally low False Positive Rate, making it the selected inference model for AutoShield Edge.

---

# Performance Improvement

The project originally used single-message anomaly detection.

After introducing the Behavioral Cyber Twin architecture, performance improved significantly.

<div align="center">

| Metric | Phase 3 | Final System | Improvement |
|:------:|:-------:|:------------:|:-----------:|
| Precision | 0.4342 | 0.9957 | +129.3% |
| Recall | 0.0643 | 0.6893 | +972.0% |
| F1 Score | 0.1120 | 0.8146 | +627.3% |
| AUC | 0.5050 | 0.8877 | +75.8% |

</div>

The transition from message-level analysis to behavioral intelligence forms the primary innovation of the proposed system.

---

# Attack-wise Detection Performance

<div align="center">

| Attack Type | Detection Rate |
|:-----------:|:--------------:|
| DoS | 64.00% |
| Fuzzy | 59.63% |
| Gear Spoofing | 74.96% |
| RPM Spoofing | 74.75% |

</div>

The Behavioral Cyber Twin successfully identifies behavioral deviations even when individual CAN messages appear legitimate.

---

# Vehicle Cyber Health Results

The Cyber Health Engine converts anomaly detection outputs into an interpretable cybersecurity score.

<div align="center">

| Attack | Average Cyber Health |
|:------:|:--------------------:|
| Normal | 80.5 |
| DoS | 49.9 |
| Fuzzy | 48.8 |
| Gear | 48.0 |
| RPM | 47.2 |

</div>

Cyber Health allows security engineers to monitor the cybersecurity condition of the vehicle in real time without analysing raw anomaly scores.

---

# Risk Distribution

<div align="center">

| Category | Percentage |
|:---------:|:----------:|
| Secure | 17.6% |
| Stable | 16.1% |
| Warning | 24.3% |
| High Risk | 32.8% |
| Critical | 9.3% |

</div>

---

# Behavioral Intelligence Benefits

Compared to conventional automotive intrusion detection systems, AutoShield Edge provides several advantages.

<div align="center">

| Traditional IDS | AutoShield Edge |
|:---------------:|:---------------:|
| Signature Based | Behavioral Learning |
| Detects Known Attacks | Detects Known and Unknown Attacks |
| Message-Level Analysis | Behavioral Window Analysis |
| Limited Explainability | Explainable AI |
| Static Rules | Adaptive Behavioral Intelligence |
| Manual Investigation | Automated Threat Story |
| Alert Generation | Self-Healing Response |

</div>

---

# Generated Outputs

The platform automatically produces:

- Behavioral feature datasets
- Model evaluation reports
- ROC Curves
- Confusion Matrices
- Cyber Health Timeline
- Risk Distribution Charts
- Threat Stories
- Response Decisions
- Recovery Summaries
- Interactive Dashboard

---

# Installation

## Clone Repository

```bash
git clone https://github.com/asc006-git/AutoShield-Edge.git
cd AutoShield-Edge
```

---

## Backend Setup

Install the required Python packages.

```bash
pip install -r requirements.txt
```

Run the FastAPI server.

```bash
cd src/api
python main.py
```

The backend starts at

```
http://localhost:8000
```

---

## Frontend Setup

Navigate to the dashboard directory.

```bash
cd dashboard
```

Install dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

The frontend becomes available at

```
http://localhost:3000
```

---

# Running the Demonstration

Start the backend server.

Start the frontend application.

Open

```
http://localhost:3000
```

Select one of the available attack scenarios.

Click **Run Live Demonstration**.

Observe the following sequence:

1. Behavioral Window Generation
2. Feature Extraction
3. Behavioral Threat Detection
4. Cyber Health Calculation
5. Threat Story Generation
6. Self-Healing Response
7. Recovery Monitoring

The frontend visualizes each stage while displaying outputs received from the FastAPI backend.

---

# System Requirements

<div align="center">

| Component | Requirement |
|:---------:|:-----------:|
| Operating System | Windows / Linux / macOS |
| Python | 3.11 or later |
| Node.js | 20+ |
| RAM | Minimum 4 GB |
| Recommended RAM | 8 GB or more |
| Storage | Approximately 3 GB |

</div>

---

# Current Limitations

Although AutoShield Edge demonstrates strong behavioral threat detection capabilities, several enhancements remain possible.

- Evaluated using offline CAN datasets.
- Limited to four attack categories.
- Single-vehicle behavioral baseline.
- No direct integration with production vehicle ECUs.
- Real-time CAN hardware integration is outside the current scope.

These limitations provide opportunities for future research and deployment.

---
