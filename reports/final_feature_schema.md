# AutoShield Edge - Final Feature Schema
**Phase 2: Preprocessing & Feature Engineering**

## Complete Feature Catalogue

| # | Feature | Source | Type | Range | Description |
|---|---------|--------|------|-------|-------------|
| 1 | `Timestamp` | Raw | float64 | 1.478e9 - 1.479e9 | Unix epoch timestamp of the CAN message. Captures exact time of bus transmission. Used as basis for delta_time feature. |
| 2 | `CAN_ID` | Raw (transformed) | int32 | 0 - 4095 (11-bit) | CAN arbitration ID converted from hex to integer. Identifies the source ECU or message type. High cardinality categorical - a primary discriminator for detecting spoofing attacks. |
| 3 | `DLC` | Raw | int8 | 2, 5, 6, 8 | Data Length Code - number of valid data bytes in the CAN frame. Most messages use DLC=8. Deviations (DLC=2) strongly correlate with certain attack patterns. |
| 4 | `D0` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 0 (first payload byte). Converted from hex string to integer. -1 indicates the byte was not transmitted (DLC < 1). |
| 5 | `D1` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 1. Same encoding as D0. |
| 6 | `D2` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 2. Same encoding as D0. |
| 7 | `D3` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 3. Same encoding as D0. |
| 8 | `D4` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 4. Same encoding as D0. |
| 9 | `D5` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 5. Same encoding as D0. |
| 10 | `D6` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 6. Same encoding as D0. |
| 11 | `D7` | Raw (transformed) | int16 | -1 to 255 | CAN data byte 7 (last payload byte). Same encoding as D0. |
| 12 | `payload_mean` | Engineered | float64 | -1.0 to 255.0 | Mean of the 8 payload bytes (D0-D7). Captures the central tendency of the CAN message payload. Attack messages often shift the mean value distribution. |
| 13 | `payload_std` | Engineered | float64 | 0.0 to 255.0 | Standard deviation of the 8 payload bytes. Measures byte-to-byte variability within a single message. Low std indicates uniform/padding bytes; high std suggests diverse sensor data. |
| 14 | `payload_min` | Engineered | int16 | -1 to 255 | Minimum value among payload bytes D0-D7. Identifies the smallest byte in the message, useful for detecting injected extreme values. |
| 15 | `payload_max` | Engineered | int16 | -1 to 255 | Maximum value among payload bytes D0-D7. Identifies the largest byte in the message, useful for detecting injected extreme values. |
| 16 | `payload_entropy` | Engineered | float64 | 0.0 - 3.0 | Shannon entropy of the 8-byte payload. Low entropy indicates repetitive/predictable patterns (e.g., all zeros or constant values). High entropy suggests randomized attack payloads. Max possible entropy for 8 bytes is log2(8) = 3.0. |
| 17 | `delta_time` | Engineered | float64 | 0.0 - 10.0+ | Inter-message arrival time (seconds since previous CAN message). A critical temporal feature - DoS attacks flood the bus with abnormally high frequency messages (very small delta times). Normal traffic shows more variable inter-arrival times. |
| 18 | `Attack_Label` | Derived | int8 | 0 or 1 | Binary classification label: 0 = Normal (benign CAN traffic), 1 = Attack (malicious CAN traffic). Derived from the source dataset file. |
| 19 | `Attack_Type` | Derived | category | DoS, Fuzzy, Gear, RPM, Normal | Multi-class attack type label. Enables fine-grained classification: which type of attack is occurring. Useful for targeted response agent deployment. |

## Feature Categories

| Category | Features | Count |
|----------|----------|-------|
| **Raw (transformed)** | `Timestamp`, `CAN_ID`, `DLC`, `D0`-`D7` | 11 |
| **Payload Statistics** | `payload_mean`, `payload_std`, `payload_min`, `payload_max` | 4 |
| **Temporal** | `delta_time` | 1 |
| **Information Theory** | `payload_entropy` | 1 |
| **Labels** | `Attack_Label`, `Attack_Type` | 2 |

## Missing Value Handling

- **Sentinel value**: `-1` for missing payload bytes (D0-D7)
- **Rationale**: CAN data bytes are `uint8` (valid range 0-255). The sentinel `-1` is outside this range, ensuring missing bytes are never mistaken for legitimate zero readings.
- **Trigger condition**: When `DLC < byte_index + 1`, the byte was not transmitted by the ECU and is set to `-1`.
- **Impact on ML**: Models must be trained to recognize -1 as a special missing value. Tree-based models handle this naturally; neural networks may benefit from masking or embedding.