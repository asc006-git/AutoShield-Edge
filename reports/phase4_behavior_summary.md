# AutoShield Edge - Phase 4 Summary
**Behavioral Cyber Twin Engine**

## Overview
Generated rolling-window behavioral features addressing Phase 3's key limitation: single-message features lack temporal context for attack pattern detection.

## Final Behavioral Feature List (13 + 2 labels)

| Category | Features | Count |
|----------|----------|-------|
| Communication Rate | `messages_per_second` | 1 |
| CAN Diversity | `unique_can_ids_window`, `can_id_entropy` | 2 |
| Timing Behavior | `window_delta_time_mean`, `_std`, `_min`, `_max` | 4 |
| Payload Behavior | `window_payload_mean`, `_std`, `_entropy_mean` | 3 |
| Attack Pressure | `message_burst_score`, `frequency_spike_score`, `payload_instability_score` | 3 |
| Labels | `Attack_Label`, `Attack_Type` | 2 |
| **Total** | | **15** |

## Window Size Recommendation

| Size | Windows Generated | Best For |
|------|-----------------|----------|
| **10** | 1,755,834 | Low-latency edge alerting |
| **50** | 351,166 | General detection (default) |
| **100** | 175,584 | Fleet analytics / baselines |

## Readiness for Next-Generation Anomaly Detection

1. **Expected baseline improvement**: Precision >0.80, Recall >0.75 (vs P3: F1=0.112)
2. **Window=50** recommended as primary input for Phase 5 model training
3. **Top expected features**: `unique_can_ids_window`, `can_id_entropy`, `message_burst_score`
4. **Data reduction**: ~350:1 compression (17.5M msgs -> ~350K windows at W=50)
5. **Recommended algorithms**: Isolation Forest, Autoencoder, XGBoost on window features
6. **Path to production**: Windowed features enable sub-100ms edge inference latency