# AutoShield Edge — Self-Healing Response Agent Report

**Phase 8: Autonomous Cyber Defense**

## 1. Executive Summary

The Self-Healing Response Agent implements a 5-level autonomous defense framework for vehicle CAN bus networks. It maps threat severity to response actions, selects attack-specific playbooks, and provides structured decisions with confidence scoring, expected outcomes, and recovery strategies.

- **Response levels**: 0 (Monitor) through 4 (Emergency Response)

- **Attack playbooks**: DoS, Fuzzy, Gear Spoofing, RPM Spoofing

- **Scenarios simulated**: 5

- **Mean confidence**: 0.617


## 2. Decision Logic

### Level Mapping

```

if risk_category == "Critical" and trend == "Degrading":   Level 4  (Emergency)

elif risk_category == "Critical":                          Level 3  (Mitigate)

elif risk_category == "High Risk" and trend == "Degrading": Level 3  (Mitigate)

elif risk_category == "High Risk":                         Level 2  (Contain)

elif risk_category == "Warning":                           Level 1  (Alert)

else:                                                      Level 0  (Monitor)

```

### Confidence Formula

```

Confidence = 0.3 * avg_feature_health_loss

           + 0.3 * (1 - health_score / 100)

           + 0.4 * severity_category_index

Range: 0.0 (low certainty) to 1.0 (high certainty)

```


## 3. Response Levels

| Level | Label | Trigger | Automation | Safety Impact |

|-------|-------|---------|------------|---------------|

| 0 | Monitor | Secure / Stable | Fully autonomous | None |

| 1 | Alert | Warning | Autonomous notification | None |

| 2 | Contain | High Risk | Automated | Minimal |

| 3 | Mitigate | Critical / High Risk+Degrading | Automated + notify | Moderate |

| 4 | Emergency | Critical+Degrading | Automated + escalate | HIGH |


## 4. Attack Playbooks


### Denial of Service (DoS)

- **Level 0**: Passive monitoring

- **Level 1**: Rate anomaly notification

- **Level 2**: Rate limiting activation, Suspected ECU monitoring

- **Level 3**: Suspected ECU isolation, Traffic filtering

- **Level 4**: Full CAN bus segmentation, Emergency fail-safe mode, SOC escalation


### Fuzzy Attack (Fuzzy)

- **Level 0**: CAN ID entropy monitoring

- **Level 1**: ID diversity alert

- **Level 2**: Invalid frame monitoring, Enhanced payload inspection

- **Level 3**: CAN ID whitelist enforcement, Invalid frame blocking

- **Level 4**: Full ID lockdown, Network segmentation, Emergency diagnostics


### Gear Spoofing (Gear)

- **Level 0**: Gear message monitoring

- **Level 1**: Gear anomaly notification

- **Level 2**: Sensor cross-validation, Plausibility check activation

- **Level 3**: Message plausibility filtering, Driver notification

- **Level 4**: Gear sensor isolation, Transmission protection mode, Service center alert


### RPM Spoofing (RPM)

- **Level 0**: RPM message monitoring

- **Level 1**: RPM anomaly notification

- **Level 2**: RPM sensor cross-validation, Engine behavior analysis

- **Level 3**: RPM plausibility filtering, Engine protection mode

- **Level 4**: RPM sensor isolation, Safe fallback logic, Mechanical integrity check


## 5. Example Responses


### NORMAL Scenario

- **Risk Category**: Secure

- **Health Score**: 80.6/100

- **Trend**: Degrading

- **Response Level**: 0 — Monitor

- **Confidence**: 0.1245

- **Actions**:

  - Monitor: Generic response — escalate to operator [target=network, auto=True]

- **Expected Outcome**: No anomalies — continued safe operation

- **Recovery Strategy**: Automatic — no recovery needed

- **Safety Notes**: No safety impact


### DOS Scenario

- **Risk Category**: High Risk

- **Health Score**: 22.3/100

- **Trend**: Stable

- **Response Level**: 2 — Contain

- **Confidence**: 0.7378

- **Actions**:

  - Rate limiting activation: Activate gateway rate limiter for suspected CAN IDs [target=CAN bus, auto=True]

  - Suspected ECU monitoring: Increase sampling rate on suspected ECU [target=ECU, auto=True]

  - Passive monitoring: Monitor CAN bus message rate and ID distribution [target=CAN bus, auto=True]

  - Rate anomaly notification: Alert fleet operator of abnormal CAN message rate [target=network, auto=True]

- **Expected Outcome**: Attack contained; further spread prevented

- **Recovery Strategy**: Semi-automatic — resume normal after N windows of stable health > 60

- **Safety Notes**: Minimal — actions are reversible


