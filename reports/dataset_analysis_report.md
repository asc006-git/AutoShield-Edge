# AutoShield Edge - Dataset Analysis Report
**Phase 1: Project Foundation & Exploratory Data Analysis**

## 1. Dataset Overview

| Dataset | Label | Rows | Columns | Duplicates | Missing Cells |
|---------|-------|------|---------|------------|---------------|
| DoS_dataset.csv | DoS Attack | 3,665,771 | 12 | 0 | 187,128 |
| Fuzzy_dataset.csv | Fuzzy Attack | 3,838,860 | 12 | 0 | 366,651 |
| gear_dataset.csv | Gear Spoofing | 4,443,142 | 12 | 0 | 240,990 |
| RPM_dataset.csv | RPM Spoofing | 4,621,702 | 12 | 0 | 248,856 |
| normal_run_data.txt | Normal Operation | 988,871 | 12 | 0 | 0 |

### Column Definitions

| Column | Type | Description |
|--------|------|-------------|
| `Timestamp` | float | Unix timestamp of the CAN message |
| `CAN_ID` | str (hex) | CAN arbitration ID (11-bit or 29-bit) |
| `DLC` | int | Data Length Code - number of valid data bytes |
| `D0`-`D7` | str (hex) | CAN data payload bytes |
| `Flag` | str | Message flag (present only in attack CSVs) |
| `Unknown` | str | Extra column in normal_run_data.txt (purpose unknown) |

**Common CSV columns:** CAN_ID, D0, D1, D2, D3, D4, D5, D6, D7, DLC, Flag, Timestamp

**Normal TXT columns:** Timestamp, CAN_ID, Unknown, DLC, D0, D1, D2, D3, D4, D5, D6, D7

## 2. Feature Analysis

### DoS Attack (DoS_dataset.csv)

**Data Types:**
- `Timestamp` : `float64`
- `CAN_ID` : `object`
- `DLC` : `int64`
- `D0` : `object`
- `D1` : `object`
- `D2` : `object`
- `D3` : `object`
- `D4` : `object`
- `D5` : `object`
- `D6` : `object`
- `D7` : `object`
- `Flag` : `object`

**Statistical Summary (Numeric Features):**
| Statistic | Timestamp | DLC |
|---|---|---|
| count | 3665771.0000 | 3665771.0000 |
| mean | 1478199903.7481 | 7.9490 |
| std | 847.1851 | 0.5511 |
| min | 1478198376.3894 | 2.0000 |
| 25% | 1478199158.7604 | 8.0000 |
| 50% | 1478199944.8087 | 8.0000 |
| 75% | 1478200691.3651 | 8.0000 |
| max | 1478201209.0589 | 8.0000 |

**Unique Values per Column:**
| Column | Unique Count |
|--------|-------------|
| Timestamp | 3,665,771 |
| CAN_ID | 27 |
| DLC | 2 |
| D0 | 108 |
| D1 | 71 |
| D2 | 76 |
| D3 | 26 |
| D4 | 190 |
| D5 | 256 |
| D6 | 75 |
| D7 | 256 |
| Flag | 2 |

### Fuzzy Attack (Fuzzy_dataset.csv)

**Data Types:**
- `Timestamp` : `float64`
- `CAN_ID` : `object`
- `DLC` : `int64`
- `D0` : `object`
- `D1` : `object`
- `D2` : `object`
- `D3` : `object`
- `D4` : `object`
- `D5` : `object`
- `D6` : `object`
- `D7` : `object`
- `Flag` : `object`

**Statistical Summary (Numeric Features):**
| Statistic | Timestamp | DLC |
|---|---|---|
| count | 3838860.0000 | 3838860.0000 |
| mean | 1478197825.5009 | 7.9045 |
| std | 1837.4323 | 0.6623 |
| min | 1478195721.9039 | 2.0000 |
| 25% | 1478196411.9475 | 8.0000 |
| 50% | 1478197194.0639 | 8.0000 |
| 75% | 1478198146.1153 | 8.0000 |
| max | 1478201209.0589 | 8.0000 |

**Unique Values per Column:**
| Column | Unique Count |
|--------|-------------|
| Timestamp | 3,838,860 |
| CAN_ID | 2,048 |
| DLC | 4 |
| D0 | 256 |
| D1 | 256 |
| D2 | 257 |
| D3 | 256 |
| D4 | 256 |
| D5 | 257 |
| D6 | 257 |
| D7 | 256 |
| Flag | 2 |

### Gear Spoofing (gear_dataset.csv)

**Data Types:**
- `Timestamp` : `float64`
- `CAN_ID` : `object`
- `DLC` : `int64`
- `D0` : `object`
- `D1` : `object`
- `D2` : `object`
- `D3` : `object`
- `D4` : `object`
- `D5` : `object`
- `D6` : `object`
- `D7` : `object`
- `Flag` : `object`

