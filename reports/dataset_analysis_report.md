# AutoShield Edge — Dataset Analysis Report

**Phase 1-2: CAN Bus Dataset Exploration and Preprocessing**

## 1. Dataset Overview

The AutoShield Edge pipeline is built on the **AutoShield Edge CAN Bus Attack Dataset**, composed of 17.5 million CAN 2.0B messages recorded from a real vehicle under controlled attack scenarios. The dataset is partitioned across 5 behavioral classes: Normal, DoS Flood, Fuzzy, Gear Spoofing, and RPM Spoofing.

### Dataset Composition

| Attack Type | Messages | Label | Description |
|---|---|---|---|
| Normal Driving | 988,871 | Normal | Baseline CAN traffic under standard driving conditions |
| DoS Attack | 3,665,771 | Attack | CAN gateway saturation with high-priority 0x000 messages |
| Fuzzy Attack | 3,838,860 | Attack | Randomized CAN ID and payload injection targeting the ABS module |
| Gear Spoofing | 4,443,142 | Attack | Fabricated transmission gear messages targeting TCU |
| RPM Spoofing | 4,621,702 | Attack | Fabricated engine RPM messages targeting ECU |
| **Total** | **17,558,346** | — | — |

### Data Source

Each CAN message includes:
- **Timestamp**: Message arrival time (microsecond resolution)
- **CAN ID**: 11-bit identifier (0x000–0x7FF)
- **DLC**: Data Length Code (0–8 bytes)
- **Payload**: 0–8 bytes of hexadecimal data
- **Attack Label**: Binary flag (0 = normal, 1 = attack)
- **Attack Type**: Categorical label (Normal, DoS, Fuzzy, Gear, RPM)

## 2. Exploratory Data Analysis

### Per-Message Feature Distribution

19 per-message features were engineered from raw CAN attributes:

1. **Temporal Features**: `delta_time`, `timestamp_seconds`
2. **CAN ID Features**: `can_id_dec`, `can_id_priority`, `is_extended_id`
3. **Payload Features**: `payload_mean`, `payload_std`, `payload_sum`, `payload_min`, `payload_max`, `payload_non_zero_count`, `payload_entropy`
4. **DLC Features**: `dlc`, `dlc_normalized`
5. **Attack Context**: `attack_label`, `attack_type_encoded`

### Key EDA Observations

- **CAN ID distribution**: 7 primary CAN IDs dominate traffic (0x0A, 0x12, 0x1A, 0x24, 0x32, 0x48, 0x2C)
- **Payload entropy**: Normal traffic shows stable entropy (~0.5–1.5); attack traffic shows extreme values near 0 (DoS) or near 3 (Fuzzy)
- **Delta-time**: Normal traffic has regular inter-message timing (~0.5ms mean); attacks introduce irregular spacing
- **DLC distribution**: Most legitimate messages are 8-byte frames; attack traffic often uses shorter DLC values

## 3. Behavioral Windowing Strategy

Raw per-message features are insufficient for reliable detection because individual CAN messages appear innocent in isolation. Behavioral windows capture the temporal context essential for detecting coordinated attacks.

### Window Sizes Evaluated

| Window Size (W) | Windows (Normal) | Windows (Total) | Trade-off |
|---|---|---|---|
| 10 | 98,887 | 1,755,834 | High temporal resolution, higher noise |
| 50 | 19,777 | 351,166 | **Selected** — best F1/compute balance |
| 100 | 9,888 | 175,583 | Lower noise, slower response |

### Final Selection: W=50

Window size 50 was selected as the optimal balance between:
- **Detection sensitivity**: Large enough to capture attack burst patterns
- **Response latency**: ~25ms of CAN traffic (at 2000 msg/s) before detection
- **Statistical stability**: Sufficient samples per window for meaningful feature computation
- **Computational efficiency**: 351K windows trains in ~4 seconds

## 4. Behavioral Feature Engineering

For each window of W=50 CAN messages, 13 behavioral features are computed across 5 categories:

### Communication Rate (1 feature)
- `messages_per_second`: Normalized message frequency (msg/s)

### CAN ID Diversity (2 features)
- `unique_can_ids_window`: Number of distinct CAN IDs observed
- `can_id_entropy`: Shannon entropy of the CAN ID distribution

### Timing Regularity (4 features)
- `window_delta_time_mean`, `window_delta_time_std`
- `window_delta_time_min`, `window_delta_time_max`

### Payload Statistics (3 features)
- `window_payload_mean`, `window_payload_std`
- `window_payload_entropy_mean`

### Attack Pressure (3 features)
- `message_burst_score`: Concentration of messages in sub-windows
- `frequency_spike_score`: Deviation from expected message frequency
- `payload_instability_score`: Variance in payload byte values

## 5. Output

The final behavioral dataset consists of **351,166 windows** across 5 attack classes, each with 13 features plus attack label metadata. Files are stored as compressed parquet:
- `data/behavioral/normal_w50.parquet` (19,777 windows)
- `data/behavioral/dos_w50.parquet` (73,315 windows)
- `data/behavioral/fuzzy_w50.parquet` (76,777 windows)
- `data/behavioral/gear_w50.parquet` (88,863 windows)
- `data/behavioral/rpm_w50.parquet` (92,434 windows)
