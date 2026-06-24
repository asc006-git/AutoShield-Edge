# AutoShield Edge — Cyber Health Score Report

**Phase 6: Vehicle Cyber Health Score Engine**

## 1. Executive Summary

The Cyber Health Score Engine transforms raw anomaly detection outputs into an intuitive 0-100 cybersecurity health metric. Across 351,166 behavioral windows (W=50), the mean health score is **50.2**, with **17.6% Secure** and **9.3% Critical** windows.

## 2. Cyber Health Formula

```

CyberHealth = ThreatComponent + StabilityComponent + PressureComponent

             (0-40)            (0-30)               (0-30)

             Total range: 0-100

```


### Threat Component (40% weight)

Derived from the One-Class SVM anomaly score (decision_function value). When the anomaly score deviates significantly from the normal baseline (negative = anomalous), the threat component decreases proportionally. This is the strongest single signal and carries the highest weight.


### Behavioral Stability Component (30% weight)

Measures consistency of 3 key behavioral features against their normal baselines:
- **messages_per_second**: Message rate stability
- **can_id_entropy**: CAN identifier diversity
- **unique_can_ids_window**: Number of distinct CAN IDs
Uses two-sided z-score deviation (both high and low deviations reduce health).


### Attack Pressure Component (30% weight)

Measures pressure from 3 attack-sensitive features:
- **message_burst_score**: Sudden message flooding
- **frequency_spike_score**: Irregular timing patterns
- **payload_instability_score**: Unusual payload variation
Uses one-sided z-score (only positive deviation = more pressure = lower health).

## 3. Weighting Rationale

| Component | Weight | Rationale |
|-----------|--------|----------|
| Threat | 40% | Anomaly score is the most direct signal — the model has already learned normal vs attack patterns across all 13 features |
| Stability | 30% | Behavioral consistency is a leading indicator of cyber health degradation; changes in CAN diversity or message rate precede attacks |
| Pressure | 30% | Burst/spike/instability features are lagging indicators but highly specific to active attacks |

Weights are set so that a catastrophic failure of one component cannot drive the score below 30 (buffered by the other two).

## 4. Risk Categories

| Category | Range | Interpretation | Response |

|----------|-------|---------------|----------|

| **Secure** | 80-100 | Normal vehicle behavior; no signs of compromise | Continue monitoring |

| **Stable** | 60-80 | Minor deviations observed; likely benign | Monitor trend |

| **Warning** | 40-60 | Significant behavioral changes; potential early-stage attack | Investigate |

| **High Risk** | 20-40 | Strong attack indicators; active compromise likely | Activate countermeasures |

| **Critical** | 0-20 | Confirmed attack with high severity | Immediate isolation |


## 5. Score Distribution

| Statistic | Value |

|-----------|-------|

| Mean | 50.19 |

| Median | 45.47 |

| Std Dev | 24.96 |

| Min | 0.49 |

| Max | 99.41 |

| P25 | 32.00 |

| P75 | 70.24 |


| Category | Count | Percentage |

|----------|-------|-----------|

| Secure | 61,821 | 17.6% |

| Stable | 56,372 | 16.1% |

| Warning | 85,201 | 24.3% |

| High Risk | 115,059 | 32.8% |

| Critical | 32,713 | 9.3% |

## 6. Trend Examples

Using a 10-window lookback with 2.0-point threshold:

- **Normal region**: Trend = Degrading (diff=-2.68)

- **Attack region**: Trend = Stable (diff=-0.83)


Trend analysis enables proactive response before health crosses critical thresholds. A 'Degrading' trend over 10+ windows may indicate a stealth attack that hasn't yet triggered Warning-level alerts.

## 7. Forecast Examples

Using exponential smoothing (alpha=0.3) forecasting 20 windows ahead:

- **Normal region**: Forecast starts at 83.5, decays to 83.0 (mean-reverting)

- **Attack region**: Forecast starts at 61.9, recovers to 60.5 (mean-reverting)


The forecast uses simple exponential smoothing with decay to the global mean. It is designed for lightweight edge deployment — no GPU or heavy computation required.

## 8. Examples from Data

### Example A: Normal Window (Secure)

- Window 1: Score=81.8, T=40.0/40, S=22.6/30, P=19.2/30

### Example B: High-Risk Window (Under Attack)

- Window 14: Score=30.3, T=1.1/40, S=11.1/30, P=18.1/30

### Example C: Critical Window (Active Attack)

- Window 19817: Score=19.1, T=0.2/40, S=0.9/30, P=17.9/30

## 9. Operational Interpretation

- **Secure (80-100)**: Normal driving. No action required.

- **Stable (60-80)**: Minor behavioral variance (e.g., traffic bursts). Passive monitoring.

- **Warning (40-60)**: Moderate attack indicators. Secondary verification recommended.

- **High Risk (20-40)**: Strong indicators of active attack. Initiate response protocol.

- **Critical (0-20)**: confirmed cyber attack. Isolate affected ECUs, engage countermeasures.


## 10. Readiness for Explainable Threat Story Layer

The Cyber Health Score Engine produces structured, interpretable outputs ready for the Explainable Threat Story Layer:

- **Why this score?** Component breakdown (T/S/P) explains which behavioral dimensions drove the score

- **What changed?** Trend analysis (Improving/Stable/Degrading) provides direction of change

- **What's next?** Forecast predicts near-future health trajectory

- **Which features?** Each component traces to specific features (CAN diversity, burst, timing)

The Threat Story Layer can combine these outputs with natural language generation to produce human-readable explanations such as:

> "Cyber Health dropped from 85 to 32 over 50 windows. Degrading trend detected. Primary driver: Attack Pressure (burst score +300% above normal). Forecast: 28 in 10 windows if trend continues."


## 11. Output Files

| File | Description |

|------|-------------|

| `src/cyber_health/cyber_health_engine.py` | Engine implementation |

| `assets/cyber_health_timeline.png` | Health score timeline |

| `assets/cyber_health_distribution.png` | Score distribution |

| `assets/risk_category_distribution.png` | Risk category bar chart |

| `reports/cyber_health_report.md` | This report |

| `reports/phase6_summary.md` | Phase 6 summary |
