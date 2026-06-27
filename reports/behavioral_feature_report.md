# AutoShield Edge — Behavioral Feature Report

**Phase 4: Behavioral Cyber Twin Feature Engineering**

## 1. Behavioral Feature Concept

The Behavioral Cyber Twin is a digital representation of a vehicle's normal CAN bus communication patterns. It does not analyze individual CAN messages — instead, it computes a set of 13 statistical features over fixed-size windows of W=50 consecutive messages. This transforms the raw CAN message stream into a time series of behavioral snapshots.

## 2. Feature Categories

### 2.1 Communication Rate
- **`messages_per_second`**: The number of CAN messages per second in the window. Under normal conditions, this is relatively stable (~2000 msg/s). DoS attacks cause extreme spikes; spoofing attacks may cause slight deviations.

### 2.2 CAN ID Diversity
- **`unique_can_ids_window`**: Number of distinct CAN IDs present in the window. Normal traffic uses 7 primary IDs. Fuzzy attacks inject random IDs, increasing this count.
- **`can_id_entropy`**: Shannon entropy of the CAN ID distribution. Measures how evenly messages are distributed across IDs. Fuzzy attacks show elevated entropy; DoS floods show reduced entropy (single ID dominates).

### 2.3 Timing Regularity
- **`window_delta_time_mean`**: Mean inter-message arrival time within the window. Stable under normal driving.
- **`window_delta_time_std`**: Standard deviation of inter-message arrival times. Indicates timing jitter.
- **`window_delta_time_min`**: Minimum inter-message gap. Detects burst activity.
- **`window_delta_time_max`**: Maximum inter-message gap. Detects gaps caused by ECU suppression.

### 2.4 Payload Statistics
- **`window_payload_mean`**: Mean byte value across all payloads in the window.
- **`window_payload_std`**: Standard deviation of payload byte values.
- **`window_payload_entropy_mean`**: Mean Shannon entropy of individual message payloads.

### 2.5 Attack Pressure
- **`message_burst_score`**: Measures temporal concentration of messages. High during DoS floods.
- **`frequency_spike_score`**: Measures deviation from expected message frequency per CAN ID.
- **`payload_instability_score`**: Measures byte-level instability across sequential payloads.

## 3. Feature Separability

Based on analysis of the feature distributions across attack types:

| Feature | Normal | DoS | Fuzzy | Gear | RPM |
|---|---|---|---|---|---|
| `messages_per_second` | ~2000 | ~7500 | ~2100 | ~5200 | ~4200 |
| `can_id_entropy` | ~1.8 | ~0.2 | ~3.5 | ~1.5 | ~1.4 |
| `message_burst_score` | ~0.3 | ~0.9 | ~0.5 | ~0.6 | ~0.5 |
| `payload_instability_score` | ~0.2 | ~0.1 | ~0.8 | ~0.4 | ~0.3 |

## 4. Feature Importance Ranking

Computed from the current OC-SVM model via z-score deviation analysis:

| Rank | Feature | Importance | Category |
|---|---|---|---|
| 1 | `window_payload_std` | 0.4314 | Payload |
| 2 | `payload_instability_score` | 0.4314 | Attack Pressure |
| 3 | `unique_can_ids_window` | 0.3512 | CAN Diversity |
| 4 | `window_payload_mean` | 0.2331 | Payload |
| 5 | `can_id_entropy` | 0.2098 | CAN Diversity |
| 6 | `messages_per_second` | 0.1730 | Communication Rate |
| 7 | `message_burst_score` | 0.0805 | Attack Pressure |
| 8 | `window_payload_entropy_mean` | 0.0715 | Payload |
| 9 | `window_delta_time_min` | 0.0471 | Timing |
| 10 | `window_delta_time_mean` | 0.0047 | Timing |
| 11 | `window_delta_time_std` | 0.0042 | Timing |
| 12 | `window_delta_time_max` | 0.0042 | Timing |
| 13 | `frequency_spike_score` | 0.0042 | Attack Pressure |
