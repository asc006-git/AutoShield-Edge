# AutoShield Edge - Behavioral Feature Report
**Phase 4: Behavioral Cyber Twin Engine**

## 1. Feature Catalogue

| # | Feature | Category | Formula | Cybersecurity Relevance |
|---|---------|----------|---------|------------------------|
| 1 | `messages_per_second` | Comm. Rate | ws / (last_ts - first_ts) | DoS floods increase rate dramatically |
| 2 | `unique_can_ids_window` | CAN Diversity | nunique(CAN_ID) | Fuzzy attacks use 1,664+ IDs vs ~27 normal |
| 3 | `can_id_entropy` | CAN Diversity | -sum(p*log2(p)) | Randomized IDs increase entropy; normal traffic has low structured entropy |
| 4 | `window_delta_time_mean` | Timing | mean(delta_time>0) | DoS decreases mean inter-message gap |
| 5 | `window_delta_time_std` | Timing | std(delta_time>0) | Attack-induced timing irregularity increases std |
| 6 | `window_delta_time_min` | Timing | min(delta_time>0) | DoS flooding produces extremely small gaps |
| 7 | `window_delta_time_max` | Timing | max(delta_time>0) | Some attacks create pauses that increase max gap |
| 8 | `window_payload_mean` | Payload | mean(payload_mean) | Injected attack bytes shift average payload value |
| 9 | `window_payload_std` | Payload | std(payload_mean) | Attack mixing increases payload value diversity |
| 10 | `window_payload_entropy_mean` | Payload | mean(payload_entropy) | Random attack bytes increase per-message entropy |
| 11 | `message_burst_score` | Attack Pressure | std(dt)/mean(dt) | CV of gaps > 1.0 indicates bursty injection traffic |
| 12 | `frequency_spike_score` | Attack Pressure | max(dt)/min(dt) | Extreme ratios (>100) signal irregular attack patterns |
| 13 | `payload_instability_score` | Attack Pressure | std(payload_mean) | High instability indicates payload injection variance |

## 2. Window Size Comparison

| Size | Total Windows | Time | Resolution | Noise Robustness |
|------|--------------|------|------------|------------------|
| 10 | 1,755,834 | 1588.7s | Very High | Low (noisy) |
| 50 | 351,166 | 338.8s | High | Medium |
| 100 | 175,584 | 248.1s | Moderate | High (stable) |

**Recommendation**: Window=50 as default (best balance). Window=10 for low-latency edge alerting. Window=100 for fleet analytics.

## 3. Expected Feature Importance

| Rank | Feature | Importance | Affected Attacks |
|------|---------|------------|-----------------|
| 1 | `unique_can_ids_window` | Very High | Fuzzy |
| 2 | `can_id_entropy` | Very High | Fuzzy |
| 3 | `message_burst_score` | High | DoS |
| 4 | `frequency_spike_score` | High | DoS, Fuzzy |
| 5 | `messages_per_second` | High | DoS |
| 6 | `window_delta_time_std` | Med-High | All attacks |
| 7 | `payload_instability_score` | Medium | Fuzzy, Gear, RPM |
| 8 | `window_payload_entropy_mean` | Medium | Fuzzy |
| 9 | `window_delta_time_mean` | Medium | DoS |
| 10 | `window_delta_time_min` | Low-Med | DoS |
| 11 | `window_payload_mean` | Low-Med | Spoofing |
| 12 | `window_payload_std` | Low | Marginal |
| 13 | `window_delta_time_max` | Low | Redundant |

## 4. Comparison with Single-Message Features

| Aspect | Single-Message (P3) | Behavioral Windows (P4) |
|--------|--------------------|------------------------|
| Temporal context | None | 10-100 message window |
| Attack signal | Weak | Strong - patterns over sequences |
| Noise robustness | Low | High - aggregation smooths outliers |
| CAN ID signal | One ID per msg | Distribution over window |
| Timing signal | Single delta | Statistical moments |
| Burst detection | Impossible | Explicit scoring |
| Data volume | 17.5M rows | ~350K-1.75M windows |
