# AutoShield Edge — Phase 3 Summary

**Baseline Anomaly Detection (Isolation Forest on Per-Message Features)**

## Overview
Implemented baseline Isolation Forest anomaly detection on per-message (single CAN frame) features. Established the baseline F1=0.112 that all subsequent phases improved upon.

## Key Results
| Metric | Value |
|---|---|
| Precision | 0.4342 |
| Recall | 0.0643 |
| F1 | 0.1120 |
| AUC | 0.5050 |

## Limitations Identified
- **Per-message detection fundamentally limited**: Individual CAN frames appear normal in isolation
- **No temporal context**: Cannot detect burst patterns or frequency anomalies
- **High false positive rate**: Random payload variations trigger false alerts

## Lesson Learned
Temporal context via behavioral windows is essential for CAN bus anomaly detection. This finding motivated Phase 4-5 development.
