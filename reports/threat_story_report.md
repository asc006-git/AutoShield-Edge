# AutoShield Edge — Explainable Threat Story Report

**Phase 7: Threat Story Engine — Structured Cybersecurity Narratives**

## 1. Executive Summary

The Threat Story Engine transforms raw multi-dimensional anomaly detection and cyber health outputs into structured, human-readable cybersecurity narratives. It serves three audience tiers — drivers (simple alerts), fleet managers (root cause + trend), and vehicle engineers (feature-level attribution). Output includes JSON for machine consumption and natural-language narratives for human operators.

## 2. Explanation Methodology

The engine follows a 6-stage pipeline:


1. **Input Collection** — Gather feature values, anomaly scores, health scores, components, trend, and forecast for the target window.

2. **Root-Cause Attribution** — Compute per-feature z-scores relative to normal baselines. Rank features by healthiness degradation (1 - healthiness). Identify weakest component (Threat/Stability/Pressure) and weakest feature within it.

3. **Template Selection** — Choose severity-aware template based on risk category (Secure/Stable/Warning/High Risk/Critical).

4. **Attack Context** — Inject attack-type-specific signatures and mitigations when the window corresponds to a known attack type.

5. **Narrative Assembly** — Fill template with computed values: health score, trend, z-scores, feature labels, forecast, and recommended response.

6. **Output Formatting** — Produce both structured JSON and human-readable narrative string.


## 3. Attribution Logic

### Component-Level

- **Threat** (40% weight): Single feature — anomaly_score (OCSVM decision function). Penalized when value falls below normal mean (direction='negative').

- **Stability** (30% weight): Average of 3 sub-healthiness scores — messages_per_second, can_id_entropy, unique_can_ids_window. Penalized for any deviation from normal (direction='both').

- **Pressure** (30% weight): Average of 3 sub-healthiness scores — message_burst_score, frequency_spike_score, payload_instability_score. Penalized only for elevated values (direction='positive').


### Feature-Level

For each of the 7 tracked features, the engine computes:

- **z-score**: (value - mean_normal) / std_normal

- **healthiness**: exp(-max(0, |z| - tolerance) / decay)

- **contribution**: 1 - healthiness (0 = healthy, 1 = fully degraded)

Features are ranked by contribution; the top feature is the primary driver.


### Healthiness Parameters

| Parameter | Value | Purpose |

|-----------|-------|---------|

| decay_factor | 1.5 | Controls penalty steepness for z-score deviations |

| tolerance | 0.2 | Small z-scores (< 0.2 sigma) ignored as noise |


## 4. Narrative Templates

Five severity-aware templates exist, one per risk category:


### Secure

- **Threat Summary**: Vehicle cybersecurity status is Secure. No anomalous activity detected.

- **Root Cause**: No significant deviations detected. All features within expected operating ranges.

- **Response**: No action required. Continue passive monitoring.

### Stable

- **Threat Summary**: Vehicle cybersecurity status is Stable. Minor behavioral variance detected, consistent with normal driving conditions.

- **Root Cause**: Slight deviation in {primary_feature} ({primary_z:+.1f} sigma from baseline). No immediate threat indicators present.

- **Response**: Monitor trend over the next 20 windows. No intervention required at this time.

### Warning

- **Threat Summary**: Vehicle cybersecurity status is Warning. Moderate behavioral anomalies detected that deviate from normal operating patterns.

- **Root Cause**: Primary driver: {primary_component} — {primary_feature} is {primary_z:+.1f} sigma from normal baseline. Secondary contributor: {secondary_component}.

- **Response**: Investigate root cause. Cross-reference with vehicle diagnostics. Prepare countermeasure playbook if trend degrades further.

### High Risk

- **Threat Summary**: HIGH RISK: Strong indicators of active cyber attack detected. Vehicle cybersecurity is compromised — immediate attention required.

- **Root Cause**: Attack signature detected. Primary driver: {primary_component} — {primary_feature} at {primary_z:+.1f} sigma from normal ({primary_direction}). Secondary feature: {secondary_feature} at {secondary_z:+.1f} sigma.

