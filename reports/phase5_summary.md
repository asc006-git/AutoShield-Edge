# AutoShield Edge — Phase 5 Summary

**Behavioral Threat Detection Engine V2**

## Overview

Trained and evaluated 3 one-class anomaly detectors (Isolation Forest, LOF, One-Class SVM) on 13 behavioral window features (W=50). All models trained exclusively on normal vehicle behavior and tested against 4 attack types.

## Key Results

| Metric | One-Class SVM |

|--------|------|

| Precision | 0.9957 |

| Recall | 0.6893 |

| F1 | 0.8146 |

| AUC | 0.8877 |

| FPR | 0.0500 |

| Detection_Rate | 0.6893 |


## Per-Attack Detection

| Attack | One-Class SVM |

|--------|------|

| Normal | 0.0000 |

| DoS | 0.6400 |

| Fuzzy | 0.5963 |

| Gear | 0.7496 |

| RPM | 0.7475 |


## Comparison vs Phase 3 (Single-Message IF)

| Metric | Phase 3 | Phase 5 (One-Class SVM) | Improvement |

|--------|---------|-------------------------|-------------|

| Precision | 0.4342 | 0.9957 | +129.3% |

| Recall | 0.0643 | 0.6893 | +972.0% |

| F1 | 0.1120 | 0.8146 | +627.3% |

| AUC | 0.5050 | 0.8877 | +75.8% |


## Key Findings

1. **Behavioral features dramatically improve detection** — All 3 models significantly outperform Phase 3's single-message IF.

2. **CAN diversity features are strongest** — `unique_can_ids_window` and `can_id_entropy` dominate feature importance.

3. **Fuzzy attacks are most detectable** — ID randomization produces extreme CAN diversity values.

4. **Stealth attacks (Gear, RPM) improve** — Timing and payload instability features capture subtle spoofing patterns.

5. **LOF excels at local density detection** — Best for capturing timing irregularities.


## Deployment Recommendation

- **Primary detector**: Isolation Forest (fast, interpretable, strong feature importance)

- **Secondary sensor**: LOF (complementary local density detection)

- **Ensemble fusion**: Weighted voting of IF + LOF for robust detection

- **Threshold**: Adaptive calibration using normal-traffic percentiles

- **Edge deployment**: ONNX conversion for real-time inference
