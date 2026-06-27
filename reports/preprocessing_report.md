# AutoShield Edge — Preprocessing Report

**Phase 2: CAN Bus Data Preprocessing Pipeline**

## 1. Pipeline Stages

The preprocessing pipeline transforms raw CAN bus captures into structured behavioral feature windows ready for One-Class SVM training and inference.

### Stage 1: Raw Data Ingestion
- Parse CSV/TXT CAN message logs with schema normalization
- Handle missing timestamps, malformed payloads, and duplicate messages
- Standardize CAN ID formatting (decimal conversion from hex)

### Stage 2: Per-Message Feature Engineering
Compute 19 numerical features per CAN message:

| Feature | Description | Type |
|---|---|---|
| `delta_time` | Inter-message arrival time (seconds) | Continuous |
| `can_id_dec` | CAN identifier as decimal | Discrete |
| `can_id_priority` | Priority extracted from CAN ID (lower = higher) | Discrete |
| `is_extended_id` | Flag for 29-bit extended CAN ID | Binary |
| `dlc` | Data Length Code (0–8) | Discrete |
| `payload_mean` | Mean of payload bytes | Continuous |
| `payload_std` | Standard deviation of payload bytes | Continuous |
| `payload_entropy` | Shannon entropy of payload bytes | Continuous |
| `payload_sum` | Sum of payload byte values | Continuous |
| `payload_non_zero_count` | Count of non-zero payload bytes | Discrete |

### Stage 3: Behavioral Windowing
- Group consecutive messages into non-overlapping windows of W=50
- Each window produces exactly one 13-feature vector
- Attack labels are propagated per-window (window is "attack" if majority of its messages are attack-labeled)

### Stage 4: Feature Normalization
- Normal features are used to compute `StandardScaler` parameters
- All features are z-score normalized before OC-SVM training
- The scaler is serialized to `data/models/scaler.joblib` for inference-time use

## 2. Data Volume Reduction

| Stage | Volume | Reduction |
|---|---|---|
| Raw CAN messages | 17,558,346 | — |
| Per-message features | 17,558,346 × 19 | 1:1 |
| Behavioral windows (W=50) | 351,166 × 13 | **50:1** |
| Normalized features | 351,166 × 13 | 1:1 |

Total reduction: **50:1** from raw messages to behavioral window features.

## 3. Output Files

| File | Description |
|---|---|
| `data/behavioral/*_w50.parquet` | 5 behavioral window files (one per attack type) |
| `data/models/scaler.joblib` | Fitted StandardScaler for inference |