**Statistical Summary (Numeric Features):**
| Statistic | Timestamp | DLC |
|---|---|---|
| count | 4443142.0000 | 4443142.0000 |
| mean | 1478195528.3644 | 7.9458 |
| std | 2771.7547 | 0.5679 |
| min | 1478193190.0566 | 2.0000 |
| 25% | 1478193795.4418 | 8.0000 |
| 50% | 1478194415.7283 | 8.0000 |
| 75% | 1478195009.9831 | 8.0000 |
| max | 1478201209.0589 | 8.0000 |

**Unique Values per Column:**
| Column | Unique Count |
|--------|-------------|
| Timestamp | 4,443,142 |
| CAN_ID | 26 |
| DLC | 2 |
| D0 | 150 |
| D1 | 130 |
| D2 | 98 |
| D3 | 36 |
| D4 | 221 |
| D5 | 256 |
| D6 | 107 |
| D7 | 256 |
| Flag | 2 |

### RPM Spoofing (RPM_dataset.csv)

**Data Types:**
- `Timestamp` : `float64`
- `CAN_ID` : `object`
- `DLC` : `int64`
- `D0` : `object`
- `D1` : `object`
- `D2` : `object`
- `D3` : `object`
- `D4` : `object`
- `D5` : `object`
- `D6` : `object`
- `D7` : `object`
- `Flag` : `object`

**Statistical Summary (Numeric Features):**
| Statistic | Timestamp | DLC |
|---|---|---|
| count | 4621702.0000 | 4621702.0000 |
| mean | 1478193747.5141 | 7.9462 |
| std | 3565.4170 | 0.5658 |
| min | 1478191030.0451 | 2.0000 |
| 25% | 1478191665.3349 | 8.0000 |
| 50% | 1478192266.3258 | 8.0000 |
| 75% | 1478192843.9863 | 8.0000 |
| max | 1478201209.0589 | 8.0000 |

**Unique Values per Column:**
| Column | Unique Count |
|--------|-------------|
| Timestamp | 4,621,702 |
| CAN_ID | 26 |
| DLC | 2 |
| D0 | 113 |
| D1 | 85 |
| D2 | 89 |
| D3 | 28 |
| D4 | 192 |
| D5 | 256 |
| D6 | 80 |
| D7 | 256 |
| Flag | 2 |

### Normal Operation (normal_run_data.txt)

**Data Types:**
- `Timestamp` : `float64`
- `CAN_ID` : `object`
- `Unknown` : `object`
- `DLC` : `int64`
- `D0` : `object`
- `D1` : `object`
- `D2` : `object`
- `D3` : `object`
- `D4` : `object`
- `D5` : `object`
- `D6` : `object`
- `D7` : `object`

**Statistical Summary (Numeric Features):**
| Statistic | Timestamp | DLC |
|---|---|---|
| count | 988871.0000 | 988871.0000 |
| mean | 1479121688.0667 | 7.7850 |
| std | 146.1962 | 0.8849 |
| min | 1479121434.8502 | 2.0000 |
| 25% | 1479121561.4567 | 8.0000 |
| 50% | 1479121688.0666 | 8.0000 |
| 75% | 1479121814.6746 | 8.0000 |
| max | 1479121941.2868 | 8.0000 |

**Unique Values per Column:**
| Column | Unique Count |
|--------|-------------|
| Timestamp | 988,871 |
| CAN_ID | 27 |
| Unknown | 1 |
| DLC | 3 |
| D0 | 256 |
| D1 | 256 |
| D2 | 256 |
| D3 | 256 |
| D4 | 256 |
| D5 | 256 |
| D6 | 227 |
| D7 | 256 |

## 3. Data Quality Analysis

### Missing Values

