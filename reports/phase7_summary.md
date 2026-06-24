# AutoShield Edge — Phase 7 Summary

**Explainable Threat Story Engine**

## Overview

Built a multi-audience explanation engine that transforms anomaly detection and cyber health metrics into structured, human-readable cybersecurity narratives. The engine supports 5 severity levels, 5 attack scenarios, and produces both JSON (machine) and narrative (human) output formats.

## Story Statistics

| Attack Type | Health | Category | Trend | Forecast |

|-------------|--------|----------|-------|----------|

| Normal | 80.61 | Secure | Degrading | 83/100 |

| DoS | 50.51 | High Risk | Stable | 74/100 |

| Fuzzy | 48.93 | Critical | Degrading | 74/100 |

| Gear | 48.16 | High Risk | Improving | 66/100 |

| RPM | 47.31 | High Risk | Improving | 72/100 |

## Method

- Root-cause attribution via z-score healthiness ranking (7 tracked features)

- Component-level analysis (Threat/Stability/Pressure)

- Severity-aware templates with 5 risk categories

- Attack-specific context injection (DoS, Fuzzy, Gear, RPM)

- Dual output: structured JSON + human-readable narrative

## Key Capabilities

1. **Driver alerts**: One-line summaries (e.g., 'Cyber Health: 45/100 — Warning. CAN anomaly detected.')

2. **Root cause attribution**: Identifies the specific feature and component driving health degradation

3. **Trend context**: Improving/Stable/Degrading with magnitude

4. **Forecast awareness**: Projects health trajectory for proactive response

5. **Attack classification**: Maps patterns to known attack types with mitigations


## Readiness for Self-Healing Response Agent

Output format includes all fields needed for automated response: risk level, root cause (feature-level), recommended action, attack type, and forecast trajectory. The JSON schema is designed for direct integration with a rule-based or ML-based response agent.
