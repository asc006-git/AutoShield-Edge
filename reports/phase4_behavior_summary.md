# AutoShield Edge — Phase 4 Summary

**Behavioral Cyber Twin — Sliding-Window Feature Engineering**

## Overview
Designed and validated the Behavioral Cyber Twin concept: a digital representation of CAN bus behavior that transforms raw message streams into fixed-size behavioral windows with 13 statistical features.

## Key Results
- **3 window sizes evaluated**: W=10, 50, 100
- **W=50 selected** as optimal balance of sensitivity vs latency
- **13 features** across 5 behavioral categories
- **351,166 windows** generated from 17.5M CAN messages
- **Data reduction**: 50:1 (messages → windows)

## Feature Categories
| Category | Features | Behavioral Signal |
|---|---|---|
| Communication Rate | messages_per_second | Flooding detection |
| CAN Diversity | unique_can_ids, entropy | ID spoofing detection |
| Timing | delta_time mean/std/min/max | Timing irregularity |
| Payload | payload mean/std/entropy | Payload manipulation |
| Attack Pressure | burst, spike, instability | Coordinated attack detection |

## Output
- 5 parquet files in `data/behavioral/`
- Ready for Phase 5 model training