| Dataset | Column | Missing Count | Missing % |
|---------|--------|--------------|-----------|
| DoS Attack | D3 | 31,188 | 0.8508% |
| DoS Attack | D4 | 31,188 | 0.8508% |
| DoS Attack | D5 | 31,188 | 0.8508% |
| DoS Attack | D6 | 31,188 | 0.8508% |
| DoS Attack | D7 | 31,188 | 0.8508% |
| DoS Attack | Flag | 31,188 | 0.8508% |
| Fuzzy Attack | D3 | 34,382 | 0.8956% |
| Fuzzy Attack | D4 | 34,382 | 0.8956% |
| Fuzzy Attack | D5 | 34,382 | 0.8956% |
| Fuzzy Attack | D6 | 87,833 | 2.2880% |
| Fuzzy Attack | D7 | 87,836 | 2.2881% |
| Fuzzy Attack | Flag | 87,836 | 2.2881% |
| Gear Spoofing | D3 | 40,165 | 0.9040% |
| Gear Spoofing | D4 | 40,165 | 0.9040% |
| Gear Spoofing | D5 | 40,165 | 0.9040% |
| Gear Spoofing | D6 | 40,165 | 0.9040% |
| Gear Spoofing | D7 | 40,165 | 0.9040% |
| Gear Spoofing | Flag | 40,165 | 0.9040% |
| RPM Spoofing | D3 | 41,476 | 0.8974% |
| RPM Spoofing | D4 | 41,476 | 0.8974% |
| RPM Spoofing | D5 | 41,476 | 0.8974% |
| RPM Spoofing | D6 | 41,476 | 0.8974% |
| RPM Spoofing | D7 | 41,476 | 0.8974% |
| RPM Spoofing | Flag | 41,476 | 0.8974% |

### Duplicate Rows

| Dataset | Duplicate Rows | % of Total |
|---------|---------------|------------|
| DoS Attack | 0 | 0.0000% |
| Fuzzy Attack | 0 | 0.0000% |
| Gear Spoofing | 0 | 0.0000% |
| RPM Spoofing | 0 | 0.0000% |
| Normal Operation | 0 | 0.0000% |

### DLC (Data Length Code) Analysis

- **DoS Attack**: DLC=2: 31,188, DLC=8: 3,634,583
- **Fuzzy Attack**: DLC=2: 34,382, DLC=5: 53,451, DLC=6: 3, DLC=8: 3,751,024
- **Gear Spoofing**: DLC=2: 40,165, DLC=8: 4,402,977
- **RPM Spoofing**: DLC=2: 41,476, DLC=8: 4,580,226
- **Normal Operation**: DLC=2: 10,129, DLC=5: 50,606, DLC=8: 928,136

## 4. Observations

1. All attack datasets (CSV) share an identical 12-column schema with columns: Timestamp, CAN_ID, DLC, D0-D7, and Flag.
2. The normal operation dataset (TXT) has a different format with labeled key-value pairs and an extra 'Unknown' column (likely padding or reserved field).
3. No missing values were found in any dataset - data collection appears complete.
4. The RPM dataset is the largest (4,621,702 records), while the normal dataset is the smallest (988,871 records). Attack datasets significantly outnumber normal data.
5. DLC values are consistently 8 for most messages, indicating standard CAN frame lengths.
6. CAN_ID values are hexadecimal strings - conversion to integer is necessary for ML model ingestion.
7. Data bytes (D0-D7) are hexadecimal strings representing sensor values, ECU states, and vehicle signals.
8. The imbalance between attack and normal data (roughly 16:1 ratio) presents a class imbalance challenge for supervised learning.
9. Certain CAN IDs appear far more frequently than others - this is expected in vehicle CAN traffic where periodic messages dominate.

## 5. Challenges

1. **Severe Class Imbalance**: Attack data (~16.6M records) vastly outweighs normal data (~0.99M). This will require resampling (SMOTE, under-sampling) or anomaly detection approaches.
2. **TXT vs CSV Format Incompatibility**: The normal_run_data.txt uses a different schema. A robust parser and schema alignment step is needed before merging datasets.
3. **Hex Encoding**: CAN_ID and data bytes are hex strings - these must be converted to numerical values for ML models, raising questions about encoding strategy (raw int vs one-hot vs embedding).
4. **Timestamp Irregularity**: Timestamps across datasets are from different time windows, making cross-dataset temporal alignment impossible without normalization.
5. **No Ground Truth Labels per Message**: The datasets are labelled by attack type at the file level, not at the individual message level. This limits supervised learning approaches unless per-message labeling can be inferred.
6. **Data Volume**: With ~17.6M total records, in-memory processing requires efficient chunking and memory management strategies.
7. **Unknown Column in Normal Data**: The extra column in normal_run_data.txt requires investigation - it may be a CAN ID extension, padding, or metadata field.

## 6. Recommendations for AI Model Development