- **Response**: ACTIVATE COUNTERMEASURES: Isolate suspected ECUs. Enable rate-limiting on CAN bus. Alert fleet operator. Log forensic data for post-incident analysis.

### Critical

- **Threat Summary**: CRITICAL: Confirmed cyber attack in progress. Vehicle cybersecurity health is at a dangerous level.

- **Root Cause**: Confirmed attack pattern. Primary driver: {primary_component} — {primary_feature} at {primary_z:+.1f} sigma from normal ({primary_direction}). Multiple features outside safe bounds: {feature_list}.

- **Response**: EMERGENCY RESPONSE: Isolate vehicle from network. Engage fail-safe mode on all ECUs. Initiate forensic data capture. Alert security operations center.


## 5. Root Cause Examples


### NORMAL Attack

- **Primary component**: Stability

- **Component breakdown**: {'Threat': 0.8699, 'Stability': 0.5272, 'Pressure': 1.0}

- **Primary feature**: CAN identifier entropy (z=-1.42, below normal)

- **Root cause text**: No significant deviations detected. All features within expected operating ranges.


### DOS Attack

- **Primary component**: Threat

- **Component breakdown**: {'Threat': 0.0006, 'Stability': 0.0618, 'Pressure': 0.6799}

- **Primary feature**: overall anomaly signal (z=-11.27, below normal)

- **Root cause text**: Attack signature detected. Primary driver: Threat — overall anomaly signal at -11.3 sigma from normal (below normal). Secondary feature: overall anomaly signal at -11.3 sigma.


### FUZZY Attack

- **Primary component**: Threat

- **Component breakdown**: {'Threat': 0.0006, 'Stability': 0.2675, 'Pressure': 0.1801}

- **Primary feature**: overall anomaly signal (z=-11.27, below normal)

- **Root cause text**: Confirmed attack pattern. Primary driver: Threat — overall anomaly signal at -11.3 sigma from normal (below normal). Multiple features outside safe bounds: CAN ID diversity, CAN identifier entropy, message burst activity, timing irregularity, payload variation.


### GEAR Attack

- **Primary component**: Threat

- **Component breakdown**: {'Threat': 0.0011, 'Stability': 0.108, 'Pressure': 1.0}

- **Primary feature**: overall anomaly signal (z=-10.39, below normal)

- **Root cause text**: Attack signature detected. Primary driver: Threat — overall anomaly signal at -10.4 sigma from normal (below normal). Secondary feature: overall anomaly signal at -10.4 sigma.


### RPM Attack

- **Primary component**: Threat

- **Component breakdown**: {'Threat': 0.0015, 'Stability': 0.0855, 'Pressure': 0.9943}

- **Primary feature**: overall anomaly signal (z=-9.94, below normal)

- **Root cause text**: Attack signature detected. Primary driver: Threat — overall anomaly signal at -9.9 sigma from normal (below normal). Secondary feature: overall anomaly signal at -9.9 sigma.


## 6. Narrative Examples


### NORMAL Vehicle

> Vehicle cybersecurity status is Secure. No anomalous activity detected. Cyber Health is 81/100 and degrading over the last 10 windows. All monitoring dimensions show normal behavior.


### DOS Vehicle

> HIGH RISK: Strong indicators of active cyber attack detected. Vehicle cybersecurity is compromised — immediate attention required. Cyber Health dropped to 22/100 and is stable over the last 10 windows. Primary concern: Threat component (0% of normal). Pattern matches Denial of Service attack: elevated message rate with reduced CAN ID diversity. Impact: bandwidth exhaustion, ECU denial of service. Root cause: Attack signature detected. Primary driver: Threat — overall anomaly signal at -11.3 sigma from normal (below normal). Secondary feature: overall anomaly signal at -11.3 sigma. Critical escalation risk. Health projected at 66/100 in 20 windows — may cross into Critical range. Recommended: ACTIVATE COUNTERMEASURES: Isolate suspected ECUs. Enable rate-limiting on CAN bus. Alert fleet operator. Log forensic data for post-incident analysis.


