# AutoShield Edge — Phase 6 Summary

**Vehicle Cyber Health Score Engine**

## Overview

Designed and implemented the Cyber Health Score Engine — a weighted multi-component scoring system that transforms raw anomaly detection outputs into an intuitive 0-100 vehicle cybersecurity health metric. The engine combines Threat (40%), Behavioral Stability (30%), and Attack Pressure (30%) components with exponential z-score decay for smooth, interpretable scoring.

## Key Results

| Metric | Value |

|--------|-------|

| Mean Health | 50.19 |

| Median Health | 45.47 |

| Windows Labeled Secure | 61,821 (17.6%) |

| Windows Labeled Critical | 32,713 (9.3%) |


## Risk Category Distribution

- **Secure**: 61,821 (17.6%)

- **Stable**: 56,372 (16.1%)

- **Warning**: 85,201 (24.3%)

- **High Risk**: 115,059 (32.8%)

- **Critical**: 32,713 (9.3%)


## Average Health by Attack Type

- **Normal**: mean=80.5, category=Secure

- **DoS**: mean=49.9, category=High Risk

- **Fuzzy**: mean=48.8, category=Critical

- **Gear**: mean=48.0, category=High Risk

- **RPM**: mean=47.2, category=High Risk


## Cyber Health Formula

```

CyberHealth = ThreatComponent(0-40) + StabilityComponent(0-30) + PressureComponent(0-30)

Each sub-component:  40/30 * exp(-max(0, z_score - tolerance) / decay_factor)

Risk categories: Secure(80-100), Stable(60-80), Warning(40-60), High Risk(20-40), Critical(0-20)

```

## Key Capabilities

1. **Component breakdown**: Each health score traces to Threat, Stability, and Pressure drivers

2. **Risk categorization**: 5-level taxonomy with color coding for intuitive triage

3. **Trend analysis**: Improving/Stable/Degrading with configurable lookback

4. **Lightweight forecast**: EMA-based prediction of next N windows (< 1ms computation)

5. **Edge-ready**: No GPU dependency; pure NumPy vectorized operations


## Readiness for Explainable Threat Story Layer

The engine outputs include all inputs needed for the next layer:

- Component scores (Threat/Stability/Pressure) for attribution

- Risk categories for severity assessment

- Trend direction for trajectory awareness

- Forecast values for proactive response

- Feature-level traceability to specific CAN behaviors
