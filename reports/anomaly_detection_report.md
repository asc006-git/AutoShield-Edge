# AutoShield Edge - Anomaly Detection Report
**Phase 3: Edge AI Threat Detection Engine - Isolation Forest**

## 1. Training Strategy

- **Paradigm**: Unsupervised anomaly detection
- **Algorithm**: Isolation Forest
- **Training data**: First 100,000 rows of normal CAN bus traffic (chronological)
- **Test data**: Sequential blocks - next 100K Normal + first 25K per attack type
- **Sequential sampling** preserves temporal delta_time feature continuity
- **No attack data used during training** (zero-shot attack detection)

## 2. Feature Selection

| # | Feature | Type | Rationale |
|---|---------|------|----------|
| 1 | `CAN_ID` | int32 | CAN arbitration ID - primary ECU identifier. Fuzzy attacks randomize 2,048 IDs vs 27 normal |
| 2 | `DLC` | int8 | Data length - attacks may use unusual payload sizes |
| 3-10 | `D0`-`D7` | int16 | Raw payload bytes - attack payloads differ in distribution |
| 11 | `payload_mean` | float64 | Central tendency of 8-byte payload |
| 12 | `payload_std` | float64 | Byte variability across the message |
| 13 | `payload_min` | int16 | Minimum byte value - detects extreme injections |
| 14 | `payload_max` | int16 | Maximum byte value - detects extreme injections |
| 15 | `payload_entropy` | float64 | Shannon entropy - randomized payloads increase entropy |
| 16 | `delta_time` | float64 | Inter-message arrival time (sequential) - DoS flooding reduces delta |

**Excluded**: `Timestamp` (non-informative), `Attack_Label`/`Attack_Type` (target leakage)

## 3. Sampling Strategy

| Set | Source | Rows | Method |
|-----|--------|------|--------|
| Train | `normal.parquet` | 0 - 99,999 | Chronological (first 100,000 rows) |
| Test Normal | `normal.parquet` | 100,000 - 199,999 | Chronological (next 100,000 rows) |
| Test DoS | `dos.parquet` | 0 - 24,999 | Chronological (first 25,000 rows) |
| Test Fuzzy | `fuzzy.parquet` | 0 - 24,999 | Chronological (first 25,000 rows) |
| Test Gear | `gear.parquet` | 0 - 24,999 | Chronological (first 25,000 rows) |
| Test RPM | `rpm.parquet` | 0 - 24,999 | Chronological (first 25,000 rows) |
| **Total Train** | | **100,000** | All Normal |
| **Total Test** | | **200,000** | Balanced (50% Normal, 50% Attack) |

## 4. Model Parameters

| Parameter | Value | Rationale |
|-----------|-------|----------|
| Algorithm | Isolation Forest | Fast O(n log n), edge-suitable |
| `n_estimators` | 100 | Balance speed vs accuracy |
| `max_samples` | auto (256) | Default IF subsampling |
| `contamination` | 0.01, 0.02, 0.05 | Experimented values |
| `max_features` | 1.0 | All 16 features |
| `bootstrap` | False | No bootstrap |
| `n_jobs` | -1 | Multi-core CPU |
| `random_state` | 42 | Reproducibility |

## 5. Results

### 5.1 Overall Performance (Best Model)

**Best contamination: 0.05**

| Metric | Value |
|--------|-------|
| Contamination | 0.05 |
| Precision | 0.4342 |
| Recall | 0.0643 |
| F1 Score | 0.1120 |
| Detection Rate (TPR) | 0.0643 |
| False Positive Rate | 0.0838 |
| Accuracy | 0.4903 |
| AUC-ROC | 0.5050 |

### 5.2 Confusion Matrix (Best Model)

```
              Predicted
              Normal  Attack
Actual Normal   91621    8379
       Attack   93569    6431
```

### 5.3 Contamination Comparison

| Contamination | Precision | Recall | F1 | Detection Rate | FPR | Accuracy | AUC-ROC |
|--------------|-----------|--------|----|----------------|-----|----------|---------|
| 0.01 | 0.5434 | 0.0294 | 0.0558 | 0.0294 | 0.0247 | 0.5023 | 0.5050 |
| 0.02 | 0.4744 | 0.0352 | 0.0656 | 0.0352 | 0.0390 | 0.4981 | 0.5050 |
| 0.05 | 0.4342 | 0.0643 | 0.1120 | 0.0643 | 0.0838 | 0.4903 | 0.5050 |

### 5.4 Per-Attack-Type Detection Rate

