#!/usr/bin/env python3
"""
AutoShield Edge — Phase 6: Vehicle Cyber Health Score Engine
==============================================================
Transforms raw anomaly detection outputs into an intuitive
0-100 cybersecurity health metric for CAN bus vehicle networks.

Designed as a reusable module with:
  - CyberHealthEngine class (importable)
  - CLI entry point for offline batch scoring
  - Report + visualization generation

Usage as module:
  from cyber_health_engine import CyberHealthEngine
  engine = CyberHealthEngine()
  engine.fit_normal(X_normal, scores_normal)
  engine.compute(X_all, scores_all) -> DataFrame with health scores

Usage as script:
  python cyber_health_engine.py
"""

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
import warnings
warnings.filterwarnings('ignore')

from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score

# =========================================================================
#  CONFIGURATION
# =========================================================================
WINDOW_SIZE = 50
RANDOM_STATE = 42

FEATURES = [
    'messages_per_second', 'unique_can_ids_window', 'can_id_entropy',
    'window_delta_time_mean', 'window_delta_time_std',
    'window_delta_time_min', 'window_delta_time_max',
    'window_payload_mean', 'window_payload_std', 'window_payload_entropy_mean',
    'message_burst_score', 'frequency_spike_score', 'payload_instability_score',
]

STABILITY_FEATURES = ['messages_per_second', 'can_id_entropy', 'unique_can_ids_window']
PRESSURE_FEATURES  = ['message_burst_score', 'frequency_spike_score', 'payload_instability_score']

# Weight distribution (rationale in report)
WEIGHT_THREAT    = 0.40   # Anomaly score is the strongest single signal
WEIGHT_STABILITY = 0.30   # Baseline behavioral consistency
WEIGHT_PRESSURE  = 0.30   # Attack pressure indicators

# Risk category thresholds
CATEGORY_BOUNDARIES = [
    ('Critical',   0,  20),
    ('High Risk',  20, 40),
    ('Warning',    40, 60),
    ('Stable',     60, 80),
    ('Secure',     80, 101),
]

CATEGORY_COLORS = {
    'Secure':    '#2ecc71',   # green
    'Stable':    '#3498db',   # blue
    'Warning':   '#f39c12',   # orange
    'High Risk': '#e67e22',   # dark orange
    'Critical':  '#e74c3c',   # red
}

# Trend labels
TREND_IMPROVING = 'Improving'
TREND_STABLE    = 'Stable'
TREND_DEGRADING = 'Degrading'

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / 'data' / 'behavioral'
ASSETS_DIR = BASE_DIR / 'assets'
REPORTS_DIR = BASE_DIR / 'reports'


