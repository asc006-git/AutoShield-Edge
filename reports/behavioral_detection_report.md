# AutoShield Edge — Behavioral Detection Report

**Phase 5: One-Class Anomaly Detection on Behavioral Windows (W=50)**

## 1. Executive Summary

This report evaluates three one-class anomaly detectors trained exclusively on **19,777 Normal behavioral windows** (W=50) and tested on **351,166 windows** (331,389 attacks across 4 types). The best model is **One-Class SVM** achieving F1=0.8146, AUC=0.8877, and Detection Rate=0.6893.

## 2. Methodology

### Training Set
- **Source**: 19,777 normal driving behavioral windows
- **Features**: 13 behavioral features (z-score normalized)
- **Label**: All training data is labeled "Normal" (Attack_Label = 0)

### Test Set
- **Source**: 351,166 windows (all 5 attack types)
- **Normal**: 19,777 windows
- **Attack**: 331,389 windows across DoS, Fuzzy, Gear, RPM

### Models Evaluated

| Model | Parameters | Training Time |
|---|---|---|
| Isolation Forest | n_estimators=100, contamination=0.05 | 4.4s |
| Local Outlier Factor | n_neighbors=20, contamination=0.05 | 36.1s |
| One-Class SVM | nu=0.01, kernel=rbf, gamma=scale | 4.1s |

### Threshold
- **Method**: 5th percentile of training decision function scores
- For OC-SVM: `threshold = percentile(normal_scores, 5)`
- Windows with decision scores below threshold are classified as anomalies

## 3. Performance Comparison

| Model | Precision | Recall | F1 Score | AUC | Detection Rate |
|---|---|---|---|---|---|
| Isolation Forest | 0.9936 | 0.4666 | 0.6350 | 0.8371 | 0.4666 |
| Local Outlier Factor | 0.9956 | 0.6810 | 0.8088 | 0.9055 | 0.6810 |
| **One-Class SVM** | **0.9957** | **0.6893** | **0.8146** | **0.8877** | **0.6893** |

## 4. Per-Attack Detection Rates

| Attack Type | IF | LOF | OC-SVM | Samples |
|---|---|---|---|---|
| DoS | 0.4338 | 0.6326 | **0.6400** | 73,315 |
| Fuzzy | 0.4409 | 0.5967 | **0.5963** | 76,777 |
| Gear | 0.5181 | 0.7426 | **0.7496** | 88,863 |
| RPM | 0.4644 | 0.7303 | **0.7475** | 92,434 |
| Normal | 0.0000 | 0.0000 | 0.0000 | 19,777 |

## 5. Improvement Over Baseline

Comparison with Phase 3 per-message Isolation Forest:

| Metric | Phase 3 (per-message IF) | Phase 5 (behavioral OC-SVM) | Improvement |
|---|---|---|---|
| Precision | 0.4342 | 0.9957 | +129.3% |
| Recall | 0.0643 | 0.6893 | +972.0% |
| F1 | 0.1120 | 0.8146 | +627.3% |
| AUC | 0.5050 | 0.8877 | +75.8% |

## 6. Selected Model: One-Class SVM

The OC-SVM was selected as the deployment model based on:
- **Highest F1 score** (0.8146 vs 0.8088 LOF, 0.6350 IF)
- **Highest detection rate** (0.6893 vs 0.6810 LOF)
- **Lowest training time** (4.1s vs 36.1s LOF)
- **Smallest model size** (single support vector set, ~200 KB serialized)
- **Inference speed**: <1ms per 500-window batch

## 7. Confusion Matrix (OC-SVM)

| | Predicted Normal | Predicted Attack |
|---|---|---|
| **Actual Normal** | TN: 18,788 | FP: 989 |
| **Actual Attack** | FN: 102,971 | TP: 228,418 |

- **True Positive Rate (Recall)**: 0.6893
- **False Positive Rate**: 0.0500
- **Precision**: 0.9957

## 8. Deployed Model

The trained OC-SVM is serialized to `data/models/ocsvm_model.joblib` and loaded at API startup. Inference runs entirely on CPU with no GPU dependency. The same model powers all 17 API endpoints and the 9-stage pipeline demonstration.