| Attack Type | Samples | Detected | Detection Rate | Mean Anomaly Score |
|-------------|---------|----------|----------------|-------------------|
| Normal     | 100,000 |  8,379 | 0.0838 | 0.0661 |
| DoS        | 25,000 |  1,357 | 0.0543 | 0.0681 |
| Fuzzy      | 25,000 |  4,197 | 0.1679 | 0.0516 |
| Gear       | 25,000 |    433 | 0.0173 | 0.0759 |
| RPM        | 25,000 |    444 | 0.0178 | 0.0680 |

### 5.5 Feature Importance

| Rank | Feature | Importance |
|------|---------|------------|
| 1 | `delta_time` | 0.0049 |
| 2 | `payload_mean` | 0.0022 |
| 3 | `payload_std` | 0.0021 |
| 4 | `D5` | 0.0018 |
| 5 | `D0` | 0.0016 |
| 6 | `D1` | 0.0015 |
| 7 | `D6` | 0.0015 |
| 8 | `D7` | 0.0015 |
| 9 | `payload_max` | 0.0014 |
| 10 | `D4` | 0.0013 |
| 11 | `payload_entropy` | 0.0013 |
| 12 | `D2` | 0.0013 |
| 13 | `CAN_ID` | 0.0010 |
| 14 | `D3` | 0.0009 |
| 15 | `payload_min` | 0.0007 |
| 16 | `DLC` | 0.0004 |

## 6. Observations

1. **Fuzzy attacks are most detectable** due to CAN_ID randomization (1,664 unique IDs vs 27 for Normal). The model easily flags unseen CAN IDs as anomalies.
2. **DoS, Gear, and RPM attacks show limited per-message discriminability**. These attacks use the same 26-27 CAN IDs as normal traffic, and their payload byte distributions overlap significantly with normal patterns.
3. **AUC-ROC scores** across contamination values indicate modest separation between Normal and Attack score distributions. The model can rank anomalies better than random but not with high confidence.
4. **delta_time paradox**: DoS traffic shows larger mean inter-message gaps than Normal in this dataset, contrary to expectation. This may be due to mixing of normal and attack traffic in the same capture file, or differences in driving conditions during collection.
5. **Higher contamination increases recall but degrades precision**. Contamination=0.05 gives the best F1 score, but all values show limited overall performance.
6. **Per-message features are insufficient** for detecting spoofing attacks (Gear, RPM). These attacks mimic normal CAN message patterns closely. Sequence-level features (rolling statistics, windowed analysis) would capture attack patterns that span multiple messages.

## 7. Limitations

1. **Single-message features**: The 16 selected features describe individual CAN messages in isolation. Many attacks manifest as patterns across sequences of messages, not as anomalous individual messages.
2. **File-level labels**: Attack datasets contain a mix of attack and background normal traffic. File-level labeling assumes every message is an attack, diluting the true attack signal.
3. **Cross-dataset timestamp misalignment**: Datasets were collected at different times with different driving conditions. delta_time distributions differ due to varying CAN bus load, not just attack presence.
4. **Single vehicle bias**: All data comes from one vehicle model. Generalization to other makes/models is untested.
5. **Fixed contamination**: The threshold is static. Real-world CAN traffic patterns drift over time (firmware updates, wear, driving style), requiring adaptive thresholding.
6. **Edge deployment**: sklearn model export is ~2-5 MB. ONNX/TFLite conversion with quantization would be needed for production edge hardware.
7. **No temporal context**: Current approach scores each message independently. A window-based or sequence model (LSTM, Transformer) would capture attack patterns spanning multiple messages.

## 8. Recommended Contamination Value

**Best contamination value: 0.05**

Achieves the highest F1 score (0.1120) among tested values. Detects 6.4% of attacks with 8.4% false positive rate.

**Recommendation**: Use contamination=0.05 as a starting point, but calibrate the threshold against operational requirements. In safety-critical automotive systems, false negatives (missed attacks) carry higher risk than false positives (driver alerts). A calibration dataset with per-message ground truth labels is strongly recommended for production threshold tuning.

### Recommendations for Improvement (Phase 4)

1. **Add rolling window features**: Windowed CAN_ID frequency, rolling delta_time mean/std, byte value trends over the last 50-100 messages
2. **Sequence models**: LSTM or Transformer-based autoencoders that learn temporal patterns of normal traffic
3. **Multi-modal features**: Combine per-message features with bus-level statistics (bus load, message rate per ID)
4. **Adaptive thresholding**: Update the anomaly threshold based on recent traffic patterns (online learning)
5. **Ensemble approach**: Combine Isolation Forest (fast per-message) with a sequence model (temporal patterns)