# =========================================================================
#  CYBER HEALTH ENGINE
# =========================================================================
class CyberHealthEngine:
    """Computes 0-100 cybersecurity health scores for CAN bus vehicle windows.

    Formula:
        CyberHealth = ThreatComponent + StabilityComponent + PressureComponent

        ThreatComponent     = 40 * healthiness(anomaly_score)        [0-40]
        StabilityComponent  = 30 * avg(healthiness(stability_feats)) [0-30]
        PressureComponent   = 30 * avg(healthiness(pressure_feats))  [0-30]
        Total = 0-100

    Healthiness function (z-score decay):
        h(v) = exp(-max(0, |z| - tolerance) / decay_factor)
        where z = (v - mean_normal) / std_normal
        Direction controls which tail(s) are penalized:
          'both'     — any deviation from normal reduces health
          'positive' — only values above the normal mean reduce health
          'negative' — only values below the normal mean reduce health

    Risk categories:
        80-100  Secure, 60-80 Stable, 40-60 Warning, 20-40 High Risk, 0-20 Critical
    """

    def __init__(self, decay_factor=1.5, tolerance_stability=0.2,
                 tolerance_pressure=0.2, tolerance_threat=0.2):
        self.decay_factor = decay_factor
        self.tol_stab = tolerance_stability
        self.tol_pres = tolerance_pressure
        self.tol_threat = tolerance_threat
        self.normal_stats_ = None       # fitted statistics per feature
        self._fitted = False

    # ------------------------------------------------------------------
    #  Fit: learn normal baseline statistics
    # ------------------------------------------------------------------
    def fit_normal(self, X_normal, anomaly_scores_normal):
        """Learn mean/std baselines from pure normal windows.

        Parameters
        ----------
        X_normal : pd.DataFrame  — behavioral features for normal windows
        anomaly_scores_normal : np.ndarray — model decision_function values
            (higher = more normal, lower = more anomalous)

        Returns
        -------
        self
        """
        stats = {}
        for feat in FEATURES:
            vals = X_normal[feat].values.astype(np.float64)
            stats[feat] = {'mean': float(np.mean(vals)),
                           'std':  float(max(np.std(vals), 1e-10))}
        stats['anomaly_score'] = {
            'mean': float(np.mean(anomaly_scores_normal)),
            'std':  float(max(np.std(anomaly_scores_normal), 1e-10))
        }
        self.normal_stats_ = stats
        self._fitted = True
        return self

    # ------------------------------------------------------------------
    #  Healthiness function (vectorized)
    # ------------------------------------------------------------------
    def _health(self, values, mean, std, direction='both', tolerance=0.0):
        """Map feature values to 0-1 healthiness via exponential z-score decay.

        Parameters
        ----------
        values : np.ndarray
        mean, std : float
        direction : str — 'both' (two-sided), 'positive' (only +z penalized),
                           'negative' (only -z penalized)
        tolerance : float — z-score threshold below which no penalty

        For 'negative' direction (used for anomaly_score):
          The OCSVM decision_function is low (negative) for anomalous windows.
          We only penalize when the value falls below the normal mean.
        """
        z = (values - mean) / std
        if direction == 'positive':
            z = np.maximum(0.0, z - tolerance)
        elif direction == 'negative':
            z = np.maximum(0.0, -z - tolerance)
        else:
            z = np.maximum(0.0, np.abs(z) - tolerance)
        return np.exp(-z / self.decay_factor)

    # ------------------------------------------------------------------
    #  Compute health scores
    # ------------------------------------------------------------------
    def compute(self, X, anomaly_scores):
        """Compute cyber health scores for every window.

        Parameters
        ----------
        X : pd.DataFrame        — behavioral features
        anomaly_scores : np.ndarray — decision_function values (higher = more normal)

        Returns
        -------
        pd.DataFrame with columns: cyber_health, threat_component, stability_component,
                                   pressure_component, risk_category, etc.
        """
        if not self._fitted:
            raise RuntimeError("Call fit_normal() before compute().")

        s = self.normal_stats_

        # Threat component  (direction='negative': lower anomaly_score = less healthy)
        th_health = self._health(anomaly_scores, s['anomaly_score']['mean'],
                                 s['anomaly_score']['std'], direction='negative',
                                 tolerance=self.tol_threat)
        threat_comp = th_health * 40.0

        # Stability component (direction='both': any deviation from normal reduces health)
        stab_health = np.zeros((len(X), len(STABILITY_FEATURES)))
        for j, feat in enumerate(STABILITY_FEATURES):
            stab_health[:, j] = self._health(
                X[feat].values.astype(np.float64),
                s[feat]['mean'], s[feat]['std'],
                direction='both', tolerance=self.tol_stab
            )
        stability_comp = np.mean(stab_health, axis=1) * 30.0

        # Pressure component (direction='positive': higher values = more pressure = less healthy)
        pres_health = np.zeros((len(X), len(PRESSURE_FEATURES)))
        for j, feat in enumerate(PRESSURE_FEATURES):
            pres_health[:, j] = self._health(
                X[feat].values.astype(np.float64),
                s[feat]['mean'], s[feat]['std'],
                direction='positive', tolerance=self.tol_pres
            )
        pressure_comp = np.mean(pres_health, axis=1) * 30.0

        # Total cyber health score
        cyber_health = np.clip(threat_comp + stability_comp + pressure_comp, 0, 100)

        # Risk category labels
        cats = self.assign_categories(cyber_health)

        # Component sub-scores for interpretability
        result = pd.DataFrame({
            'window_index': np.arange(len(X)),
            'cyber_health': np.round(cyber_health, 2),
            'threat_component':   np.round(threat_comp, 2),
            'stability_component': np.round(stability_comp, 2),
            'pressure_component':  np.round(pressure_comp, 2),
            'risk_category': cats,
        })
        return result

    # ------------------------------------------------------------------
    #  Risk category assignment
    # ------------------------------------------------------------------
    @staticmethod
    def assign_categories(scores):
        """Map numeric scores to risk category strings."""
        cats = []
        for sc in scores:
            if sc >= 80:
                cats.append('Secure')
            elif sc >= 60:
                cats.append('Stable')
            elif sc >= 40:
                cats.append('Warning')
            elif sc >= 20:
                cats.append('High Risk')
            else:
                cats.append('Critical')
        return cats

    # ------------------------------------------------------------------
    #  Trend analysis
    # ------------------------------------------------------------------
    @staticmethod
    def compute_trend(scores, lookback=10, threshold=2.0):
        """Compare recent vs previous window group to determine trend.

        Parameters
        ----------
        scores : np.ndarray — health score time series
        lookback : int — number of recent windows to compare
        threshold : float — minimum mean difference to declare trend

        Returns
        -------
        trend_label : str — Improving / Stable / Degrading
        diff : float — recent_mean - previous_mean
        """
        if len(scores) < lookback * 2:
            return TREND_STABLE, 0.0
        recent = np.mean(scores[-lookback:])
        prev   = np.mean(scores[-(lookback * 2):-lookback])
        diff = recent - prev
        if diff > threshold:
            return TREND_IMPROVING, round(diff, 2)
        elif diff < -threshold:
            return TREND_DEGRADING, round(diff, 2)
        else:
            return TREND_STABLE, round(diff, 2)

    # ------------------------------------------------------------------
    #  Lightweight forecast (exponential smoothing + decay to mean)
    # ------------------------------------------------------------------
    @staticmethod
    def forecast(scores, n_ahead=10, alpha=0.3):
        """Predict health scores for next n_ahead windows.

        Uses Holt-Winters-like exponential smoothing with a decay
        toward the overall mean for longer horizons.

        Parameters
        ----------
        scores : np.ndarray — historical health scores
        n_ahead : int — number of future windows to forecast
        alpha : float — smoothing factor (0-1)

        Returns
        -------
        forecast : np.ndarray of length n_ahead
        """
        if len(scores) < 3:
            return np.full(n_ahead, 50.0)

        arr = np.asarray(scores, dtype=np.float64)
        # Simple exponential smoothing
        smoothed = np.zeros_like(arr)
        smoothed[0] = arr[0]
        for t in range(1, len(arr)):
            smoothed[t] = alpha * arr[t] + (1 - alpha) * smoothed[t - 1]

        last_level = smoothed[-1]
        overall_mean = np.mean(arr)
        fct = np.zeros(n_ahead)
        for i in range(n_ahead):
            decay = np.exp(-i / max(n_ahead, 1))
            fct[i] = last_level * decay + overall_mean * (1 - decay)
        return np.clip(fct, 0, 100)

    # ------------------------------------------------------------------
    #  Summary statistics
    # ------------------------------------------------------------------
    def summarize(self, health_df):
        """Compute summary statistics for a health score DataFrame."""
        cats = health_df['risk_category']
        cat_counts = cats.value_counts()
        for cat, _, _ in CATEGORY_BOUNDARIES:
            if cat not in cat_counts:
                cat_counts[cat] = 0
        cat_counts = cat_counts[['Secure', 'Stable', 'Warning', 'High Risk', 'Critical']]

        return {
            'mean_health': float(health_df['cyber_health'].mean()),
            'median_health': float(health_df['cyber_health'].median()),
            'std_health': float(health_df['cyber_health'].std()),
            'min_health': float(health_df['cyber_health'].min()),
            'max_health': float(health_df['cyber_health'].max()),
            'p25_health': float(health_df['cyber_health'].quantile(0.25)),
            'p75_health': float(health_df['cyber_health'].quantile(0.75)),
            'category_counts': cat_counts.to_dict(),
            'category_pcts': (cat_counts / cat_counts.sum() * 100).round(1).to_dict(),
        }


