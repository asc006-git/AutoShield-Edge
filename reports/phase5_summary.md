# AutoShield Edge — Phase 5 Summary

**Behavioral Threat Detection — One-Class SVM Ensemble**

## Overview
Trained and evaluated three one-class anomaly detectors on behavioral windows. Selected One-Class SVM (nu=0.01, RBF kernel) as the production model with F1=0.815 — a 627% improvement over Phase 3 baseline.

## Key Results
| Metric | IF | LOF | OC-SVM |
|---|---|---|---|
| F1 | 0.6350 | 0.8088 | **0.8146** |
| Recall | 0.4666 | 0.6810 | **0.6893** |
| Precision | 0.9936 | 0.9956 | **0.9957** |
| AUC | 0.8371 | **0.9055** | 0.8877 |
| Train Time | 4.4s | 36.1s | **4.1s** |

## Selected Model: One-Class SVM
- **nu**: 0.01 (expected ~1% outliers)
- **kernel**: RBF (gamma='scale')
- **Training data**: 19,777 normal windows
- **Threshold**: 5th percentile of training scores

## Improvement Trajectory
| Phase | Model | F1 | Improvement |
|---|---|---|---|
| Phase 3 | Per-message IF | 0.112 | — |
| Phase 5 | Behavioral OC-SVM | 0.815 | +627% |

## Serialized Outputs
- `data/models/ocsvm_model.joblib` — trained OC-SVM
- `data/models/scaler.joblib` — fitted StandardScaler
