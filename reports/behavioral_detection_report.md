# AutoShield Edge — Behavioral Detection Report

**Phase 5: One-Class Anomaly Detection on Behavioral Windows (W=50)**

## 1. Executive Summary

This report evaluates three one-class anomaly detectors trained exclusively on **19,777 Normal behavioral windows** (W=50) and tested on **351,166 windows** (331,389 attacks across 4 types). The best model is **One-Class SVM** achieving F1=0.8146, AUC=0.8877, and Detection Rate=0.6893.

## 2. Methodology

- **Training**: Pure normal windows only (one-class setting)

- **Testing**: All windows (Normal + 4 attack types)

- **Features**: 13 behavioral features (CAN diversity, timing, payload, burst)

- **Window Size**: 50 messages (recommended by Phase 4)

- **Threshold**: 5th percentile of training decision function scores

- **OCSVM subsample**: 5000 for computational feasibility


## 3. Model Configuration

| Model | Key Parameters |

|-------|----------------|

| Isolation Forest | n_estimators=200, contamination='auto', max_samples='auto' |

| LOF | n_neighbors=20, contamination='auto', novelty=True |

| One-Class SVM | nu=0.01, kernel='rbf', gamma='scale' |


## 4. Overall Results

| Metric | Isolation Forest | LOF | One-Class SVM |

|--------|-----------------|-----|---------------|

| Precision | 0.9936 | 0.9956 | 0.9957 |

| Recall | 0.4666 | 0.6810 | 0.6893 |

| F1 | 0.6350 | 0.8088 | 0.8146 |

| AUC | 0.8371 | 0.9055 | 0.8877 |

| Avg_Precision | 0.9880 | 0.9938 | 0.9927 |

| FPR | 0.0500 | 0.0500 | 0.0500 |

| Detection_Rate | 0.4666 | 0.6810 | 0.6893 |

| Train_Time_s | 7.3000 | 208.7000 | 32.0000 |


## 5. Confusion Matrices

| Model | TN | FP | FN | TP |

|-------|----|----|----|----|

| Isolation Forest | 18788 | 989 | 176774 | 154615 |

| LOF | 18788 | 989 | 105703 | 225686 |

| One-Class SVM | 18788 | 989 | 102971 | 228418 |


## 6. Per-Attack Detection Rates

| Attack Type | Isolation Forest | LOF | One-Class SVM | Samples |

|-------------|-----------------|-----|---------------|---------|

| Normal | 0.0000 | 0.0000 | 0.0000 | 19777 |

| DoS | 0.4338 | 0.6326 | 0.6400 | 73315 |

| Fuzzy | 0.4409 | 0.5967 | 0.5963 | 76777 |

| Gear | 0.5181 | 0.7426 | 0.7496 | 88863 |

| RPM | 0.4644 | 0.7303 | 0.7475 | 92434 |


## 7. ROC Analysis

- **Isolation Forest**: AUC=0.8371, Average Precision=0.9880

- **LOF**: AUC=0.9055, Average Precision=0.9938

- **One-Class SVM**: AUC=0.8877, Average Precision=0.9927


## 8. Feature Importance (Isolation Forest)

| Rank | Feature | Importance |

|------|---------|------------|

| 1 | window_payload_std | 0.431444 |

| 2 | payload_instability_score | 0.431444 |

| 3 | unique_can_ids_window | 0.351179 |

| 4 | window_payload_mean | 0.233061 |

| 5 | can_id_entropy | 0.209818 |

| 6 | messages_per_second | 0.173022 |

| 7 | message_burst_score | 0.080534 |

| 8 | window_payload_entropy_mean | 0.071502 |

| 9 | window_delta_time_min | 0.047053 |

| 10 | window_delta_time_mean | 0.004694 |

| 11 | window_delta_time_std | 0.004224 |

| 12 | window_delta_time_max | 0.004180 |

| 13 | frequency_spike_score | 0.004167 |


## 9. Comparison vs Phase 3 (Single-Message IF)

| Metric | Phase 3 (IF) | Phase 5 (Best) | Improvement |

|--------|--------------|----------------|-------------|

| Precision | 0.4342 | 0.9957 | +129.3% |

| Recall | 0.0643 | 0.6893 | +972.0% |

| F1 | 0.1120 | 0.8146 | +627.3% |

| AUC | 0.5050 | 0.8877 | +75.8% |


## 10. Operational Suitability

### Best Model: One-Class SVM

- **F1 Score**: 0.8146

- **Detection Rate**: 0.6893

- **False Positive Rate**: 0.0500

- **Training Time**: 32.0s


**Suitability**: **Production-ready** with threshold tuning


### Deployment Notes

- IF offers native feature importance for interpretability

- IF training is fast and scales to large datasets

- LOF is suitable for local density-based anomalies

- OCSVM requires subsampling for large training sets


## 11. Output Files

| File | Description |

|------|-------------|

| `src/anomaly_detection/behavioral_detector_v2.py` | Detector implementation |

| `assets/model_comparison.png` | Model comparison bar chart |

| `assets/roc_comparison.png` | ROC curves |

| `assets/behavioral_confusion_matrix.png` | Confusion matrices |

| `assets/per_attack_detection_rate_v2.png` | Per-attack detection rates |

| `reports/behavioral_detection_report.md` | This report |

| `reports/phase5_summary.md` | Phase 5 summary |