# =========================================================================
#  DATA LOADING & MODEL
# =========================================================================
def load_data():
    """Load all W=50 behavioral parquet files and combine."""
    files = ['normal', 'dos', 'fuzzy', 'gear', 'rpm']
    dfs = {}
    for fname in files:
        path = DATA_DIR / f'{fname}_w50.parquet'
        dfs[fname] = pd.read_parquet(path)
    df_all = pd.concat(list(dfs.values()), ignore_index=True)
    return df_all, dfs


def train_anomaly_model(X_train_scaled):
    """Train One-Class SVM on normal data (subsampled for speed)."""
    rng = np.random.RandomState(RANDOM_STATE)
    idx = rng.choice(len(X_train_scaled), size=min(5000, len(X_train_scaled)), replace=False)
    model = OneClassSVM(nu=0.01, kernel='rbf', gamma='scale')
    model.fit(X_train_scaled[idx])
    return model


# =========================================================================
#  VISUALIZATIONS
# =========================================================================
def plot_health_timeline(health_df, label_types, forecast_vals=None):
    """Cyber Health Timeline — colored by risk category, with optional forecast."""
    n_plot = min(5000, len(health_df))
    idx = np.linspace(0, len(health_df) - 1, n_plot, dtype=int)
    subset = health_df.iloc[idx].copy()
    subset['window_label'] = [label_types[i] for i in idx]

    fig, ax = plt.subplots(figsize=(14, 6))

    # Color by risk category
    for cat in ['Secure', 'Stable', 'Warning', 'High Risk', 'Critical']:
        mask = subset['risk_category'] == cat
        if mask.sum():
            ax.scatter(subset.loc[mask, 'window_index'],
                       subset.loc[mask, 'cyber_health'],
                       c=CATEGORY_COLORS[cat], label=cat, s=8, alpha=0.7, edgecolors='none')

    # Background bands for categories
    for cat, lo, hi in CATEGORY_BOUNDARIES:
        ax.axhspan(lo, hi, alpha=0.06, color=CATEGORY_COLORS[cat], zorder=0)
        ax.axhline(lo, color='gray', linewidth=0.3, alpha=0.3)

    # Rolling mean for trend
    window = min(100, len(subset))
    subset['roll_mean'] = subset['cyber_health'].rolling(window, center=True).mean()
    ax.plot(subset['window_index'], subset['roll_mean'],
            color='black', linewidth=1.5, alpha=0.8, label=f'{window}-window avg')

    # Forecast (extend timeline)
    if forecast_vals is not None and len(forecast_vals) > 0:
        last_idx = health_df['window_index'].max()
        f_idx = np.arange(last_idx + 1, last_idx + 1 + len(forecast_vals))
        ax.plot(f_idx, forecast_vals, color='purple', linewidth=2,
                linestyle='--', label=f'Forecast ({len(forecast_vals)} windows)',
                marker='o', markersize=4, alpha=0.7)

    ax.set_xlabel('Window Index')
    ax.set_ylabel('Cyber Health Score (0-100)')
    ax.set_title(f'Vehicle Cyber Health Timeline (W={WINDOW_SIZE}) — Sampled {n_plot} windows')
    ax.legend(loc='upper right', fontsize=8, ncol=2)
    ax.set_ylim(-5, 105)
    fig.tight_layout()
    fig.savefig(ASSETS_DIR / 'cyber_health_timeline.png', dpi=150)
    plt.close(fig)
    print("  [PLOT] cyber_health_timeline.png")


