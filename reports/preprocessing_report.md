# AutoShield Edge - Preprocessing Report
**Phase 2: Data Preparation & Feature Engineering**

## 1. Pipeline Overview

The preprocessing pipeline processes all 5 CAN bus datasets through a unified, memory-efficient pipeline using chunked reading (100,000 rows per chunk). Each dataset is processed independently, then combined into a single parquet file.

### Pipeline Steps

1. **Schema Normalization** - Unify CSV (12 cols) and TXT (12 cols) into 11 shared columns, dropping `Flag` and `Unknown`
2. **Hex to Integer** - Convert `CAN_ID` (hex) and `D0`-`D7` (hex) to integer values
3. **Missing Value Handling** - Apply `-1` sentinel for bytes beyond DLC length
4. **Label Creation** - Binary (`Attack_Label`) and multi-class (`Attack_Type`) labels
5. **Payload Statistics** - `payload_mean`, `payload_std`, `payload_min`, `payload_max`
6. **Byte Entropy** - `payload_entropy` (Shannon entropy of 8-byte payload)
7. **Message Timing** - `delta_time` (inter-message arrival time)
8. **Parquet Output** - Snappy-compressed columnar storage

## 2. Dataset Processing Summary

| Dataset | Input Rows | Output Rows | Attack Type | Memory (parquet) |
|---------|-----------|-------------|-------------|------------------|
| normal_run_data.txt       |   988,871 |   988,871 | Normal     | 20.4 MB |
| DoS_dataset.csv           | 3,665,771 | 3,665,771 | DoS        | 62.4 MB |
| fuzzy_dataset.csv         | 3,838,860 | 3,838,860 | Fuzzy      | 80.0 MB |
| gear_dataset.csv          | 4,443,142 | 4,443,142 | Gear       | 79.5 MB |
| rpm_dataset.csv           | 4,621,702 | 4,621,702 | RPM        | 79.1 MB |
| combined.parquet          |         - | 17,558,346 | All        | 321.4 MB |

**Total input rows**: 17,558,346
**Total output rows**: 17,558,346
**Total parquet size**: 321.4 MB (per-dataset) + 321.4 MB (combined)

## 3. Memory Usage

- **Chunk size**: 100,000 rows
- **Estimated peak memory per chunk**: ~15-25 MB (raw + intermediate DataFrames)
- **Processing strategy**: Sequential dataset processing, never >1 dataset in memory
- **Output format**: Snappy-compressed Parquet (columnar, splittable)

## 4. Missing Value Handling

### Approach

Missing payload bytes are handled using the `DLC` (Data Length Code) field:

- If `DLC = N`, bytes `D0` through `D(N-1)` are valid
- Bytes `D(N)` through `D7` are set to **-1** (sentinel)
- The sentinel -1 is chosen because CAN data bytes are `uint8` (0-255), making -1 unambiguously missing

### Missing Value Statistics

| Dataset | DLC=2 Rows | Bytes Affected | Replacement |
|---------|-----------|----------------|-------------|
| Normal     |     10,129 | D2-D7 (6 bytes) | -1 |
| DoS        |     31,188 | D2-D7 (6 bytes) | -1 |
| Fuzzy      |     34,382 | D2-D7 (6 bytes) | -1 |
| Gear       |     40,165 | D2-D7 (6 bytes) | -1 |
| RPM        |     41,476 | D2-D7 (6 bytes) | -1 |

## 5. Schema Transformation Summary

| Step | Input Schema | Output Schema | Transformation |
|------|-------------|--------------|----------------|
| Raw CSV | `Timestamp, CAN_ID, DLC, D0-D7, Flag` (12 cols) | - | Hex strings, object dtype |
| Raw TXT | `Timestamp, CAN_ID, Unknown, DLC, D0-D7` (12 cols) | - | Key-value labeled format |
| Normalize | - | `Timestamp, CAN_ID, DLC, D0-D7` (11 cols) | Drop Flag/Unknown |
| Convert | - | `CAN_ID` int32, `D0-D7` int16 | Hex string to int |
| Handle Missing | - | `D0-D7` with -1 sentinel | DLC-based masking |
| Label | - | `Attack_Label` int8, `Attack_Type` str | File-level assignment |
| Feature Eng | - | +5 engineered features | Payload stats, entropy, timing |
| Final | - | **19 columns** | Ready for ML |

## 6. Sample Processed Records

```
      Timestamp  CAN_ID  DLC  D0  D1   D2   D3   D4  D5  D6   D7  payload_mean  payload_std  payload_min  payload_max  payload_entropy  delta_time  Attack_Label Attack_Type
0  1.479121e+09     848    8   5  40  132  102  109   0   0  162         68.75    60.997438            0          162         2.750000    0.000000             0      Normal
1  1.479121e+09     704    8  20   0    0    0    0   0   0    0          2.50     6.614378            0           20         0.543564    0.000221             0      Normal
2  1.479121e+09    1072    8   0   0    0    0    0   0   0    0          0.00     0.000000            0            0         0.000000    0.000554             0      Normal
```

## 7. Quality Checks

- No missing values remain in the output (all NaN handled)
- CAN_ID is integer type in range [0, 4095]
- D0-D7 are int16 in range [-1, 255]
- Attack_Label is binary (0 or 1)
- All 5 attack types represented in Attack_Type
- delta_time has no negative values (monotonic timestamps)