### FUZZY Scenario

- **Risk Category**: Critical

- **Health Score**: 13.4/100

- **Trend**: Degrading

- **Response Level**: 4 — Emergency Response

- **Confidence**: 0.9021

- **Actions**:

  - Full ID lockdown: Lock CAN bus to known-good ID set only [target=CAN bus, auto=True]

  - Network segmentation: Isolate affected CAN segment [target=CAN bus, auto=True]

  - Emergency diagnostics: Log all CAN traffic for forensic analysis [target=CAN bus, auto=True]

  - CAN ID entropy monitoring: Track CAN ID entropy and diversity metrics [target=CAN bus, auto=True]

  - ID diversity alert: Alert operator of abnormal CAN ID entropy [target=network, auto=True]

  - Invalid frame monitoring: Flag messages from unrecognized CAN IDs [target=CAN bus, auto=True]

  - Enhanced payload inspection: Deep packet inspection on flagged messages [target=CAN bus, auto=True]

  - CAN ID whitelist enforcement: Block all messages from non-whitelisted CAN IDs [target=CAN bus, auto=True]

  - Invalid frame blocking: Drop frames with invalid payload patterns [target=CAN bus, auto=True]

- **Expected Outcome**: Emergency response active; vehicle in safe state

- **Recovery Strategy**: Full system reset — service center inspection required

- **Safety Notes**: HIGH — vehicle may enter limp-home mode


### GEAR Scenario

- **Risk Category**: High Risk

- **Health Score**: 33.3/100

- **Trend**: Improving

- **Response Level**: 2 — Contain

- **Confidence**: 0.6576

- **Actions**:

  - Sensor cross-validation: Cross-check gear position against wheel speed and RPM [target=ECU, auto=True]

  - Plausibility check activation: Validate gear transitions against vehicle dynamics model [target=ECU, auto=True]

  - Gear message monitoring: Monitor gear position message rate and values [target=CAN bus, auto=True]

  - Gear anomaly notification: Alert operator of inconsistent gear messages [target=network, auto=True]

- **Expected Outcome**: Attack contained; further spread prevented

- **Recovery Strategy**: Semi-automatic — resume normal after N windows of stable health > 60

- **Safety Notes**: Minimal — actions are reversible


### RPM Scenario

- **Risk Category**: High Risk

- **Health Score**: 32.5/100

- **Trend**: Improving

- **Response Level**: 2 — Contain

- **Confidence**: 0.6637

- **Actions**:

  - RPM sensor cross-validation: Cross-check RPM against wheel speed and engine acoustics [target=ECU, auto=True]

  - Engine behavior analysis: Analyze RPM patterns for spoofing signatures [target=ECU, auto=True]

  - RPM message monitoring: Monitor engine RPM message rate and values [target=CAN bus, auto=True]

  - RPM anomaly notification: Alert operator of abnormal RPM readings [target=network, auto=True]

- **Expected Outcome**: Attack contained; further spread prevented

- **Recovery Strategy**: Semi-automatic — resume normal after N windows of stable health > 60

- **Safety Notes**: Minimal — actions are reversible


## 6. Recovery Strategies

| Level | Recovery Approach | Autonomy |

|-------|-------------------|----------|

| 0 | No recovery needed | Automatic |

| 1 | Resolve on trend improvement | Automatic |

| 2 | Resume after N stable windows | Semi-automatic |

| 3 | Operator verification required | Manual review |

| 4 | Service center inspection | Full system reset |


## 7. Safety Considerations

- **Level 0-1**: No safety impact — passive monitoring only

- **Level 2**: All actions reversible — minimal operational impact

- **Level 3**: Degraded vehicle functionality — driver must be notified

- **Level 4**: Limp-home mode — vehicle safe but limited operation

- **Mechanical safety**: Gear/RPM attacks require transmission/engine protection

- **Fail-safe**: All actions have defined rollback procedures


## 8. Readiness for Dashboard Integration

The agent produces structured ResponseDecision objects suitable for dashboard display:


- **Summary card**: Response level badge + health score + confidence gauge

- **Action timeline**: Ordered list of deployed countermeasures

- **Playbook viewer**: Attack-specific action tree with status

- **History log**: Chronological list of all decisions with outcomes

- **Recovery tracker**: Shows current recovery phase and ETA

- **Safety indicator**: Flags actions with mechanical safety implications


## 9. Output Files

| File | Description |

|------|-------------|

| `src/response_agent/self_healing_agent.py` | Agent implementation |

| `reports/response_history.json` | Decision history (5 scenarios) |

| `reports/self_healing_report.md` | This report |

| `reports/phase8_summary.md` | Phase 8 summary |