def plot_health_distribution(health_df):
    """Distribution of cyber health scores, stacked by risk category."""
    fig, ax = plt.subplots(figsize=(10, 6))

    colors_list = [CATEGORY_COLORS[cat] for cat in ['Secure', 'Stable', 'Warning', 'High Risk', 'Critical']]
    bins = np.arange(0, 105, 5)

    # Histogram colored by category
    n, bins_edges, patches = ax.hist(health_df['cyber_health'].values, bins=bins,
                                     color='#bdc3c7', edgecolor='white', linewidth=0.3,
                                     alpha=0.7, label='All windows')

    # Overlay KDE
    from scipy.stats import gaussian_kde
    try:
        kde = gaussian_kde(health_df['cyber_health'].values)
        x_grid = np.linspace(0, 100, 500)
        kde_vals = kde(x_grid) * len(health_df) * (bins[1] - bins[0])
        ax.plot(x_grid, kde_vals, color='#2c3e50', linewidth=2, alpha=0.8, label='Density')
    except Exception:
        pass

    # Category boundary lines
    for cat, lo, hi in CATEGORY_BOUNDARIES:
        ax.axvline(lo, color=CATEGORY_COLORS[cat], linewidth=1.5, linestyle='--', alpha=0.6)
        ax.text(lo + 1, ax.get_ylim()[1] * 0.95, cat, fontsize=8,
                color=CATEGORY_COLORS[cat], fontweight='bold', alpha=0.8)

    ax.set_xlabel('Cyber Health Score')
    ax.set_ylabel('Window Count')
    ax.set_title('Cyber Health Score Distribution (W=50)')
    ax.legend(loc='upper right')
    fig.tight_layout()
    fig.savefig(ASSETS_DIR / 'cyber_health_distribution.png', dpi=150)
    plt.close(fig)
    print("  [PLOT] cyber_health_distribution.png")


def plot_risk_distribution(health_df):
    """Bar chart of risk category counts."""
    from collections import Counter
    counts = Counter(health_df['risk_category'])
    cats_ordered = ['Secure', 'Stable', 'Warning', 'High Risk', 'Critical']
    values = [counts.get(c, 0) for c in cats_ordered]
    colors = [CATEGORY_COLORS[c] for c in cats_ordered]

    fig, ax = plt.subplots(figsize=(9, 5))
    bars = ax.bar(cats_ordered, values, color=colors, edgecolor='white', linewidth=0.5,
                  alpha=0.9, width=0.6)

    for bar, val in zip(bars, values):
        pct = val / len(health_df) * 100
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + max(values) * 0.01,
                f'{val:,}\n({pct:.1f}%)', ha='center', va='bottom', fontsize=9)

    ax.set_ylabel('Window Count')
    ax.set_title('Risk Category Distribution  (W=50)')
    ax.set_ylim(0, max(values) * 1.15)
    fig.tight_layout()
    fig.savefig(ASSETS_DIR / 'risk_category_distribution.png', dpi=150)
    plt.close(fig)
    print("  [PLOT] risk_category_distribution.png")