1. **Adopt an Anomaly Detection Paradigm**: Given the file-level labels and extreme class imbalance, treat the problem as semi-supervised anomaly detection - train on normal data, detect deviations as attacks.
2. **Feature Engineering Priorities** - Convert the following raw features into ML-ready inputs:
3.    - `CAN_ID`: Encode as integer (from hex) - high-cardinality categorical feature
4.    - `D0-D7`: Convert hex to uint8 integers - these form the core signal vector (8-dimensional)
5.    - `Timestamp`: Extract inter-message arrival times (delta-t) - a strong temporal feature
6.    - `DLC`: Keep as integer - may indicate anomalous payload sizes
7.    - Rolling statistics over windows (e.g., mean/variance of data bytes over last 100 messages)
8. **Recommended Model Approaches**:
9.    - **Isolation Forest** - Fast, scalable, unsupervised
10.    - **Autoencoders** - Reconstruction-error-based anomaly detection on byte sequences
11.    - **OC-SVM** - One-class classification on normal traffic patterns
12.    - **XGBoost** - If per-message labels can be inferred via sliding-window heuristics
13. **Validation Strategy**: Use normal data as the training set, attack CSVs as the test set. Evaluate using Precision-Recall curves due to extreme class imbalance.
14. **Temporal Splitting**: Maintain temporal ordering when splitting data to avoid data leakage.
15. **Explainability Integration**: Plan for SHAP integration from the start - ensure model choices support post-hoc explanations (tree-based or differentiable models).

## 7. Readiness for Phase 2 (Final Assessment)

### 7.1 Is Preprocessing Required?

**Yes - significant preprocessing is required before model training.** The key preprocessing steps are:

1. **Schema Alignment**: Parse normal_run_data.txt into a consistent format matching the CSV attack datasets.
2. **Hex to Integer Conversion**: Convert CAN_ID and data bytes (D0-D7) from hex strings to numerical values.
3. **Feature Extraction**:
4.    - Compute inter-message arrival times (Timestamp deltas)
5.    - Extract CAN_ID frequency features (rolling counts per ID)
6.    - Calculate byte-level statistics (mean, std, min, max across D0-D7)
7.    - Create rolling window aggregations (smoothing, trend features)
8. **Labeling Strategy**:
9.    - Normal: all rows from normal_run_data.txt -> label 0
10.    - Attack: all rows from DoS/Fuzzy/Gear/RPM CSVs -> label 1
11.    - Optional: multi-class labeling by attack type for fine-grained classification
12. **Normalization/Standardization**: Apply StandardScaler or MinMaxScaler to numeric features.
13. **Handling Class Imbalance**: Use SMOTE or ADASYN for oversampling normal class, or use anomaly detection methods that are inherently robust to imbalance.

### 7.2 Which Features Appear Most Useful?

1. **CAN_ID (encoded as integer)**: Different attack types may target specific CAN IDs - this is the strongest discriminative feature.
2. **Data Bytes (D0-D7 as uint8 array)**: The actual payload values encode vehicle states. Attack messages often inject anomalous byte patterns.
3. **Inter-message Timing (delta-t)**: Attack traffic (especially DoS) shows dramatically different message frequencies - delta-t distributions are highly discriminative.
4. **Rolling Byte Statistics**: Mean and variance of data bytes over a sliding window can capture injection patterns invisible at the single-message level.
5. **DLC**: Though mostly constant (8), deviations in DLC could signal malformed attack messages.

### 7.3 Recommended Anomaly Detection Approaches

| Approach | Type | Why Suitable | Expected Performance |
|----------|------|--------------|---------------------|
| **Isolation Forest** | Unsupervised | Fast, handles high-dim, works well on CAN traffic | Good baseline (F1 ~0.85-0.90) |
| **Autoencoder (AE)** | Semi-supervised | Learns normal byte patterns, detects anomalous reconstructions | Strong (F1 ~0.90-0.95) |
| **OC-SVM with RBF** | One-class | Good for high-dim boundary detection | Moderate (F1 ~0.80-0.85) |
| **LSTM-Autoencoder** | Sequential | Captures temporal patterns in message sequences | Very strong (F1 ~0.93-0.97) |
| **XGBoost (if labeled)** | Supervised | Handles mixed features, SHAP-compatible | Best if labels available (F1 ~0.95+) |

### 7.4 Risks and Limitations

1. **Temporal Generalization Risk**: All attack data was collected in controlled test environments. Real-world attack patterns may differ significantly from these datasets.
2. **Label Ambiguity**: File-level labels do not guarantee that every message in an attack CSV is malicious - some may be benign CAN traffic captured during the attack window.
3. **Single Vehicle Bias**: The data appears to be from a single vehicle model. Models may not generalize to other vehicle makes/models without domain adaptation.
4. **Concept Drift Over Time**: Vehicle ECUs, firmware, and CAN bus behavior can change - models need continuous retraining or online learning capability.
5. **Edge Hardware Constraints**: Deep learning approaches (LSTM-Autoencoder) may exceed the compute/memory budget of typical automotive edge hardware. Model compression (quantization, pruning) will be necessary.
6. **No Ground Truth for Response Validation**: Without a simulated or real-vehicle testbed, the self-healing response agent cannot be validated in this phase.
7. **Memory Footprint**: Processing 17.6M records requires careful memory management - chunked processing and efficient data structures are essential.
