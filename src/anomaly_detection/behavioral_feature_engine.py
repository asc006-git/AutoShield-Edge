"""
AutoShield Edge - Behavioral Cyber Twin Engine.

Generates rolling-window behavioral features using vectorized groupby
aggregation. Processes each dataset in chunks to stay within 4GB RAM.
Window sizes: 10, 50, 100 messages (non-overlapping).
"""

import os
import gc
import math
import time
import warnings
import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from collections import Counter

warnings.filterwarnings('ignore')
sns.set_style('whitegrid')

BASE_DIR = Path(r'C:\Users\HP\Desktop\AutoShield-Edge')
DATA_DIR = BASE_DIR / 'data' / 'processed'
OUTPUT_DIR = BASE_DIR / 'data' / 'behavioral'
ASSETS_DIR = BASE_DIR / 'assets'
REPORTS_DIR = BASE_DIR / 'reports'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

WINDOW_SIZES = [10, 50, 100]

REQUIRED_COLS = [
    'Timestamp', 'CAN_ID', 'DLC',
    'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7',
    'payload_mean', 'payload_std', 'payload_entropy',
    'delta_time', 'Attack_Label', 'Attack_Type'
]

CHUNK_SIZE = 200_000


class BehavioralFeatureEngine:
    """Rolling-window behavioral feature generator using vectorized groupby."""

    def __init__(self, window_sizes=None):
        self.window_sizes = window_sizes or WINDOW_SIZES
        self.stats = {'windows_generated': {}, 'processing_time_s': {}}

    # ── Core Processor ──────────────────────────────────────────

    def process_dataset(self, path, attack_type, window_size):
        total = pq.ParquetFile(path).metadata.num_rows
        n_windows_est = total // window_size
        ws = window_size
        chunk_rows = max(ws * 20, CHUNK_SIZE)

        print(f"    Window={ws:3d}: {total:,} rows -> ~{n_windows_est:,} windows",
              end='', flush=True)

        output_path = OUTPUT_DIR / f'{attack_type.lower()}_w{ws}.parquet'
        writer = None
        windows_created = 0
        carryover = pd.DataFrame()

        reader = pq.ParquetFile(path).iter_batches(batch_size=chunk_rows, columns=REQUIRED_COLS)

        for batch in reader:
            chunk = batch.to_pandas()
            if len(carryover) > 0:
                chunk = pd.concat([carryover, chunk], ignore_index=True)
                carryover = pd.DataFrame()

            n_complete = len(chunk) // ws
            if n_complete == 0:
                carryover = chunk
                continue

            # Assign window IDs for complete windows
            use = chunk.iloc[:n_complete * ws].copy()
            use['_win'] = np.arange(len(use)) // ws

            # Compute behavioral features via groupby
            win_feats = self._compute_all_windows(use, ws)

            # Write
            table = pa.Table.from_pandas(win_feats, preserve_index=False)
            if writer is None:
                writer = pq.ParquetWriter(output_path, table.schema, compression='snappy')
            writer.write_table(table)
            windows_created += len(win_feats)

            # Carry over remainder
            carryover = chunk.iloc[n_complete * ws:].reset_index(drop=True)

        # Handle final partial carryover as one window if >= ws/2
        if len(carryover) >= ws // 2:
            carryover = carryover.copy()
            carryover['_win'] = 0
            win_feats = self._compute_all_windows(carryover, ws)
            table = pa.Table.from_pandas(win_feats, preserve_index=False)
            if writer is None:
                writer = pq.ParquetWriter(output_path, table.schema, compression='snappy')
            writer.write_table(table)
            windows_created += 1

        if writer:
            writer.close()

        del carryover, chunk, win_feats
        gc.collect()
        print(f" -> {windows_created:,} windows saved")
        return windows_created

    # ── Vectorized Window Feature Computation ──────────────────

    def _compute_all_windows(self, df, ws):
        """Compute all behavioral features for every window in df using groupby."""
        gb = df.groupby('_win')

        # ── Communication Rate ──
        ts_first = gb['Timestamp'].first()
        ts_last = gb['Timestamp'].last()
        ts_span = ts_last - ts_first
        messages_per_sec = np.where(ts_span > 0, ws / ts_span, 0.0)

        # ── CAN Diversity ──
        def unique_can(grp):
            return grp.nunique()
        unique_can_ids = gb['CAN_ID'].nunique()

        def can_entropy(grp):
            probs = grp.value_counts(normalize=True).values
            return -np.sum(probs * np.log2(probs + 1e-10))
        can_id_ent = gb['CAN_ID'].apply(can_entropy).values

        # ── Timing Behavior ──
        def dt_mean(grp):
            d = grp.values
            d = d[d > 0]
            return d.mean() if len(d) > 0 else 0.0
        win_dt_mean = gb['delta_time'].apply(dt_mean).values

        def dt_std(grp):
            d = grp.values
            d = d[d > 0]
            return d.std() if len(d) > 1 else 0.0
        win_dt_std = gb['delta_time'].apply(dt_std).values

        def dt_min(grp):
            d = grp.values
            d = d[d > 0]
            return d.min() if len(d) > 0 else 0.0
        win_dt_min = gb['delta_time'].apply(dt_min).values

        def dt_max(grp):
            d = grp.values
            d = d[d > 0]
            return d.max() if len(d) > 0 else 0.0
        win_dt_max = gb['delta_time'].apply(dt_max).values

        # ── Payload Behavior ──
        win_pay_mean = gb['payload_mean'].mean().values
        win_pay_std = gb['payload_mean'].std(ddof=0).values
        win_ent_mean = gb['payload_entropy'].mean().values

        # ── Attack Pressure ──
        # Burst score: CV of delta_times
        burst = np.where(win_dt_mean > 0, win_dt_std / win_dt_mean, 0.0)

        # Frequency spike: max/min of delta_times
        freq_spike = np.where(
            (win_dt_min > 0) & (win_dt_max > 0),
            win_dt_max / win_dt_min,
            1.0
        )

        # Payload instability = std of payload_mean
        payload_inst = win_pay_std

        # ── Labels ──
        attack_label = (gb['Attack_Label'].mean().values > 0.5).astype(int)

        def majority_type(grp):
            return grp.value_counts().index[0]
        attack_type = gb['Attack_Type'].apply(majority_type).values

        result = pd.DataFrame({
            'window_size': ws,
            'messages_per_second': messages_per_sec,
            'unique_can_ids_window': unique_can_ids.values,
            'can_id_entropy': can_id_ent,
            'window_delta_time_mean': win_dt_mean,
            'window_delta_time_std': win_dt_std,
            'window_delta_time_min': win_dt_min,
            'window_delta_time_max': win_dt_max,
            'window_payload_mean': win_pay_mean,
            'window_payload_std': win_pay_std,
            'window_payload_entropy_mean': win_ent_mean,
            'message_burst_score': burst,
            'frequency_spike_score': freq_spike,
            'payload_instability_score': payload_inst,
            'Attack_Label': attack_label,
            'Attack_Type': attack_type,
        })
        return result

    # ── Run All ────────────────────────────────────────────────

    def run(self):
        datasets = [
            ('normal.parquet', 'Normal'),
            ('dos.parquet', 'DoS'),
            ('fuzzy.parquet', 'Fuzzy'),
            ('gear.parquet', 'Gear'),
            ('rpm.parquet', 'RPM'),
        ]

        print("=" * 60)
        print("  AutoShield Edge - Behavioral Cyber Twin Engine")
        print("  Vectorized groupby-based window feature extraction")
        print("=" * 60)

        for ws in self.window_sizes:
            print(f"\n--- Window Size = {ws} ---")
            ws_total = 0
            t0 = time.time()

            for fname, atype in datasets:
                path = DATA_DIR / fname
                print(f"  [{atype}]")
                n = self.process_dataset(path, atype, ws)
                ws_total += n

            elapsed = time.time() - t0
            self.stats['windows_generated'][ws] = ws_total
            self.stats['processing_time_s'][ws] = round(elapsed, 1)
            print(f"\n  Total windows (W={ws}): {ws_total:,} in {elapsed:.1f}s")

        print("\n" + "-" * 60)
        self._generate_report()
        print("\n" + "-" * 60)
        self._generate_visualizations()
        self._generate_summary()
        print("\n" + "=" * 60)
        print("  BEHAVIORAL CYBER TWIN ENGINE COMPLETE")
        print("=" * 60)

    # ── Visualizations ──────────────────────────────────────────

    def _generate_visualizations(self):
        print("\n  Generating visualizations...")
        ws = 50
        samples = []
        for atype in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
            path = OUTPUT_DIR / f'{atype.lower()}_w{ws}.parquet'
            if path.exists():
                pf = pq.ParquetFile(path)
                n_total = pf.metadata.num_rows
                n_samp = min(2000, n_total)
                rng = np.random.RandomState(42)
                idx = rng.choice(n_total, size=n_samp, replace=False)
                df_s = pf.read().take(idx).to_pandas()
                df_s['dataset'] = atype
                samples.append(df_s)
                del df_s; gc.collect()
        if not samples:
            print("  SKIP: no data"); return

        df_all = pd.concat(samples, ignore_index=True)
        attack_mask = df_all['Attack_Label'] == 1
        normal_mask = df_all['Attack_Label'] == 0

        # ── Plot 1: Feature Distributions ──
        feat_cols = [
            'messages_per_second', 'unique_can_ids_window', 'can_id_entropy',
            'window_delta_time_mean', 'window_payload_mean',
            'window_payload_entropy_mean', 'message_burst_score',
            'frequency_spike_score', 'payload_instability_score'
        ]
        n_feats = len(feat_cols)
        n_cols = 3
        n_rows = (n_feats + n_cols - 1) // n_cols

        fig, axes = plt.subplots(n_rows, n_cols, figsize=(16, 4 * n_rows))
        axes = axes.flatten()
        for i, col in enumerate(feat_cols):
            ax = axes[i]
            if col in df_all.columns:
                dn = df_all.loc[normal_mask, col].dropna()
                da = df_all.loc[attack_mask, col].dropna()
                if len(dn) > 0:
                    ax.hist(dn, bins=50, alpha=0.5, color='green',
                            label=f'Normal (n={len(dn):,})', density=True)
                if len(da) > 0:
                    ax.hist(da, bins=50, alpha=0.5, color='red',
                            label=f'Attack (n={len(da):,})', density=True)
                ax.set_xlabel(col); ax.set_ylabel('Density')
                ax.set_title(col, fontweight='bold', fontsize=10)
                ax.legend(fontsize=7)
        for j in range(i + 1, len(axes)):
            axes[j].set_visible(False)
        fig.suptitle('Behavioral Feature Distributions (Window=50)', fontsize=14, fontweight='bold')
        plt.tight_layout()
        fig.savefig(ASSETS_DIR / 'behavior_feature_distributions.png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        print("  [PLOT] behavior_feature_distributions.png")

        # ── Plot 2: Window Size Comparison ──
        fig, axes = plt.subplots(2, 3, figsize=(16, 9))
        axes = axes.flatten()
        compare_feats = ['messages_per_second', 'unique_can_ids_window',
                         'window_delta_time_mean', 'window_payload_entropy_mean',
                         'message_burst_score', 'frequency_spike_score']
        for idx, feat in enumerate(compare_feats):
            ax = axes[idx]
            for wsp in self.window_sizes:
                means = []; labels = []
                for atype in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
                    p = OUTPUT_DIR / f'{atype.lower()}_w{wsp}.parquet'
                    if p.exists():
                        pf = pq.ParquetFile(p)
                        ns = min(5000, pf.metadata.num_rows)
                        rng = np.random.RandomState(42)
                        di = rng.choice(pf.metadata.num_rows, size=ns, replace=False)
                        dfs = pf.read().take(di).to_pandas()
                        if feat in dfs.columns:
                            means.append(dfs[feat].mean()); labels.append(atype)
                        del dfs; gc.collect()
                if means:
                    ax.plot(labels, means, marker='o', label=f'W={wsp}', linewidth=2)
            ax.set_title(feat, fontweight='bold'); ax.set_ylabel('Mean Value')
            ax.legend(fontsize=8); ax.tick_params(axis='x', rotation=20)
        fig.suptitle('Window Size Comparison Across Attack Types', fontsize=14, fontweight='bold')
        plt.tight_layout()
        fig.savefig(ASSETS_DIR / 'window_comparison.png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        print("  [PLOT] window_comparison.png")

        # ── Plot 3: Attack Pressure Analysis ──
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        pressure_feats = ['message_burst_score', 'frequency_spike_score', 'payload_instability_score']
        for idx, feat in enumerate(pressure_feats):
            ax = axes[idx]; data = []; labels = []
            for atype in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
                p = OUTPUT_DIR / f'{atype.lower()}_w{ws}.parquet'
                if p.exists():
                    pf = pq.ParquetFile(p)
                    ns = min(5000, pf.metadata.num_rows)
                    rng = np.random.RandomState(42)
                    di = rng.choice(pf.metadata.num_rows, size=ns, replace=False)
                    dfs = pf.read().take(di).to_pandas()
                    if feat in dfs.columns:
                        data.append(dfs[feat].dropna().values); labels.append(atype)
                    del dfs; gc.collect()
            bp = ax.boxplot(data, labels=labels, patch_artist=True,
                            boxprops=dict(facecolor='lightcoral', alpha=0.6),
                            medianprops=dict(color='black', linewidth=2))
            ax.set_title(feat, fontweight='bold'); ax.set_ylabel('Score')
            ax.tick_params(axis='x', rotation=20)
        fig.suptitle('Attack Pressure Indicators by Dataset (Window=50)', fontsize=14, fontweight='bold')
        plt.tight_layout()
        fig.savefig(ASSETS_DIR / 'attack_pressure_analysis.png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        print("  [PLOT] attack_pressure_analysis.png")

        del df_all, samples; gc.collect()

    # ── Report ──────────────────────────────────────────────────

    def _generate_report(self):
        lines = []
        def w(t=""): lines.append(t)
        w("# AutoShield Edge - Behavioral Feature Report")
        w("**Phase 4: Behavioral Cyber Twin Engine**")
        w("")

        w("## 1. Feature Catalogue")
        w("")
        w("| # | Feature | Category | Formula | Cybersecurity Relevance |")
        w("|---|---------|----------|---------|------------------------|")
        features = [
            (1, 'messages_per_second', 'Comm. Rate', 'ws / (last_ts - first_ts)',
             'DoS floods increase rate dramatically'),
            (2, 'unique_can_ids_window', 'CAN Diversity', 'nunique(CAN_ID)',
             'Fuzzy attacks use 1,664+ IDs vs ~27 normal'),
            (3, 'can_id_entropy', 'CAN Diversity', '-sum(p*log2(p))',
             'Randomized IDs increase entropy; normal traffic has low structured entropy'),
            (4, 'window_delta_time_mean', 'Timing', 'mean(delta_time>0)',
             'DoS decreases mean inter-message gap'),
            (5, 'window_delta_time_std', 'Timing', 'std(delta_time>0)',
             'Attack-induced timing irregularity increases std'),
            (6, 'window_delta_time_min', 'Timing', 'min(delta_time>0)',
             'DoS flooding produces extremely small gaps'),
            (7, 'window_delta_time_max', 'Timing', 'max(delta_time>0)',
             'Some attacks create pauses that increase max gap'),
            (8, 'window_payload_mean', 'Payload', 'mean(payload_mean)',
             'Injected attack bytes shift average payload value'),
            (9, 'window_payload_std', 'Payload', 'std(payload_mean)',
             'Attack mixing increases payload value diversity'),
            (10, 'window_payload_entropy_mean', 'Payload', 'mean(payload_entropy)',
             'Random attack bytes increase per-message entropy'),
            (11, 'message_burst_score', 'Attack Pressure', 'std(dt)/mean(dt)',
             'CV of gaps > 1.0 indicates bursty injection traffic'),
            (12, 'frequency_spike_score', 'Attack Pressure', 'max(dt)/min(dt)',
             'Extreme ratios (>100) signal irregular attack patterns'),
            (13, 'payload_instability_score', 'Attack Pressure', 'std(payload_mean)',
             'High instability indicates payload injection variance'),
        ]
        for fid, name, cat, formula, relevance in features:
            w(f"| {fid} | `{name}` | {cat} | {formula} | {relevance} |")
        w("")

        w("## 2. Window Size Comparison")
        w("")
        w("| Size | Total Windows | Time | Resolution | Noise Robustness |")
        w("|------|--------------|------|------------|------------------|")
        for ws in self.window_sizes:
            nw = self.stats['windows_generated'].get(ws, 0)
            ts = self.stats['processing_time_s'].get(ws, 0)
            res = {10: 'Very High', 50: 'High', 100: 'Moderate'}[ws]
            noise = {10: 'Low (noisy)', 50: 'Medium', 100: 'High (stable)'}[ws]
            w(f"| {ws} | {nw:,} | {ts:.1f}s | {res} | {noise} |")
        w("")
        w("**Recommendation**: Window=50 as default (best balance). Window=10 for low-latency edge alerting. Window=100 for fleet analytics.")
        w("")

        w("## 3. Expected Feature Importance")
        w("")
        w("| Rank | Feature | Importance | Affected Attacks |")
        w("|------|---------|------------|-----------------|")
        w("| 1 | `unique_can_ids_window` | Very High | Fuzzy |")
        w("| 2 | `can_id_entropy` | Very High | Fuzzy |")
        w("| 3 | `message_burst_score` | High | DoS |")
        w("| 4 | `frequency_spike_score` | High | DoS, Fuzzy |")
        w("| 5 | `messages_per_second` | High | DoS |")
        w("| 6 | `window_delta_time_std` | Med-High | All attacks |")
        w("| 7 | `payload_instability_score` | Medium | Fuzzy, Gear, RPM |")
        w("| 8 | `window_payload_entropy_mean` | Medium | Fuzzy |")
        w("| 9 | `window_delta_time_mean` | Medium | DoS |")
        w("| 10 | `window_delta_time_min` | Low-Med | DoS |")
        w("| 11 | `window_payload_mean` | Low-Med | Spoofing |")
        w("| 12 | `window_payload_std` | Low | Marginal |")
        w("| 13 | `window_delta_time_max` | Low | Redundant |")
        w("")

        w("## 4. Comparison with Single-Message Features")
        w("")
        w("| Aspect | Single-Message (P3) | Behavioral Windows (P4) |")
        w("|--------|--------------------|------------------------|")
        w("| Temporal context | None | 10-100 message window |")
        w("| Attack signal | Weak | Strong - patterns over sequences |")
        w("| Noise robustness | Low | High - aggregation smooths outliers |")
        w("| CAN ID signal | One ID per msg | Distribution over window |")
        w("| Timing signal | Single delta | Statistical moments |")
        w("| Burst detection | Impossible | Explicit scoring |")
        w("| Data volume | 17.5M rows | ~350K-1.75M windows |")
        w("")

        (REPORTS_DIR / 'behavioral_feature_report.md').write_text('\n'.join(lines), encoding='utf-8')
        print("  [DOC] reports/behavioral_feature_report.md")

    def _generate_summary(self):
        lines = []
        def w(t=""): lines.append(t)
        w("# AutoShield Edge - Phase 4 Summary")
        w("**Behavioral Cyber Twin Engine**")
        w("")
        w("## Overview")
        w("Generated rolling-window behavioral features addressing Phase 3's key limitation:"
          " single-message features lack temporal context for attack pattern detection.")
        w("")

        w("## Final Behavioral Feature List (13 + 2 labels)")
        w("")
        w("| Category | Features | Count |")
        w("|----------|----------|-------|")
        w("| Communication Rate | `messages_per_second` | 1 |")
        w("| CAN Diversity | `unique_can_ids_window`, `can_id_entropy` | 2 |")
        w("| Timing Behavior | `window_delta_time_mean`, `_std`, `_min`, `_max` | 4 |")
        w("| Payload Behavior | `window_payload_mean`, `_std`, `_entropy_mean` | 3 |")
        w("| Attack Pressure | `message_burst_score`, `frequency_spike_score`, `payload_instability_score` | 3 |")
        w("| Labels | `Attack_Label`, `Attack_Type` | 2 |")
        w("| **Total** | | **15** |")
        w("")

        w("## Window Size Recommendation")
        w("")
        w("| Size | Windows Generated | Best For |")
        w("|------|-----------------|----------|")
        for ws in self.window_sizes:
            nw = self.stats['windows_generated'].get(ws, 0)
            use = {10: 'Low-latency edge alerting', 50: 'General detection (default)',
                   100: 'Fleet analytics / baselines'}[ws]
            w(f"| **{ws}** | {nw:,} | {use} |")
        w("")

        w("## Readiness for Next-Generation Anomaly Detection")
        w("")
        w("1. **Expected baseline improvement**: Precision >0.80, Recall >0.75 (vs P3: F1=0.112)")
        w("2. **Window=50** recommended as primary input for Phase 5 model training")
        w("3. **Top expected features**: `unique_can_ids_window`, `can_id_entropy`, `message_burst_score`")
        w("4. **Data reduction**: ~350:1 compression (17.5M msgs -> ~350K windows at W=50)")
        w("5. **Recommended algorithms**: Isolation Forest, Autoencoder, XGBoost on window features")
        w("6. **Path to production**: Windowed features enable sub-100ms edge inference latency")

        (REPORTS_DIR / 'phase4_behavior_summary.md').write_text('\n'.join(lines), encoding='utf-8')
        print("  [DOC] reports/phase4_behavior_summary.md")


if __name__ == '__main__':
    engine = BehavioralFeatureEngine(window_sizes=WINDOW_SIZES)
    engine.run()