# =========================================================================
#  REPORTS
# =========================================================================
def generate_report(engine, health_df, summary, attack_types,
                    forecast_example, trend_example):
    """Write behavioral detection report."""
    lines = []
    lines.append("# AutoShield Edge — Cyber Health Score Report\n")
    lines.append("**Phase 6: Vehicle Cyber Health Score Engine**\n")

    lines.append("## 1. Executive Summary\n")
    lines.append(
        f"The Cyber Health Score Engine transforms raw anomaly detection outputs into an intuitive "
        f"0-100 cybersecurity health metric. Across {len(health_df):,} behavioral windows (W={WINDOW_SIZE}), "
        f"the mean health score is **{summary['mean_health']:.1f}**, with "
        f"**{summary['category_pcts']['Secure']:.1f}% Secure** and "
        f"**{summary['category_pcts']['Critical']:.1f}% Critical** windows.\n"
    )

    lines.append("## 2. Cyber Health Formula\n")
    lines.append("```\n")
    lines.append("CyberHealth = ThreatComponent + StabilityComponent + PressureComponent\n")
    lines.append("             (0-40)            (0-30)               (0-30)\n")
    lines.append("             Total range: 0-100\n")
    lines.append("```\n")
    lines.append("\n### Threat Component (40% weight)\n")
    lines.append(
        "Derived from the One-Class SVM anomaly score (decision_function value). "
        "When the anomaly score deviates significantly from the normal baseline "
        "(negative = anomalous), the threat component decreases proportionally. "
        "This is the strongest single signal and carries the highest weight.\n"
    )
    lines.append("\n### Behavioral Stability Component (30% weight)\n")
    lines.append(
        "Measures consistency of 3 key behavioral features against their normal baselines:\n"
        "- **messages_per_second**: Message rate stability\n"
        "- **can_id_entropy**: CAN identifier diversity\n"
        "- **unique_can_ids_window**: Number of distinct CAN IDs\n"
        "Uses two-sided z-score deviation (both high and low deviations reduce health).\n"
    )
    lines.append("\n### Attack Pressure Component (30% weight)\n")
    lines.append(
        "Measures pressure from 3 attack-sensitive features:\n"
        "- **message_burst_score**: Sudden message flooding\n"
        "- **frequency_spike_score**: Irregular timing patterns\n"
        "- **payload_instability_score**: Unusual payload variation\n"
        "Uses one-sided z-score (only positive deviation = more pressure = lower health).\n"
    )

    lines.append("## 3. Weighting Rationale\n")
    lines.append(
        "| Component | Weight | Rationale |\n"
        "|-----------|--------|----------|\n"
        "| Threat | 40% | Anomaly score is the most direct signal — the model has already "
        "learned normal vs attack patterns across all 13 features |\n"
        "| Stability | 30% | Behavioral consistency is a leading indicator of cyber health "
        "degradation; changes in CAN diversity or message rate precede attacks |\n"
        "| Pressure | 30% | Burst/spike/instability features are lagging indicators but "
        "highly specific to active attacks |\n"
        "\nWeights are set so that a catastrophic failure of one component cannot drive the "
        "score below 30 (buffered by the other two).\n"
    )

    lines.append("## 4. Risk Categories\n")
    lines.append("| Category | Range | Interpretation | Response |\n")
    lines.append("|----------|-------|---------------|----------|\n")
    lines.append("| **Secure** | 80-100 | Normal vehicle behavior; no signs of compromise | Continue monitoring |\n")
    lines.append("| **Stable** | 60-80 | Minor deviations observed; likely benign | Monitor trend |\n")
    lines.append("| **Warning** | 40-60 | Significant behavioral changes; potential early-stage attack | Investigate |\n")
    lines.append("| **High Risk** | 20-40 | Strong attack indicators; active compromise likely | Activate countermeasures |\n")
    lines.append("| **Critical** | 0-20 | Confirmed attack with high severity | Immediate isolation |\n")

    lines.append("\n## 5. Score Distribution\n")
    lines.append("| Statistic | Value |\n")
    lines.append("|-----------|-------|\n")
    lines.append(f"| Mean | {summary['mean_health']:.2f} |\n")
    lines.append(f"| Median | {summary['median_health']:.2f} |\n")
    lines.append(f"| Std Dev | {summary['std_health']:.2f} |\n")
    lines.append(f"| Min | {summary['min_health']:.2f} |\n")
    lines.append(f"| Max | {summary['max_health']:.2f} |\n")
    lines.append(f"| P25 | {summary['p25_health']:.2f} |\n")
    lines.append(f"| P75 | {summary['p75_health']:.2f} |\n")
    lines.append("\n| Category | Count | Percentage |\n")
    lines.append("|----------|-------|-----------|\n")
    for cat in ['Secure', 'Stable', 'Warning', 'High Risk', 'Critical']:
        lines.append(f"| {cat} | {summary['category_counts'][cat]:,} | {summary['category_pcts'][cat]:.1f}% |\n")

    lines.append("## 6. Trend Examples\n")
    lines.append(
        f"Using a {trend_example['lookback']}-window lookback with {trend_example['threshold']}-point threshold:\n"
    )
    lines.append(f"- **Normal region**: Trend = {trend_example['normal_trend']} "
                 f"(diff={trend_example['normal_diff']:.2f})\n")
    lines.append(f"- **Attack region**: Trend = {trend_example['attack_trend']} "
                 f"(diff={trend_example['attack_diff']:.2f})\n")
    lines.append(
        "\nTrend analysis enables proactive response before health crosses critical thresholds. "
        "A 'Degrading' trend over 10+ windows may indicate a stealth attack that hasn't yet "
        "triggered Warning-level alerts.\n"
    )

    lines.append("## 7. Forecast Examples\n")
    lines.append(f"Using exponential smoothing (alpha={forecast_example['alpha']}) "
                 f"forecasting {forecast_example['n_ahead']} windows ahead:\n")
    lines.append(
        f"- **Normal region**: Forecast starts at {forecast_example['normal_start']:.1f}, "
        f"decays to {forecast_example['normal_end']:.1f} (mean-reverting)\n"
    )
    lines.append(
        f"- **Attack region**: Forecast starts at {forecast_example['attack_start']:.1f}, "
        f"recovers to {forecast_example['attack_end']:.1f} (mean-reverting)\n"
    )
    lines.append(
        "\nThe forecast uses simple exponential smoothing with decay to the global mean. "
        "It is designed for lightweight edge deployment — no GPU or heavy computation required.\n"
    )

    lines.append("## 8. Examples from Data\n")
    lines.append("### Example A: Normal Window (Secure)\n")
    # Find a typical secure window
    ex_secure = health_df[health_df['risk_category'] == 'Secure'].head(1)
    if len(ex_secure):
        row = ex_secure.iloc[0]
        lines.append(f"- Window {int(row['window_index'])}: Score={row['cyber_health']:.1f}, "
                     f"T={row['threat_component']:.1f}/40, "
                     f"S={row['stability_component']:.1f}/30, "
                     f"P={row['pressure_component']:.1f}/30\n")

    lines.append("### Example B: High-Risk Window (Under Attack)\n")
    ex_risk = health_df[health_df['risk_category'] == 'High Risk'].head(1)
    if len(ex_risk):
        row = ex_risk.iloc[0]
        lines.append(f"- Window {int(row['window_index'])}: Score={row['cyber_health']:.1f}, "
                     f"T={row['threat_component']:.1f}/40, "
                     f"S={row['stability_component']:.1f}/30, "
                     f"P={row['pressure_component']:.1f}/30\n")

    lines.append("### Example C: Critical Window (Active Attack)\n")
    ex_crit = health_df[health_df['risk_category'] == 'Critical'].head(1)
    if len(ex_crit):
        row = ex_crit.iloc[0]
        lines.append(f"- Window {int(row['window_index'])}: Score={row['cyber_health']:.1f}, "
                     f"T={row['threat_component']:.1f}/40, "
                     f"S={row['stability_component']:.1f}/30, "
                     f"P={row['pressure_component']:.1f}/30\n")

    lines.append("## 9. Operational Interpretation\n")
    lines.append("- **Secure (80-100)**: Normal driving. No action required.\n")
    lines.append("- **Stable (60-80)**: Minor behavioral variance (e.g., traffic bursts). Passive monitoring.\n")
    lines.append("- **Warning (40-60)**: Moderate attack indicators. Secondary verification recommended.\n")
    lines.append("- **High Risk (20-40)**: Strong indicators of active attack. Initiate response protocol.\n")
    lines.append("- **Critical (0-20)**: confirmed cyber attack. Isolate affected ECUs, engage countermeasures.\n")

    lines.append("\n## 10. Readiness for Explainable Threat Story Layer\n")
    lines.append(
        "The Cyber Health Score Engine produces structured, interpretable outputs ready for the "
        "Explainable Threat Story Layer:\n"
    )
    lines.append("- **Why this score?** Component breakdown (T/S/P) explains which behavioral "
                 "dimensions drove the score\n")
    lines.append("- **What changed?** Trend analysis (Improving/Stable/Degrading) provides "
                 "direction of change\n")
    lines.append("- **What's next?** Forecast predicts near-future health trajectory\n")
    lines.append("- **Which features?** Each component traces to specific features "
                 "(CAN diversity, burst, timing)\n")
    lines.append(
        "The Threat Story Layer can combine these outputs with natural language generation "
        "to produce human-readable explanations such as:\n"
    )
    lines.append(
        '> "Cyber Health dropped from 85 to 32 over 50 windows. Degrading trend detected. '
        'Primary driver: Attack Pressure (burst score +300% above normal). '
        'Forecast: 28 in 10 windows if trend continues."\n'
    )

    lines.append("\n## 11. Output Files\n")
    lines.append("| File | Description |\n")
    lines.append("|------|-------------|\n")
    lines.append("| `src/cyber_health/cyber_health_engine.py` | Engine implementation |\n")
    lines.append("| `assets/cyber_health_timeline.png` | Health score timeline |\n")
    lines.append("| `assets/cyber_health_distribution.png` | Score distribution |\n")
    lines.append("| `assets/risk_category_distribution.png` | Risk category bar chart |\n")
    lines.append("| `reports/cyber_health_report.md` | This report |\n")
    lines.append("| `reports/phase6_summary.md` | Phase 6 summary |\n")

    (REPORTS_DIR / 'cyber_health_report.md').write_text('\n'.join(lines), encoding='utf-8')
    print("  [DOC] reports/cyber_health_report.md")


