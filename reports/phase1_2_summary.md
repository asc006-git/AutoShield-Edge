# AutoShield Edge — Phase 1-2 Summary

**Data Acquisition, Exploration, and Preprocessing**

## Overview
Completed EDA of 17.5M CAN messages across 5 attack scenarios. Designed and implemented the behavioral windowing pipeline (W=50) with 19 per-message features reduced to 13 window-level features.

## Key Results
- **17,558,346 CAN messages** processed
- **5 attack scenarios**: DoS, Fuzzy, Gear, RPM, Normal
- **7 primary ECUs** identified from CAN ID analysis
- **50:1 data reduction** via behavioral windowing
- **351,166 behavioral windows** generated (W=50)
- **13 features** across 5 behavioral categories

## Outputs
| File | Description |
|---|---|
| `data/behavioral/*_w50.parquet` | 5 behavioral window parquet files |
| `reports/dataset_analysis_report.md` | Full dataset analysis |
| `reports/preprocessing_report.md` | Preprocessing pipeline documentation |