### FUZZY Vehicle

> CRITICAL: Confirmed cyber attack in progress. Vehicle cybersecurity health is at a dangerous level. Cyber Health is 13/100 — Critical level. Health has degrading by 3 points over the last 10 windows. Pattern matches Fuzzy attack: abnormal CAN ID diversity and entropy. Impact: unpredictable ECU behavior, potential system crash. Root cause: Confirmed attack pattern. Primary driver: Threat — overall anomaly signal at -11.3 sigma from normal (below normal). Multiple features outside safe bounds: CAN ID diversity, CAN identifier entropy, message burst activity, timing irregularity, payload variation. Health projected to remain at 65/100 or lower. Immediate intervention required to prevent system compromise. Recommended: EMERGENCY RESPONSE: Isolate vehicle from network. Engage fail-safe mode on all ECUs. Initiate forensic data capture. Alert security operations center.


### GEAR Vehicle

> HIGH RISK: Strong indicators of active cyber attack detected. Vehicle cybersecurity is compromised — immediate attention required. Cyber Health dropped to 33/100 and is improving over the last 10 windows. Primary concern: Threat component (0% of normal). Pattern matches Gear Spoofing attack: timing irregularity with payload manipulation. Impact: erratic transmission behavior, safety risk. Root cause: Attack signature detected. Primary driver: Threat — overall anomaly signal at -10.4 sigma from normal (below normal). Secondary feature: overall anomaly signal at -10.4 sigma. Critical escalation risk. Health projected at 60/100 in 20 windows — may cross into Critical range. Recommended: ACTIVATE COUNTERMEASURES: Isolate suspected ECUs. Enable rate-limiting on CAN bus. Alert fleet operator. Log forensic data for post-incident analysis.


### RPM Vehicle

> HIGH RISK: Strong indicators of active cyber attack detected. Vehicle cybersecurity is compromised — immediate attention required. Cyber Health dropped to 32/100 and is improving over the last 10 windows. Primary concern: Threat component (0% of normal). Pattern matches RPM Spoofing attack: timing irregularity with payload manipulation. Impact: erratic engine control, safety risk. Root cause: Attack signature detected. Primary driver: Threat — overall anomaly signal at -9.9 sigma from normal (below normal). Secondary feature: overall anomaly signal at -9.9 sigma. Critical escalation risk. Health projected at 63/100 in 20 windows — may cross into Critical range. Recommended: ACTIVATE COUNTERMEASURES: Isolate suspected ECUs. Enable rate-limiting on CAN bus. Alert fleet operator. Log forensic data for post-incident analysis.


## 7. Risk Communication Strategy

| Category | Audience | Channel | Urgency |

|----------|----------|---------|---------|

| Secure | Driver | Dashboard indicator (green) | None |

| Stable | Driver, Fleet Manager | Dashboard + log entry | Low |

| Warning | Fleet Manager | Notification + report | Medium |

| High Risk | Fleet Manager + Engineer | Alert + detailed report | High |

| Critical | All + SOC | Emergency alert | Immediate |


## 8. Readiness for Self-Healing Response Agent

The Threat Story Engine produces the following outputs required by a Self-Healing Response Agent:


- **Structured JSON**: Machine-readable with feature-level attributions

- **Risk category**: Determines response severity

- **Root cause analysis**: Identifies which behavioral dimension failed

- **Forecast**: Predicts near-future health trajectory

- **Recommended response**: Suggested countermeasure for each scenario

- **Attack context**: Attack type, signature, and mitigation strategy


A Self-Healing Agent can use this output to: (1) identify the compromised ECU via CAN ID analysis, (2) select the appropriate countermeasure (rate limiting, ID filtering, plausibility check), (3) execute the response, and (4) monitor recovery via the forecast vs actual health trajectory.


## 9. Output Files

| File | Description |

|------|-------------|

| `src/threat_explanation/threat_story_engine.py` | Engine implementation |

| `reports/threat_stories.json` | Example stories in JSON |

| `reports/threat_story_report.md` | This report |

| `reports/phase7_summary.md` | Phase 7 summary |