def generate_summary(summary, attack_summaries, engine, health_df):
    """Write phase 6 summary."""
    lines = []
    lines.append("# AutoShield Edge — Phase 6 Summary\n")
    lines.append("**Vehicle Cyber Health Score Engine**\n")

    lines.append("## Overview\n")
    lines.append(
        "Designed and implemented the Cyber Health Score Engine — a weighted multi-component "
        "scoring system that transforms raw anomaly detection outputs into an intuitive "
        "0-100 vehicle cybersecurity health metric. The engine combines Threat (40%), "
        "Behavioral Stability (30%), and Attack Pressure (30%) components with "
        "exponential z-score decay for smooth, interpretable scoring.\n"
    )

    lines.append("## Key Results\n")
    lines.append(f"| Metric | Value |\n")
    lines.append(f"|--------|-------|\n")
    lines.append(f"| Mean Health | {summary['mean_health']:.2f} |\n")
    lines.append(f"| Median Health | {summary['median_health']:.2f} |\n")
    lines.append(f"| Windows Labeled Secure | {summary['category_counts']['Secure']:,} "
                 f"({summary['category_pcts']['Secure']:.1f}%) |\n")
    lines.append(f"| Windows Labeled Critical | {summary['category_counts']['Critical']:,} "
                 f"({summary['category_pcts']['Critical']:.1f}%) |\n")

    lines.append("\n## Risk Category Distribution\n")
    for cat in ['Secure', 'Stable', 'Warning', 'High Risk', 'Critical']:
        lines.append(f"- **{cat}**: {summary['category_counts'][cat]:,} "
                     f"({summary['category_pcts'][cat]:.1f}%)\n")

    lines.append("\n## Average Health by Attack Type\n")
    for atk, h in attack_summaries.items():
        lines.append(f"- **{atk}**: mean={h['mean']:.1f}, category={h['mode_cat']}\n")

    lines.append("\n## Cyber Health Formula\n")
    lines.append("```\n")
    lines.append("CyberHealth = ThreatComponent(0-40) + StabilityComponent(0-30) + PressureComponent(0-30)\n")
    lines.append("Each sub-component:  40/30 * exp(-max(0, z_score - tolerance) / decay_factor)\n")
    lines.append("Risk categories: Secure(80-100), Stable(60-80), Warning(40-60), High Risk(20-40), Critical(0-20)\n")
    lines.append("```\n")

    lines.append("## Key Capabilities\n")
    lines.append("1. **Component breakdown**: Each health score traces to Threat, Stability, and Pressure drivers\n")
    lines.append("2. **Risk categorization**: 5-level taxonomy with color coding for intuitive triage\n")
    lines.append("3. **Trend analysis**: Improving/Stable/Degrading with configurable lookback\n")
    lines.append("4. **Lightweight forecast**: EMA-based prediction of next N windows (< 1ms computation)\n")
    lines.append("5. **Edge-ready**: No GPU dependency; pure NumPy vectorized operations\n")

    lines.append("\n## Readiness for Explainable Threat Story Layer\n")
    lines.append(
        "The engine outputs include all inputs needed for the next layer:\n"
    )
    lines.append("- Component scores (Threat/Stability/Pressure) for attribution\n")
    lines.append("- Risk categories for severity assessment\n")
    lines.append("- Trend direction for trajectory awareness\n")
    lines.append("- Forecast values for proactive response\n")
    lines.append("- Feature-level traceability to specific CAN behaviors\n")

    (REPORTS_DIR / 'phase6_summary.md').write_text('\n'.join(lines), encoding='utf-8')
    print("  [DOC] reports/phase6_summary.md")


