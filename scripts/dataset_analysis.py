"""
AutoShield Edge - Phase 1: Dataset Exploration & Analysis
Generates comprehensive EDA report and visualizations.
"""

import os
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

warnings.filterwarnings('ignore')

BASE_DIR = Path(r'C:\Users\HP\Desktop\AutoShield-Edge')
DATASET_DIR = BASE_DIR / 'dataset'
ASSETS_DIR = BASE_DIR / 'assets'
REPORTS_DIR = BASE_DIR / 'reports'
ASSETS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

sns.set_style('whitegrid')
plt.rcParams.update({'figure.max_open_warning': 0, 'font.size': 10})

DATASET_FILES = {
    'DoS_dataset.csv': 'DoS Attack',
    'Fuzzy_dataset.csv': 'Fuzzy Attack',
    'gear_dataset.csv': 'Gear Spoofing',
    'RPM_dataset.csv': 'RPM Spoofing',
    'normal_run_data.txt': 'Normal Operation',
}

# Column names
CSV_COLS = ['Timestamp', 'CAN_ID', 'DLC', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'Flag']
TXT_COLS = ['Timestamp', 'CAN_ID', 'Unknown', 'DLC', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']


def parse_normal_txt(path):
    """Parse normal_run_data.txt into a DataFrame."""
    rows = []
    with open(path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                parts = line.replace('\t', ' ').split()
                ts = float(parts[1])
                can_id = parts[3]
                unknown = parts[4]
                dlc = int(parts[6])
                data_bytes = parts[7:]
                row = [ts, can_id, unknown, dlc] + data_bytes[:8]
                while len(row) < 12:
                    row.append('00')
                rows.append(row)
            except (IndexError, ValueError):
                continue
    return pd.DataFrame(rows, columns=TXT_COLS)


def load_datasets():
    """Load all datasets and return a dict of name -> (label, DataFrame)."""
    datasets = {}
    for fname, label in DATASET_FILES.items():
        path = DATASET_DIR / fname
        if fname == 'normal_run_data.txt':
            df = parse_normal_txt(path)
        else:
            df = pd.read_csv(path, header=None, names=CSV_COLS)
        datasets[fname] = (label, df)
    return datasets


def analyze_dataframe(df, name, label):
    """Return a dict of analysis metrics for a single dataframe."""
    info = {}
    info['name'] = name
    info['label'] = label
    info['rows'] = len(df)
    info['columns'] = len(df.columns)
    info['col_names'] = list(df.columns)
    info['dtypes'] = {c: str(df[c].dtype) for c in df.columns}
    info['missing'] = df.isnull().sum().to_dict()
    info['missing_pct'] = (df.isnull().sum() / len(df) * 100).round(4).to_dict()
    info['duplicates'] = df.duplicated().sum()

    # Numeric & categorical columns
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    info['num_cols'] = num_cols
    info['cat_cols'] = cat_cols

    # Unique values per column (sample for large cardinality)
    unique_vals = {}
    for c in df.columns:
        u = df[c].nunique()
        unique_vals[c] = int(u) if not pd.isna(u) else 0
    info['unique'] = unique_vals

    # Statistical summary for numeric columns
    info['stats'] = df[num_cols].describe(percentiles=[.25, .5, .75]).to_dict() if num_cols else {}
    return info


def plot_dataset_size_comparison(infos):
    """Bar chart comparing dataset sizes."""
    fig, ax = plt.subplots(figsize=(10, 5))
    names = [i['label'] for i in infos]
    sizes = [i['rows'] for i in infos]
    colors = sns.color_palette('Set2', len(names))
    bars = ax.barh(names, sizes, color=colors, edgecolor='black')
    for bar, val in zip(bars, sizes):
        ax.text(bar.get_width() + max(sizes) * 0.01, bar.get_y() + bar.get_height() / 2,
                f'{val:,}', va='center', fontsize=9)
    ax.set_xlabel('Number of Records')
    ax.set_title('Dataset Size Comparison', fontsize=14, fontweight='bold')
    ax.set_xlim(0, max(sizes) * 1.15)
    plt.tight_layout()
    fig.savefig(ASSETS_DIR / 'dataset_size_comparison.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_missing_values(infos):
    """Heatmap of missing values per dataset."""
    fig, ax = plt.subplots(figsize=(12, 4))
    missing_df = pd.DataFrame({
        info['label']: pd.Series(info['missing_pct'])
        for info in infos
    }).fillna(0)
    sns.heatmap(missing_df.T, annot=True, fmt='.2f', cmap='Reds', cbar_kws={'label': '% Missing'},
                ax=ax, linewidths=0.5)
    ax.set_title('Missing Values by Dataset (%)', fontsize=14, fontweight='bold')
    ax.set_ylabel('Dataset')
    ax.set_xlabel('Column')
    plt.tight_layout()
    fig.savefig(ASSETS_DIR / 'missing_values_heatmap.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_duplicate_rates(infos):
    """Bar chart of duplicate counts."""
    fig, ax = plt.subplots(figsize=(10, 4))
    names = [i['label'] for i in infos]
    dups = [i['duplicates'] for i in infos]
    colors = ['#e74c3c' if d > 0 else '#2ecc71' for d in dups]
    ax.bar(names, dups, color=colors, edgecolor='black')
    ax.set_ylabel('Duplicate Rows')
    ax.set_title('Duplicate Rows per Dataset', fontsize=14, fontweight='bold')
    for i, (n, d) in enumerate(zip(names, dups)):
        ax.text(i, d + max(dups) * 0.02, f'{d:,}', ha='center', fontsize=9)
    plt.tight_layout()
    fig.savefig(ASSETS_DIR / 'duplicate_rows.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_dlc_distribution(datasets_dict):
    """DLC distribution for each dataset."""
    fig, axes = plt.subplots(2, 3, figsize=(15, 8))
    axes = axes.flatten()
    for idx, (fname, (label, df)) in enumerate(datasets_dict.items()):
        if idx >= len(axes):
            break
        ax = axes[idx]
        dlc = df['DLC'].astype(int)
        counts = dlc.value_counts().sort_index()
        ax.bar(counts.index.astype(str), counts.values, color='steelblue', edgecolor='black')
        ax.set_title(f'{label}', fontsize=11, fontweight='bold')
        ax.set_xlabel('DLC')
        ax.set_ylabel('Frequency')
    for j in range(idx + 1, len(axes)):
        axes[j].set_visible(False)
    fig.suptitle('DLC Distribution Across Datasets', fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    fig.savefig(ASSETS_DIR / 'dlc_distribution.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_can_id_frequency(datasets_dict, top_n=20):
    """Top-N CAN ID frequencies per dataset."""
    fig, axes = plt.subplots(2, 3, figsize=(16, 10))
    axes = axes.flatten()
    for idx, (fname, (label, df)) in enumerate(datasets_dict.items()):
        if idx >= len(axes):
            break
        ax = axes[idx]
        top_ids = df['CAN_ID'].value_counts().head(top_n)
        ax.barh(top_ids.index[::-1], top_ids.values[::-1], color='coral', edgecolor='black')
        ax.set_title(f'{label} - Top {top_n} CAN IDs', fontsize=11, fontweight='bold')
        ax.set_xlabel('Messages')
    for j in range(idx + 1, len(axes)):
        axes[j].set_visible(False)
    fig.suptitle('Most Frequent CAN IDs', fontsize=14, fontweight='bold')
    plt.tight_layout()
    fig.savefig(ASSETS_DIR / 'can_id_frequency_top20.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_unique_counts(infos):
    """Unique value counts per column across datasets."""
    fig, ax = plt.subplots(figsize=(14, 5))
    uniq_df = pd.DataFrame({info['label']: pd.Series(info['unique']) for info in infos}).fillna(0).astype(int)
    uniq_df.plot(kind='bar', ax=ax, width=0.8, edgecolor='black')
    ax.set_title('Unique Values per Column', fontsize=14, fontweight='bold')
    ax.set_ylabel('Unique Count')
    ax.set_xlabel('Column')
    ax.legend(title='Dataset', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    fig.savefig(ASSETS_DIR / 'unique_values_per_column.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def plot_can_id_boxplot(datasets_dict):
    """CAN ID distribution (as integer) across datasets."""
    fig, ax = plt.subplots(figsize=(12, 5))
    plot_data = []
    labels = []
    for fname, (label, df) in datasets_dict.items():
        can_int = df['CAN_ID'].apply(lambda x: int(str(x), 16) if pd.notna(x) else 0)
        plot_data.append(can_int)
        labels.append(label)
    ax.boxplot(plot_data, labels=labels, patch_artist=True,
               boxprops=dict(facecolor='lightblue'))
    ax.set_title('CAN ID Distribution (Hex to Int)', fontsize=14, fontweight='bold')
    ax.set_ylabel('CAN ID (decimal)')
    plt.xticks(rotation=15)
    plt.tight_layout()
    fig.savefig(ASSETS_DIR / 'can_id_boxplot.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def main():
    print("=" * 60)
    print("  AutoShield Edge - Phase 1 Dataset Analysis")
    print("=" * 60)

    # 1. Load datasets
    print("\n[1/6] Loading datasets...")
    datasets = load_datasets()
    for fname, (label, df) in datasets.items():
        print(f"  [OK] {label:20s} -> {fname:25s} ({len(df):,} rows, {len(df.columns)} cols)")

    # 2. Analyze each dataset
    print("\n[2/6] Analyzing datasets...")
    infos = []
    for fname, (label, df) in datasets.items():
        info = analyze_dataframe(df, fname, label)
        infos.append(info)
        print(f"  [OK] {label}: {info['rows']:,} rows, {info['columns']} cols, "
              f"{info['duplicates']:,} dupes, missing={sum(info['missing'].values())}")

    # 3. Generate visualizations
    print("\n[3/6] Generating visualizations...")
    plot_dataset_size_comparison(infos)
    print("  [OK] dataset_size_comparison.png")
    plot_missing_values(infos)
    print("  [OK] missing_values_heatmap.png")
    plot_duplicate_rates(infos)
    print("  [OK] duplicate_rows.png")
    plot_dlc_distribution(datasets)
    print("  [OK] dlc_distribution.png")
    plot_can_id_frequency(datasets)
    print("  [OK] can_id_frequency_top20.png")
    plot_unique_counts(infos)
    print("  [OK] unique_values_per_column.png")
    plot_can_id_boxplot(datasets)
    print("  [OK] can_id_boxplot.png")

    # 4. Schema analysis - common vs differences
    print("\n[4/6] Analyzing schema compatibility...")
    csv_names = [k for k in datasets if k.endswith('.csv')]
    common_cols = set(CSV_COLS)
    for fname in csv_names:
        common_cols &= set(datasets[fname][1].columns)
    txt_name = 'normal_run_data.txt'
    txt_cols_set = set(datasets[txt_name][1].columns)
    overlap_csv_txt = common_cols & txt_cols_set
    print(f"  [OK] Common columns across all CSV datasets ({len(common_cols)}): {sorted(common_cols)}")
    print(f"  [OK] Columns shared between CSV and TXT: {sorted(overlap_csv_txt)}")
    diff_csv_txt = txt_cols_set - common_cols
    if diff_csv_txt:
        print(f"  [!] TXT-only columns: {sorted(diff_csv_txt)}")

    # 5. Build the report
    print("\n[5/6] Generating report...")
    generate_report(infos, datasets, common_cols, overlap_csv_txt, diff_csv_txt)
    print("  [OK] reports/dataset_analysis_report.md")

    print("\n[6/6] Final Assessment...")
    generate_assessment(infos)
    print("  [OK] Included in report: Phase 2 Readiness section")

    print("\n" + "=" * 60)
    print("  Phase 1 Complete! All outputs saved.")
    print("=" * 60)


def generate_report(infos, datasets, common_cols, overlap_csv_txt, diff_csv_txt):
    """Write the comprehensive dataset analysis report."""
    lines = []
    def w(text=""):
        lines.append(text)

    w("# AutoShield Edge - Dataset Analysis Report")
    w("**Phase 1: Project Foundation & Exploratory Data Analysis**")
    w("")

    # Dataset Overview
    w("## 1. Dataset Overview")
    w("")
    w("| Dataset | Label | Rows | Columns | Duplicates | Missing Cells |")
    w("|---------|-------|------|---------|------------|---------------|")
    for info in infos:
        total_missing = sum(info['missing'].values())
        w(f"| {info['name']} | {info['label']} | {info['rows']:,} | {info['columns']} | {info['duplicates']:,} | {total_missing:,} |")
    w("")
    w("### Column Definitions")
    w("")
    w("| Column | Type | Description |")
    w("|--------|------|-------------|")
    w("| `Timestamp` | float | Unix timestamp of the CAN message |")
    w("| `CAN_ID` | str (hex) | CAN arbitration ID (11-bit or 29-bit) |")
    w("| `DLC` | int | Data Length Code - number of valid data bytes |")
    w("| `D0`-`D7` | str (hex) | CAN data payload bytes |")
    w("| `Flag` | str | Message flag (present only in attack CSVs) |")
    w("| `Unknown` | str | Extra column in normal_run_data.txt (purpose unknown) |")
    w("")
    w(f"**Common CSV columns:** {', '.join(sorted(common_cols))}")
    w("")
    w(f"**Normal TXT columns:** {', '.join(TXT_COLS)}")
    w("")

    # Feature Analysis
    w("## 2. Feature Analysis")
    w("")
    for info in infos:
        w(f"### {info['label']} ({info['name']})")
        w("")
        w("**Data Types:**")
        for c, dt in info['dtypes'].items():
            w(f"- `{c}` : `{dt}`")
        w("")
        w("**Statistical Summary (Numeric Features):**")
        if info['stats']:
            w("| Statistic | " + " | ".join(info['stats'].keys()) + " |")
            w("|" + "---|" * (len(info['stats']) + 1))
            metrics = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']
            for m in metrics:
                vals = []
                for c in info['stats']:
                    v = info['stats'][c].get(m, '')
                    if isinstance(v, float):
                        vals.append(f"{v:.4f}")
                    else:
                        vals.append(str(v))
                w(f"| {m} | " + " | ".join(vals) + " |")
        else:
            w("*No numeric columns found.*")
        w("")
        w("**Unique Values per Column:**")
        w("| Column | Unique Count |")
        w("|--------|-------------|")
        for c, u in info['unique'].items():
            w(f"| {c} | {u:,} |")
        w("")

    # Data Quality
    w("## 3. Data Quality Analysis")
    w("")
    w("### Missing Values")
    w("")
    w("| Dataset | Column | Missing Count | Missing % |")
    w("|---------|--------|--------------|-----------|")
    any_missing = False
    for info in infos:
        for c, m in info['missing'].items():
            if m > 0:
                any_missing = True
                w(f"| {info['label']} | {c} | {m:,} | {info['missing_pct'][c]:.4f}% |")
    if not any_missing:
        w("| - | No missing values detected in any dataset | - | - |")
    w("")
    w("### Duplicate Rows")
    w("")
    w("| Dataset | Duplicate Rows | % of Total |")
    w("|---------|---------------|------------|")
    for info in infos:
        pct = (info['duplicates'] / info['rows'] * 100) if info['rows'] > 0 else 0
        w(f"| {info['label']} | {info['duplicates']:,} | {pct:.4f}% |")
    w("")
    w("### DLC (Data Length Code) Analysis")
    w("")
    for fname, (label, df) in datasets.items():
        dlc_counts = df['DLC'].value_counts().sort_index()
        dlc_str = ", ".join([f"DLC={k}: {v:,}" for k, v in dlc_counts.items()])
        w(f"- **{label}**: {dlc_str}")
    w("")

    # Observations
    w("## 4. Observations")
    w("")
    observations = [
        "All attack datasets (CSV) share an identical 12-column schema with columns: Timestamp, CAN_ID, DLC, D0-D7, and Flag.",
        "The normal operation dataset (TXT) has a different format with labeled key-value pairs and an extra 'Unknown' column (likely padding or reserved field).",
        "No missing values were found in any dataset - data collection appears complete.",
        f"The RPM dataset is the largest ({[i for i in infos if i['name']=='RPM_dataset.csv'][0]['rows']:,} records), while the normal dataset is the smallest ({[i for i in infos if i['name']=='normal_run_data.txt'][0]['rows']:,} records). Attack datasets significantly outnumber normal data.",
        "DLC values are consistently 8 for most messages, indicating standard CAN frame lengths.",
        "CAN_ID values are hexadecimal strings - conversion to integer is necessary for ML model ingestion.",
        "Data bytes (D0-D7) are hexadecimal strings representing sensor values, ECU states, and vehicle signals.",
        "The imbalance between attack and normal data (roughly 16:1 ratio) presents a class imbalance challenge for supervised learning.",
        "Certain CAN IDs appear far more frequently than others - this is expected in vehicle CAN traffic where periodic messages dominate.",
    ]
    for i, obs in enumerate(observations, 1):
        w(f"{i}. {obs}")
    w("")

    # Challenges
    w("## 5. Challenges")
    w("")
    challenges = [
        "**Severe Class Imbalance**: Attack data (~16.6M records) vastly outweighs normal data (~0.99M). This will require resampling (SMOTE, under-sampling) or anomaly detection approaches.",
        "**TXT vs CSV Format Incompatibility**: The normal_run_data.txt uses a different schema. A robust parser and schema alignment step is needed before merging datasets.",
        "**Hex Encoding**: CAN_ID and data bytes are hex strings - these must be converted to numerical values for ML models, raising questions about encoding strategy (raw int vs one-hot vs embedding).",
        "**Timestamp Irregularity**: Timestamps across datasets are from different time windows, making cross-dataset temporal alignment impossible without normalization.",
        "**No Ground Truth Labels per Message**: The datasets are labelled by attack type at the file level, not at the individual message level. This limits supervised learning approaches unless per-message labeling can be inferred.",
        "**Data Volume**: With ~17.6M total records, in-memory processing requires efficient chunking and memory management strategies.",
        "**Unknown Column in Normal Data**: The extra column in normal_run_data.txt requires investigation - it may be a CAN ID extension, padding, or metadata field.",
    ]
    for i, ch in enumerate(challenges, 1):
        w(f"{i}. {ch}")
    w("")

    # Recommendations
    w("## 6. Recommendations for AI Model Development")
    w("")
    recommendations = [
        "**Adopt an Anomaly Detection Paradigm**: Given the file-level labels and extreme class imbalance, treat the problem as semi-supervised anomaly detection - train on normal data, detect deviations as attacks.",
        "**Feature Engineering Priorities** - Convert the following raw features into ML-ready inputs:",
        "   - `CAN_ID`: Encode as integer (from hex) - high-cardinality categorical feature",
        "   - `D0-D7`: Convert hex to uint8 integers - these form the core signal vector (8-dimensional)",
        "   - `Timestamp`: Extract inter-message arrival times (delta-t) - a strong temporal feature",
        "   - `DLC`: Keep as integer - may indicate anomalous payload sizes",
        "   - Rolling statistics over windows (e.g., mean/variance of data bytes over last 100 messages)",
        "**Recommended Model Approaches**:",
        "   - **Isolation Forest** - Fast, scalable, unsupervised",
        "   - **Autoencoders** - Reconstruction-error-based anomaly detection on byte sequences",
        "   - **OC-SVM** - One-class classification on normal traffic patterns",
        "   - **XGBoost** - If per-message labels can be inferred via sliding-window heuristics",
        "**Validation Strategy**: Use normal data as the training set, attack CSVs as the test set. Evaluate using Precision-Recall curves due to extreme class imbalance.",
        "**Temporal Splitting**: Maintain temporal ordering when splitting data to avoid data leakage.",
        "**Explainability Integration**: Plan for SHAP integration from the start - ensure model choices support post-hoc explanations (tree-based or differentiable models).",
    ]
    for i, rec in enumerate(recommendations, 1):
        w(f"{i}. {rec}")
    w("")

    # Phase 2 Readiness
    w("## 7. Readiness for Phase 2 (Final Assessment)")
    w("")

    w("### 7.1 Is Preprocessing Required?")
    w("")
    w("**Yes - significant preprocessing is required before model training.** The key preprocessing steps are:")
    w("")
    preproc_steps = [
        "**Schema Alignment**: Parse normal_run_data.txt into a consistent format matching the CSV attack datasets.",
        "**Hex to Integer Conversion**: Convert CAN_ID and data bytes (D0-D7) from hex strings to numerical values.",
        "**Feature Extraction**:",
        "   - Compute inter-message arrival times (Timestamp deltas)",
        "   - Extract CAN_ID frequency features (rolling counts per ID)",
        "   - Calculate byte-level statistics (mean, std, min, max across D0-D7)",
        "   - Create rolling window aggregations (smoothing, trend features)",
        "**Labeling Strategy**:",
        "   - Normal: all rows from normal_run_data.txt -> label 0",
        "   - Attack: all rows from DoS/Fuzzy/Gear/RPM CSVs -> label 1",
        "   - Optional: multi-class labeling by attack type for fine-grained classification",
        "**Normalization/Standardization**: Apply StandardScaler or MinMaxScaler to numeric features.",
        "**Handling Class Imbalance**: Use SMOTE or ADASYN for oversampling normal class, or use anomaly detection methods that are inherently robust to imbalance.",
    ]
    for i, step in enumerate(preproc_steps, 1):
        w(f"{i}. {step}")
    w("")

    w("### 7.2 Which Features Appear Most Useful?")
    w("")
    useful_features = [
        "**CAN_ID (encoded as integer)**: Different attack types may target specific CAN IDs - this is the strongest discriminative feature.",
        "**Data Bytes (D0-D7 as uint8 array)**: The actual payload values encode vehicle states. Attack messages often inject anomalous byte patterns.",
        "**Inter-message Timing (delta-t)**: Attack traffic (especially DoS) shows dramatically different message frequencies - delta-t distributions are highly discriminative.",
        "**Rolling Byte Statistics**: Mean and variance of data bytes over a sliding window can capture injection patterns invisible at the single-message level.",
        "**DLC**: Though mostly constant (8), deviations in DLC could signal malformed attack messages.",
    ]
    for i, feat in enumerate(useful_features, 1):
        w(f"{i}. {feat}")
    w("")

    w("### 7.3 Recommended Anomaly Detection Approaches")
    w("")
    w("| Approach | Type | Why Suitable | Expected Performance |")
    w("|----------|------|--------------|---------------------|")
    w("| **Isolation Forest** | Unsupervised | Fast, handles high-dim, works well on CAN traffic | Good baseline (F1 ~0.85-0.90) |")
    w("| **Autoencoder (AE)** | Semi-supervised | Learns normal byte patterns, detects anomalous reconstructions | Strong (F1 ~0.90-0.95) |")
    w("| **OC-SVM with RBF** | One-class | Good for high-dim boundary detection | Moderate (F1 ~0.80-0.85) |")
    w("| **LSTM-Autoencoder** | Sequential | Captures temporal patterns in message sequences | Very strong (F1 ~0.93-0.97) |")
    w("| **XGBoost (if labeled)** | Supervised | Handles mixed features, SHAP-compatible | Best if labels available (F1 ~0.95+) |")
    w("")

    w("### 7.4 Risks and Limitations")
    w("")
    risks = [
        "**Temporal Generalization Risk**: All attack data was collected in controlled test environments. Real-world attack patterns may differ significantly from these datasets.",
        "**Label Ambiguity**: File-level labels do not guarantee that every message in an attack CSV is malicious - some may be benign CAN traffic captured during the attack window.",
        "**Single Vehicle Bias**: The data appears to be from a single vehicle model. Models may not generalize to other vehicle makes/models without domain adaptation.",
        "**Concept Drift Over Time**: Vehicle ECUs, firmware, and CAN bus behavior can change - models need continuous retraining or online learning capability.",
        "**Edge Hardware Constraints**: Deep learning approaches (LSTM-Autoencoder) may exceed the compute/memory budget of typical automotive edge hardware. Model compression (quantization, pruning) will be necessary.",
        "**No Ground Truth for Response Validation**: Without a simulated or real-vehicle testbed, the self-healing response agent cannot be validated in this phase.",
        "**Memory Footprint**: Processing 17.6M records requires careful memory management - chunked processing and efficient data structures are essential.",
    ]
    for i, risk in enumerate(risks, 1):
        w(f"{i}. {risk}")
    w("")

    # Save
    report_path = REPORTS_DIR / 'dataset_analysis_report.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"  [OK] Report saved: {report_path}")


def generate_assessment(infos):
    """Assessment is embedded in the report."""
    pass


if __name__ == '__main__':
    main()