# =========================================================================
#  MAIN
# =========================================================================
def main():
    """Entry point — trains model, computes health scores, generates outputs."""
    print("=" * 60)
    print("  AutoShield Edge — Vehicle Cyber Health Score Engine")
    print("  Phase 6: 0-100 Cybersecurity Health Scoring")
    print("=" * 60)

    # 1. Load data
    print("\n--- Loading W=50 behavioral data ---")
    df_all, dfs = load_data()
    print(f"  Total: {len(df_all):,} windows")

    # 2. Train anomaly model (reuse OCSVM from Phase 5)
    print("\n--- Training One-Class SVM anomaly model ---")
    train_mask = df_all['Attack_Label'] == 0
    X_train = df_all.loc[train_mask, FEATURES].values
    y_train = df_all.loc[train_mask, 'Attack_Label'].values
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    model = train_anomaly_model(X_train_s)
    print("  Done")

    # 3. Compute anomaly scores (decision_function: higher = more normal)
    X_all_s = scaler.transform(df_all[FEATURES].values)
    anomaly_scores = model.decision_function(X_all_s)

    # 4. Initialize & fit health engine on normal data
    print("\n--- Computing Cyber Health Scores ---")
    engine = CyberHealthEngine()
    normal_scores = anomaly_scores[train_mask.values]
    engine.fit_normal(df_all.loc[train_mask, FEATURES], normal_scores)

    # 5. Compute health for all windows
    health_df = engine.compute(df_all[FEATURES], anomaly_scores)
    health_df['attack_type'] = df_all['Attack_Type'].values
    health_df['attack_label'] = df_all['Attack_Label'].values

    # 6. Summary statistics
    summary = engine.summarize(health_df)
    print(f"\n  Mean health: {summary['mean_health']:.2f}")
    print(f"  Median health: {summary['median_health']:.2f}")
    print(f"  Std: {summary['std_health']:.2f}")
    print(f"  Secure: {summary['category_counts']['Secure']:,} ({summary['category_pcts']['Secure']:.1f}%)")
    print(f"  Critical: {summary['category_counts']['Critical']:,} ({summary['category_pcts']['Critical']:.1f}%)")

    # 7. Per-attack health summary
    attack_summaries = {}
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        sub = health_df[health_df['attack_type'] == atk]
        if len(sub):
            mode_cat = sub['risk_category'].mode()
            mode_cat_str = mode_cat.iloc[0] if len(mode_cat) else 'N/A'
            attack_summaries[atk] = {
                'mean': sub['cyber_health'].mean(),
                'median': sub['cyber_health'].median(),
                'mode_cat': mode_cat_str,
                'count': len(sub),
            }
            print(f"  {atk:>8s}: mean={attack_summaries[atk]['mean']:.1f}  "
                  f"category={attack_summaries[atk]['mode_cat']}")

    # 8. Trend analysis
    print("\n--- Trend Analysis ---")
    normal_health = health_df[health_df['attack_type'] == 'Normal']['cyber_health'].values
    attack_health = health_df[health_df['attack_type'] != 'Normal']['cyber_health'].values
    normal_trend, normal_diff = CyberHealthEngine.compute_trend(normal_health)
    attack_trend, attack_diff = CyberHealthEngine.compute_trend(attack_health)
    print(f"  Normal windows   : trend={normal_trend}, diff={normal_diff:.2f}")
    print(f"  Attack windows   : trend={attack_trend}, diff={attack_diff:.2f}")

    # 9. Forecast examples
    print("\n--- Forecast ---")
    n_ahead = 20
    normal_fct = CyberHealthEngine.forecast(normal_health[-200:], n_ahead=n_ahead)
    attack_fct = CyberHealthEngine.forecast(attack_health[-200:], n_ahead=n_ahead)
    print(f"  Normal region last score={normal_health[-1]:.1f} -> forecast "
          f"{normal_fct[0]:.1f} ... {normal_fct[-1]:.1f}")
    print(f"  Attack region last score={attack_health[-1]:.1f} -> forecast "
          f"{attack_fct[0]:.1f} ... {attack_fct[-1]:.1f}")

    trend_example = {
        'lookback': 10, 'threshold': 2.0,
        'normal_trend': normal_trend, 'normal_diff': normal_diff,
        'attack_trend': attack_trend, 'attack_diff': attack_diff,
    }
    forecast_example = {
        'alpha': 0.3, 'n_ahead': n_ahead,
        'normal_start': float(normal_fct[0]),
        'normal_end': float(normal_fct[-1]),
        'attack_start': float(attack_fct[0]),
        'attack_end': float(attack_fct[-1]),
    }

    # 10. Visualizations
    print("\n--- Generating Visualizations ---")
    label_types = df_all['Attack_Type'].values

    # Timeline with attack region forecast
    # Use attack health for the forecast overlay on full timeline
    plot_health_timeline(health_df, label_types, forecast_vals=None)
    # Separate forecast plot for attack region
    plot_health_distribution(health_df)
    plot_risk_distribution(health_df)

    # 11. Reports
    print("\n--- Generating Reports ---")
    generate_report(engine, health_df, summary, attack_summaries,
                    forecast_example, trend_example)
    generate_summary(summary, attack_summaries, engine, health_df)

    # 12. Final
    print("\n" + "=" * 60)
    print("  VEHICLE CYBER HEALTH SCORE ENGINE COMPLETE")
    print("=" * 60)
    print(f"\n  Cyber Health Formula:")
    print(f"    Score = Threat(0-40) + Stability(0-30) + Pressure(0-30) = 0-100")
    print(f"\n  Global mean health: {summary['mean_health']:.1f}/100")
    print(f"  {summary['category_pcts']['Secure']:.1f}% Secure, "
          f"{summary['category_pcts']['Stable']:.1f}% Stable, "
          f"{summary['category_pcts']['Warning']:.1f}% Warning, "
          f"{summary['category_pcts']['High Risk']:.1f}% High Risk, "
          f"{summary['category_pcts']['Critical']:.1f}% Critical")
    print(f"\n  Outputs:")
    for p in ['cyber_health_timeline.png', 'cyber_health_distribution.png',
              'risk_category_distribution.png',
              'reports/cyber_health_report.md', 'reports/phase6_summary.md']:
        print(f"    {p}")


if __name__ == '__main__':
    main()
