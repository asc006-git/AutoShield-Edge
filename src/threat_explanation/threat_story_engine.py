#!/usr/bin/env python3
"""
AutoShield Edge — Phase 7: Explainable Threat Story Engine
===========================================================
Transforms raw anomaly detection and cyber health scores into
structured, human-readable cybersecurity narratives.

Designed for three audiences:
  — Driver: Simple, actionable alerts
  — Fleet Manager: Root cause + trend context
  — Vehicle Engineer: Feature-level attribution + forecast

Outputs:
  - ThreatStory JSON (structured, machine-readable)
  - Narrative text (human-readable templates)
"""

import numpy as np
import pandas as pd
import json
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

# =========================================================================
#  CONFIG
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

TRACKED_FEATURES = [
    'messages_per_second',
    'unique_can_ids_window',
    'can_id_entropy',
    'message_burst_score',
    'frequency_spike_score',
    'payload_instability_score',
    'anomaly_score',
]

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / 'data' / 'behavioral'
ASSETS_DIR = BASE_DIR / 'assets'
REPORTS_DIR = BASE_DIR / 'reports'

# Feature display names for narrative generation
FEATURE_LABELS = {
    'messages_per_second':      'CAN message rate',
    'unique_can_ids_window':    'CAN ID diversity',
    'can_id_entropy':           'CAN identifier entropy',
    'message_burst_score':      'message burst activity',
    'frequency_spike_score':    'timing irregularity',
    'payload_instability_score':'payload variation',
    'anomaly_score':            'overall anomaly signal',
}

FEATURE_AUDIENCES = {
    'messages_per_second':      'technician',
    'unique_can_ids_window':    'driver',
    'can_id_entropy':           'analyst',
    'message_burst_score':      'analyst',
    'frequency_spike_score':    'analyst',
    'payload_instability_score':'technician',
    'anomaly_score':            'fleet_manager',
}

# =========================================================================
#  SEVERITY-AWARE NARRATIVE TEMPLATES
# =========================================================================
TEMPLATES = {
    'Secure': {
        'threat_summary': (
            "Vehicle cybersecurity status is Secure. No anomalous activity detected."
        ),
        'trend_description': (
            "Cyber Health is {health:.0f}/100 and {trend_lower} over the last {lookback} windows. "
            "All monitoring dimensions show normal behavior."
        ),
        'root_cause': (
            "No significant deviations detected. All features within expected operating ranges."
        ),
        'forecast': (
            "Projected to remain Secure at {forecast_value:.0f}/100 over the next {n_forecast} windows."
        ),
        'response': (
            "No action required. Continue passive monitoring."
        ),
    },
    'Stable': {
        'threat_summary': (
            "Vehicle cybersecurity status is Stable. Minor behavioral variance detected, "
            "consistent with normal driving conditions."
        ),
        'trend_description': (
            "Cyber Health is {health:.0f}/100 and {trend_lower} over the last {lookback} windows."
        ),
        'root_cause': (
            "Slight deviation in {primary_feature} ({primary_z:+.1f} sigma from baseline). "
            "No immediate threat indicators present."
        ),
        'forecast': (
            "Projected health of {forecast_value:.0f}/100. Expected to remain Stable with "
            "no escalation to Warning level."
        ),
        'response': (
            "Monitor trend over the next 20 windows. No intervention required at this time."
        ),
    },
    'Warning': {
        'threat_summary': (
            "Vehicle cybersecurity status is Warning. Moderate behavioral anomalies detected "
            "that deviate from normal operating patterns."
        ),
        'trend_description': (
            "Cyber Health declined to {health:.0f}/100 and is {trend_lower} over the last {lookback} windows. "
            "Primary concern: {primary_component} component."
        ),
        'root_cause': (
            "Primary driver: {primary_component} — {primary_feature} is {primary_z:+.1f} sigma "
            "from normal baseline. Secondary contributor: {secondary_component}."
        ),
        'forecast': (
            "Forecast indicates health may reach {forecast_value:.0f}/100 within {n_forecast} windows "
            "if the current trajectory continues."
        ),
        'response': (
            "Investigate root cause. Cross-reference with vehicle diagnostics. "
            "Prepare countermeasure playbook if trend degrades further."
        ),
    },
    'High Risk': {
        'threat_summary': (
            "HIGH RISK: Strong indicators of active cyber attack detected. "
            "Vehicle cybersecurity is compromised — immediate attention required."
        ),
        'trend_description': (
            "Cyber Health dropped to {health:.0f}/100 and is {trend_lower} over the last {lookback} windows. "
            "Primary concern: {primary_component} component ({component_pct:.0f}% of normal)."
        ),
        'root_cause': (
            "Attack signature detected. Primary driver: {primary_component} — "
            "{primary_feature} at {primary_z:+.1f} sigma from normal "
            "({primary_direction}). Secondary feature: {secondary_feature} "
            "at {secondary_z:+.1f} sigma."
        ),
        'forecast': (
            "Critical escalation risk. Health projected at {forecast_value:.0f}/100 "
            "in {n_forecast} windows — may cross into Critical range."
        ),
        'response': (
            "ACTIVATE COUNTERMEASURES: Isolate suspected ECUs. "
            "Enable rate-limiting on CAN bus. Alert fleet operator. "
            "Log forensic data for post-incident analysis."
        ),
    },
    'Critical': {
        'threat_summary': (
            "CRITICAL: Confirmed cyber attack in progress. "
            "Vehicle cybersecurity health is at a dangerous level."
        ),
        'trend_description': (
            "Cyber Health is {health:.0f}/100 — Critical level. "
            "Health has {trend_lower} by {trend_magnitude:.0f} points over the last {lookback} windows."
        ),
        'root_cause': (
            "Confirmed attack pattern. Primary driver: {primary_component} — "
            "{primary_feature} at {primary_z:+.1f} sigma from normal "
            "({primary_direction}). Multiple features outside safe bounds: "
            "{feature_list}."
        ),
        'forecast': (
            "Health projected to remain at {forecast_value:.0f}/100 or lower. "
            "Immediate intervention required to prevent system compromise."
        ),
        'response': (
            "EMERGENCY RESPONSE: Isolate vehicle from network. "
            "Engage fail-safe mode on all ECUs. "
            "Initiate forensic data capture. "
            "Alert security operations center."
        ),
    },
}

# Attack scenario templates
ATTACK_TEMPLATES = {
    'DoS': {
        'attack_type': 'Denial of Service',
        'mechanism': 'CAN bus flooding with high-priority messages',
        'signature': 'elevated message rate with reduced CAN ID diversity',
        'impact': 'bandwidth exhaustion, ECU denial of service',
        'mitigation': 'rate-limiting gateway filter, suspect ECU isolation',
    },
    'Fuzzy': {
        'attack_type': 'Fuzzy',
        'mechanism': 'Randomized CAN ID and payload injection',
        'signature': 'abnormal CAN ID diversity and entropy',
        'impact': 'unpredictable ECU behavior, potential system crash',
        'mitigation': 'CAN ID whitelist, payload validation gateway',
    },
    'Gear': {
        'attack_type': 'Gear Spoofing',
        'mechanism': 'Fabricated gear position messages',
        'signature': 'timing irregularity with payload manipulation',
        'impact': 'erratic transmission behavior, safety risk',
        'mitigation': 'plausibility checks, sensor cross-validation',
    },
    'RPM': {
        'attack_type': 'RPM Spoofing',
        'mechanism': 'Fabricated engine RPM messages',
        'signature': 'timing irregularity with payload manipulation',
        'impact': 'erratic engine control, safety risk',
        'mitigation': 'plausibility checks, sensor cross-validation',
    },
}


# =========================================================================
#  HEALTHINESS FUNCTION (reused from Phase 6)
# =========================================================================
def compute_healthiness(values, mean, std, direction='both', tolerance=0.2, decay=1.5):
    """Vectorized 0-1 healthiness via exponential z-score decay."""
    z = (values - mean) / std
    if direction == 'positive':
        z = np.maximum(0.0, z - tolerance)
    elif direction == 'negative':
        z = np.maximum(0.0, -z - tolerance)
    else:
        z = np.maximum(0.0, np.abs(z) - tolerance)
    return np.exp(-z / decay)


# =========================================================================
#  THREAT STORY ENGINE
# =========================================================================
class ThreatStoryEngine:
    """Generates structured explanations and narratives for vehicle cyber health.

    Pipeline:
      1. Receive feature values, health scores, anomaly scores for a window/segment
      2. Compute root-cause attribution (feature-level z-scores + healthiness)
      3. Select severity-aware template
      4. Fill template with computed values
      5. Return structured ThreatStory (JSON + narrative)
    """

    def __init__(self, normal_stats=None, lookback=10, n_forecast=20):
        self.normal_stats = normal_stats
        self.lookback = lookback
        self.n_forecast = n_forecast

    # ------------------------------------------------------------------
    #  Root-Cause Attribution
    # ------------------------------------------------------------------
    def attribute_root_cause(self, features_row, health_comp, anomaly_score):
        """Determine which features and components drive the threat story.

        Returns dict with:
          - primary_component: Threat / Stability / Pressure
          - primary_feature: name of the most deviant feature
          - primary_z: z-score of that feature
          - primary_direction: above/below normal
          - top_features: ranked list of (feature_name, z_score, healthiness)
          - all_attributions: per-feature dict
        """
        s = self.normal_stats
        attributions = {}

        # --- Per-feature z-scores and healthiness ---
        for feat in TRACKED_FEATURES:
            if feat == 'anomaly_score':
                val = anomaly_score
                m, sig = s['anomaly_score']
                z = (val - m) / sig
                # For anomaly_score, negative = anomalous (below normal mean)
                direction = 'negative'
                health = compute_healthiness(
                    np.array([val]), m, sig, direction='negative', tolerance=0.2
                )[0]
            elif feat in STABILITY_FEATURES:
                val = features_row[feat]
                m, sig = s[feat]
                z = (val - m) / sig
                direction = 'both'
                health = compute_healthiness(
                    np.array([val]), m, sig, direction='both', tolerance=0.2
                )[0]
            else:  # pressure features
                val = features_row[feat]
                m, sig = s[feat]
                z = (val - m) / sig
                direction = 'positive'
                health = compute_healthiness(
                    np.array([val]), m, sig, direction='positive', tolerance=0.2
                )[0]

            attributions[feat] = {
                'value': float(val),
                'z_score': float(round(z, 3)),
                'healthiness': float(round(health, 4)),
                'deviation_direction': (
                    'above normal' if z > 0.5 else
                    'below normal' if z < -0.5 else
                    'within normal range'
                ),
            }

        # Rank features by how much they contribute to health degradation
        # (1 - healthiness = sickness; higher = more contributing)
        ranked = sorted(
            attributions.items(),
            key=lambda kv: -(1 - kv[1]['healthiness'])
        )

        # --- Component-level analysis ---
        # Threat component health = anomaly_score healthiness
        threat_health = attributions['anomaly_score']['healthiness']

        # Stability component health = average of 3 stability sub-healthiness values
        stab_vals = [attributions[f]['healthiness'] for f in STABILITY_FEATURES]
        stab_health = float(np.mean(stab_vals))

        # Pressure component health = average of 3 pressure sub-healthiness values
        pres_vals = [attributions[f]['healthiness'] for f in PRESSURE_FEATURES]
        pres_health = float(np.mean(pres_vals))

        # Determine which component is the weakest
        components = {
            'Threat':    threat_health,
            'Stability': stab_health,
            'Pressure':  pres_health,
        }
        primary_comp = min(components, key=components.get)

        # Within the primary component, find the weakest feature
        if primary_comp == 'Threat':
            primary_feat = 'anomaly_score'
        elif primary_comp == 'Stability':
            primary_feat = min(
                STABILITY_FEATURES,
                key=lambda f: attributions[f]['healthiness']
            )
        else:
            primary_feat = min(
                PRESSURE_FEATURES,
                key=lambda f: attributions[f]['healthiness']
            )

        # Secondary component (second weakest)
        sorted_comps = sorted(components.items(), key=lambda kv: kv[1])
        secondary_comp = sorted_comps[1][0]

        # Build feature list for narrative
        unhealthy_features = [
            f for f, a in attributions.items()
            if a['healthiness'] < 0.5
        ]

        return {
            'primary_component': primary_comp,
            'primary_feature': primary_feat,
            'primary_z': attributions[primary_feat]['z_score'],
            'primary_direction': attributions[primary_feat]['deviation_direction'],
            'primary_healthiness': attributions[primary_feat]['healthiness'],
            'secondary_component': secondary_comp,
            'secondary_feature': ranked[1][0] if len(ranked) > 1 else primary_feat,
            'secondary_z': ranked[1][1]['z_score'] if len(ranked) > 1 else 0,
            'component_health': components,
            'unhealthy_features': unhealthy_features,
            'ranked_features': [
                {'feature': f, 'z_score': a['z_score'],
                 'healthiness': a['healthiness'],
                 'label': FEATURE_LABELS.get(f, f)}
                for f, a in ranked
            ],
            'all_attributions': attributions,
        }

    # ------------------------------------------------------------------
    #  Story Generation
    # ------------------------------------------------------------------
    def generate_story(self, window_idx, features_row, anomaly_score,
                       health_score, health_components, risk_category,
                       trend_label, trend_diff, forecast_values):
        """Generate a complete ThreatStory for a single window.

        Parameters
        ----------
        window_idx : int — window index in the dataset
        features_row : pd.Series or dict — feature values for this window
        anomaly_score : float — OCSVM decision_function value
        health_score : float — 0-100 cyber health score
        health_components : dict — {'threat':, 'stability':, 'pressure':}
        risk_category : str — Secure/Stable/Warning/High Risk/Critical
        trend_label : str — Improving/Stable/Degrading
        trend_diff : float — magnitude of trend difference
        forecast_values : np.ndarray — predicted future health scores

        Returns dict with all story fields.
        """
        # Root cause
        root = self.attribute_root_cause(features_row, health_components, anomaly_score)

        # Template selection
        template = TEMPLATES.get(risk_category, TEMPLATES['Warning'])

        # Determine attack type if applicable
        is_normal = features_row.get('Attack_Type') == 'Normal' if hasattr(features_row, 'get') else True
        attack_type = features_row.get('Attack_Type', 'Unknown') if hasattr(features_row, 'get') else 'Unknown'
        attack_info = ATTACK_TEMPLATES.get(attack_type, None)

        # Future forecast value (end of forecast horizon)
        forecast_val = float(np.mean(forecast_values)) if len(forecast_values) > 0 else health_score

        # Template values
        tvals = {
            'health': health_score,
            'trend': trend_label,
            'trend_lower': trend_label.lower(),
            'trend_magnitude': abs(trend_diff),
            'lookback': self.lookback,
            'n_forecast': self.n_forecast,
            'forecast_value': forecast_val,
            'primary_component': root['primary_component'],
            'primary_feature': FEATURE_LABELS.get(root['primary_feature'], root['primary_feature']),
            'primary_z': root['primary_z'],
            'primary_direction': root['primary_direction'],
            'secondary_component': root['secondary_component'],
            'secondary_feature': FEATURE_LABELS.get(
                root.get('secondary_feature', root['primary_feature']),
                root.get('secondary_feature', root['primary_feature'])
            ),
            'secondary_z': root.get('secondary_z', 0),
            'component_pct': root['component_health'].get(root['primary_component'], 0) * 100,
            'feature_list': ', '.join(
                [FEATURE_LABELS.get(f, f) for f in root['unhealthy_features'][:5]]
            ) or 'none',
        }

        # Build narrative sections
        summary = template['threat_summary']
        trend_desc = template['trend_description'].format(**tvals)
        root_cause = template['root_cause'].format(**tvals)
        forecast_desc = template['forecast'].format(**tvals)
        response = template['response'].format(**tvals)

        # Full narrative
        if risk_category in ('Secure', 'Stable'):
            narrative = f"{summary} {trend_desc}"
        else:
            # Add attack-specific context if available
            if attack_info and risk_category != 'Secure':
                attack_context = (
                    f"Pattern matches {attack_info['attack_type']} attack: "
                    f"{attack_info['signature']}. Impact: {attack_info['impact']}."
                )
                narrative = (
                    f"{summary} {trend_desc} "
                    f"{attack_context} "
                    f"Root cause: {root_cause} "
                    f"{forecast_desc} "
                    f"Recommended: {response}"
                )
            else:
                narrative = (
                    f"{summary} {trend_desc} "
                    f"Root cause: {root_cause} "
                    f"{forecast_desc} "
                    f"Recommended: {response}"
                )

        # Build structured story
        story = {
            'metadata': {
                'engine': 'AutoShield Edge Threat Story Engine v1',
                'generated_at': datetime.now().isoformat(),
                'window_index': int(window_idx),
                'window_size': WINDOW_SIZE,
            },
            'threat_summary': summary,
            'risk_category': risk_category,
            'health_score': float(round(health_score, 2)),
            'trend': {
                'label': trend_label,
                'magnitude': float(round(trend_diff, 2)),
                'description': trend_desc,
            },
            'root_cause_analysis': {
                'primary_component': root['primary_component'],
                'component_breakdown': {
                    comp: float(round(health, 4))
                    for comp, health in root['component_health'].items()
                },
                'primary_feature': {
                    'name': root['primary_feature'],
                    'label': FEATURE_LABELS.get(root['primary_feature'], root['primary_feature']),
                    'z_score': root['primary_z'],
                    'deviation': root['primary_direction'],
                },
                'feature_attributions': {
                    f: {
                        'label': FEATURE_LABELS.get(f, f),
                        'z_score': a['z_score'],
                        'healthiness': a['healthiness'],
                    }
                    for f, a in root['all_attributions'].items()
                },
                'root_cause_text': root_cause,
            },
            'future_risk_forecast': {
                'horizon_windows': self.n_forecast,
                'projected_health': float(round(forecast_val, 2)),
                'forecast_text': forecast_desc,
            },
            'recommended_response': response,
            'attack_context': {
                'attack_type': attack_type,
                'attack_info': attack_info,
            } if attack_info and risk_category not in ('Secure', 'Stable') else None,
            'narrative': narrative,
        }

        return story

    # ------------------------------------------------------------------
    #  Output Formatters
    # ------------------------------------------------------------------
    @staticmethod
    def to_json(story, indent=2):
        """Serialize story to JSON string."""
        return json.dumps(story, indent=indent, default=str)

    @staticmethod
    def to_narrative(story):
        """Extract human-readable narrative from story dict."""
        return story['narrative']

    @staticmethod
    def to_short_alert(story):
        """One-line alert for driver display."""
        cat = story['risk_category']
        health = story['health_score']
        if cat == 'Secure':
            return f"Cyber Health: {health:.0f}/100 — All clear."
        elif cat == 'Stable':
            return f"Cyber Health: {health:.0f}/100 — Minor variations, monitoring."
        elif cat == 'Warning':
            driver = story['root_cause_analysis']['primary_component']
            return f"Cyber Health: {health:.0f}/100 — Warning. {driver} anomaly detected. Investigate."
        elif cat == 'High Risk':
            feat = story['root_cause_analysis']['primary_feature']['label']
            return f"ALERT: Cyber Health {health:.0f}/100 — High Risk. {feat} severely abnormal. Action required."
        else:
            return f"CRITICAL: Cyber Health {health:.0f}/100 — Attack confirmed. Emergency response active."


# =========================================================================
#  DATA LOADING HELPERS
# =========================================================================
def load_all_data():
    """Load behavioral data, train OCSVM, compute health scores + story data."""
    print("Loading W=50 behavioral data...")
    files = ['normal', 'dos', 'fuzzy', 'gear', 'rpm']
    dfs = {}
    for fname in files:
        dfs[fname] = pd.read_parquet(DATA_DIR / f'{fname}_w50.parquet')
    df_all = pd.concat(list(dfs.values()), ignore_index=True)
    print(f"  Total: {len(df_all):,} windows")

    print("Training One-Class SVM...")
    train_mask = df_all['Attack_Label'] == 0
    scaler = StandardScaler()
    X_all_s = scaler.fit_transform(df_all[FEATURES])
    model = OneClassSVM(nu=0.01, kernel='rbf', gamma='scale')
    rng = np.random.RandomState(RANDOM_STATE)
    idx = rng.choice(X_all_s[train_mask.values].shape[0], 5000, replace=False)
    model.fit(X_all_s[train_mask.values][idx])
    anomaly_scores = model.decision_function(X_all_s)

    print("Fitting health engine...")
    n = df_all[train_mask]
    normal_stats = {}
    for f in FEATURES:
        normal_stats[f] = (n[f].mean(), n[f].std())
    normal_stats['anomaly_score'] = (
        anomaly_scores[train_mask.values].mean(),
        anomaly_scores[train_mask.values].std()
    )

    # Health scores using Phase 6 formula
    decay = 1.5
    tol = 0.2

    def health(vals, m, s, direction, tolerance=tol):
        z = (vals - m) / s
        if direction == 'positive':
            z = np.maximum(0.0, z - tolerance)
        elif direction == 'negative':
            z = np.maximum(0.0, -z - tolerance)
        else:
            z = np.maximum(0.0, np.abs(z) - tolerance)
        return np.exp(-z / decay)

    s = normal_stats
    th = health(anomaly_scores, s['anomaly_score'][0], s['anomaly_score'][1], 'negative')
    tcomp = th * 40

    stab = np.zeros((len(df_all), 3))
    for j, f in enumerate(['messages_per_second', 'can_id_entropy', 'unique_can_ids_window']):
        stab[:, j] = health(df_all[f].values, s[f][0], s[f][1], 'both')
    scomp = np.mean(stab, axis=1) * 30

    pres = np.zeros((len(df_all), 3))
    for j, f in enumerate(['message_burst_score', 'frequency_spike_score', 'payload_instability_score']):
        pres[:, j] = health(df_all[f].values, s[f][0], s[f][1], 'positive')
    pcomp = np.mean(pres, axis=1) * 30

    cyber_health = np.clip(tcomp + scomp + pcomp, 0, 100)

    # Risk categories
    cats = []
    for sc in cyber_health:
        if sc >= 80:       cats.append('Secure')
        elif sc >= 60:     cats.append('Stable')
        elif sc >= 40:     cats.append('Warning')
        elif sc >= 20:     cats.append('High Risk')
        else:              cats.append('Critical')

    health_df = pd.DataFrame({
        'window_index': np.arange(len(df_all)),
        'cyber_health': cyber_health,
        'threat_component': tcomp,
        'stability_component': scomp,
        'pressure_component': pcomp,
        'risk_category': cats,
        'attack_type': df_all['Attack_Type'],
        'attack_label': df_all['Attack_Label'],
    })

    return df_all, health_df, anomaly_scores, normal_stats


def find_example_windows(health_df, df_all, anomaly_scores):
    """Find representative windows for each attack type."""
    examples = {}
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        # Pick window where health score is near the category centroid for this attack
        mask = health_df['attack_type'] == atk
        sub = health_df[mask]
        if len(sub) == 0:
            continue
        # Pick the window closest to the mean health for this attack type
        mean_h = sub['cyber_health'].mean()
        best_idx = sub.iloc[np.argmin(np.abs(sub['cyber_health'] - mean_h))]['window_index']

        # Also try to find a more extreme/interesting example
        # For attacks, find a window that is in a low health category
        if atk != 'Normal':
            extreme_mask = mask & (health_df['risk_category'].isin(['High Risk', 'Critical']))
            if extreme_mask.sum() > 0:
                extreme_sub = health_df[extreme_mask]
                # Pick the median of the extreme windows
                med_h = extreme_sub['cyber_health'].median()
                best_idx = extreme_sub.iloc[np.argmin(np.abs(extreme_sub['cyber_health'] - med_h))]['window_index']

        examples[atk] = {
            'window_idx': int(best_idx),
            'features': df_all.iloc[best_idx],
            'health': health_df[health_df['window_index'] == best_idx].iloc[0],
            'anomaly_score': float(anomaly_scores[best_idx]),
        }
    return examples


# =========================================================================
#  MAIN
# =========================================================================
def main():
    print("=" * 60)
    print("  AutoShield Edge — Explainable Threat Story Engine")
    print("  Phase 7: Structured Cybersecurity Narratives")
    print("=" * 60)

    # 1. Load data & compute health scores
    df_all, health_df, anomaly_scores, normal_stats = load_all_data()

    # 2. Compute trends and forecasts for each attack region
    print("\n--- Computing trends & forecasts ---")
    lookback = 10
    n_forecast = 20

    region_trends = {}
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        mask = health_df['attack_type'] == atk
        scores = health_df.loc[mask, 'cyber_health'].values
        if len(scores) < lookback * 2:
            continue

        # Trend
        recent = np.mean(scores[-lookback:])
        prev = np.mean(scores[-(lookback * 2):-lookback])
        diff = recent - prev
        if diff > 2:
            trend = 'Improving'
        elif diff < -2:
            trend = 'Degrading'
        else:
            trend = 'Stable'

        # Forecast (simple exponential smoothing)
        smoothed = np.zeros_like(scores)
        smoothed[0] = scores[0]
        for t in range(1, len(scores)):
            smoothed[t] = 0.3 * scores[t] + 0.7 * smoothed[t - 1]
        last = smoothed[-1]
        overall_mean = np.mean(scores)
        fct = np.zeros(n_forecast)
        for i in range(n_forecast):
            decay = np.exp(-i / max(n_forecast, 1))
            fct[i] = last * decay + overall_mean * (1 - decay)
        fct = np.clip(fct, 0, 100)

        region_trends[atk] = {
            'trend': trend,
            'diff': float(round(diff, 2)),
            'forecast': fct,
            'mean_health': float(round(np.mean(scores), 2)),
        }
        print(f"  {atk:>8s}: trend={trend:>10s}  diff={diff:+.2f}  health={region_trends[atk]['mean_health']:.1f}")

    # 3. Find example windows
    print("\n--- Selecting example windows ---")
    examples = find_example_windows(health_df, df_all, anomaly_scores)
    for atk in examples:
        ex = examples[atk]
        print(f"  {atk:>8s}: window {ex['window_idx']}, health={ex['health']['cyber_health']:.1f}, "
              f"category={ex['health']['risk_category']}")

    # 4. Generate stories for each example
    print("\n--- Generating Threat Stories ---")
    engine = ThreatStoryEngine(normal_stats=normal_stats, lookback=lookback, n_forecast=n_forecast)

    all_stories = {}
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        if atk not in examples:
            continue
        ex = examples[atk]
        health_row = ex['health']

        # Get trend for this attack type
        rt = region_trends.get(atk, {'trend': 'Stable', 'diff': 0, 'forecast': np.full(n_forecast, 50)})

        story = engine.generate_story(
            window_idx=ex['window_idx'],
            features_row=ex['features'],
            anomaly_score=ex['anomaly_score'],
            health_score=health_row['cyber_health'],
            health_components={
                'threat': health_row['threat_component'] / 40,
                'stability': health_row['stability_component'] / 30,
                'pressure': health_row['pressure_component'] / 30,
            },
            risk_category=health_row['risk_category'],
            trend_label=rt['trend'],
            trend_diff=rt['diff'],
            forecast_values=rt['forecast'],
        )
        all_stories[atk] = story

        print(f"\n  --- {atk.upper()} Threat Story ---")
        print(f"  Category: {story['risk_category']} ({story['health_score']:.0f}/100)")
        print(f"  Summary: {story['threat_summary'][:80]}...")
        print(f"  Root cause: {story['root_cause_analysis']['root_cause_text'][:80]}...")
        print(f"  Response: {story['recommended_response'][:80]}...")

    # 5. Save example stories as JSON
    stories_json = {}
    for atk, story in all_stories.items():
        stories_json[atk.lower()] = story
    # Remove 'window_index' from individual stories for cleaner output
    for atk in stories_json:
        stories_json[atk].pop('window_index', None)

    json_path = REPORTS_DIR / 'threat_stories.json'
    with open(json_path, 'w') as f:
        json.dump(stories_json, f, indent=2, default=str)
    print(f"\n  [JSON] {json_path}")

    # 6. Print example narratives
    print("\n\n" + "=" * 60)
    print("  EXAMPLE NARRATIVES")
    print("=" * 60)
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        story = all_stories.get(atk)
        if not story:
            continue
        print(f"\n{'-' * 60}")
        print(f"  {atk.upper()} VEHICLE")
        print(f"{'-' * 60}")
        print(f"  {story['narrative']}")

    # 7. Report generation
    print("\n--- Generating Reports ---")
    generate_report(all_stories, region_trends, engine)
    generate_summary(all_stories, region_trends)

    print("\n" + "=" * 60)
    print("  EXPLAINABLE THREAT STORY ENGINE COMPLETE")
    print("=" * 60)


# =========================================================================
#  REPORT GENERATION
# =========================================================================
def generate_report(all_stories, region_trends, engine):
    """Write threat_story_report.md."""
    lines = []
    lines.append("# AutoShield Edge — Explainable Threat Story Report\n")
    lines.append("**Phase 7: Threat Story Engine — Structured Cybersecurity Narratives**\n")

    lines.append("## 1. Executive Summary\n")
    lines.append(
        "The Threat Story Engine transforms raw multi-dimensional anomaly detection and "
        "cyber health outputs into structured, human-readable cybersecurity narratives. "
        "It serves three audience tiers — drivers (simple alerts), fleet managers (root cause + trend), "
        "and vehicle engineers (feature-level attribution). Output includes JSON for machine "
        "consumption and natural-language narratives for human operators.\n"
    )

    lines.append("## 2. Explanation Methodology\n")
    lines.append("The engine follows a 6-stage pipeline:\n\n")
    lines.append("1. **Input Collection** — Gather feature values, anomaly scores, health scores, components, "
                 "trend, and forecast for the target window.\n")
    lines.append("2. **Root-Cause Attribution** — Compute per-feature z-scores relative to normal baselines. "
                 "Rank features by healthiness degradation (1 - healthiness). "
                 "Identify weakest component (Threat/Stability/Pressure) and weakest feature within it.\n")
    lines.append("3. **Template Selection** — Choose severity-aware template based on risk category "
                 "(Secure/Stable/Warning/High Risk/Critical).\n")
    lines.append("4. **Attack Context** — Inject attack-type-specific signatures and mitigations "
                 "when the window corresponds to a known attack type.\n")
    lines.append("5. **Narrative Assembly** — Fill template with computed values: health score, trend, "
                 "z-scores, feature labels, forecast, and recommended response.\n")
    lines.append("6. **Output Formatting** — Produce both structured JSON and human-readable narrative string.\n")

    lines.append("\n## 3. Attribution Logic\n")
    lines.append("### Component-Level\n")
    lines.append("- **Threat** (40% weight): Single feature — anomaly_score (OCSVM decision function). "
                 "Penalized when value falls below normal mean (direction='negative').\n")
    lines.append("- **Stability** (30% weight): Average of 3 sub-healthiness scores — "
                 "messages_per_second, can_id_entropy, unique_can_ids_window. "
                 "Penalized for any deviation from normal (direction='both').\n")
    lines.append("- **Pressure** (30% weight): Average of 3 sub-healthiness scores — "
                 "message_burst_score, frequency_spike_score, payload_instability_score. "
                 "Penalized only for elevated values (direction='positive').\n")

    lines.append("\n### Feature-Level\n")
    lines.append("For each of the 7 tracked features, the engine computes:\n")
    lines.append("- **z-score**: (value - mean_normal) / std_normal\n")
    lines.append("- **healthiness**: exp(-max(0, |z| - tolerance) / decay)\n")
    lines.append("- **contribution**: 1 - healthiness (0 = healthy, 1 = fully degraded)\n")
    lines.append("Features are ranked by contribution; the top feature is the primary driver.\n")

    lines.append("\n### Healthiness Parameters\n")
    lines.append("| Parameter | Value | Purpose |\n")
    lines.append("|-----------|-------|---------|\n")
    lines.append("| decay_factor | 1.5 | Controls penalty steepness for z-score deviations |\n")
    lines.append("| tolerance | 0.2 | Small z-scores (< 0.2 sigma) ignored as noise |\n")

    lines.append("\n## 4. Narrative Templates\n")
    lines.append("Five severity-aware templates exist, one per risk category:\n\n")

    for cat in ['Secure', 'Stable', 'Warning', 'High Risk', 'Critical']:
        t = TEMPLATES[cat]
        lines.append(f"### {cat}\n")
        lines.append(f"- **Threat Summary**: {t['threat_summary']}\n")
        lines.append(f"- **Root Cause**: {t['root_cause']}\n")
        lines.append(f"- **Response**: {t['response']}\n")

    lines.append("\n## 5. Root Cause Examples\n")
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        story = all_stories.get(atk)
        if not story:
            continue
        rc = story['root_cause_analysis']
        lines.append(f"\n### {atk.upper()} Attack\n")
        lines.append(f"- **Primary component**: {rc['primary_component']}\n")
        lines.append(f"- **Component breakdown**: {rc['component_breakdown']}\n")
        lines.append(f"- **Primary feature**: {rc['primary_feature']['label']} "
                     f"(z={rc['primary_feature']['z_score']:+.2f}, "
                     f"{rc['primary_feature']['deviation']})\n")
        lines.append(f"- **Root cause text**: {rc['root_cause_text']}\n")

    lines.append("\n## 6. Narrative Examples\n")
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        story = all_stories.get(atk)
        if not story:
            continue
        lines.append(f"\n### {atk.upper()} Vehicle\n")
        lines.append(f"> {story['narrative']}\n")

    lines.append("\n## 7. Risk Communication Strategy\n")
    lines.append("| Category | Audience | Channel | Urgency |\n")
    lines.append("|----------|----------|---------|---------|\n")
    lines.append("| Secure | Driver | Dashboard indicator (green) | None |\n")
    lines.append("| Stable | Driver, Fleet Manager | Dashboard + log entry | Low |\n")
    lines.append("| Warning | Fleet Manager | Notification + report | Medium |\n")
    lines.append("| High Risk | Fleet Manager + Engineer | Alert + detailed report | High |\n")
    lines.append("| Critical | All + SOC | Emergency alert | Immediate |\n")

    lines.append("\n## 8. Readiness for Self-Healing Response Agent\n")
    lines.append(
        "The Threat Story Engine produces the following outputs required by a Self-Healing Response Agent:\n\n"
    )
    lines.append("- **Structured JSON**: Machine-readable with feature-level attributions\n")
    lines.append("- **Risk category**: Determines response severity\n")
    lines.append("- **Root cause analysis**: Identifies which behavioral dimension failed\n")
    lines.append("- **Forecast**: Predicts near-future health trajectory\n")
    lines.append("- **Recommended response**: Suggested countermeasure for each scenario\n")
    lines.append("- **Attack context**: Attack type, signature, and mitigation strategy\n\n")
    lines.append(
        "A Self-Healing Agent can use this output to: (1) identify the compromised ECU via CAN ID analysis, "
        "(2) select the appropriate countermeasure (rate limiting, ID filtering, plausibility check), "
        "(3) execute the response, and (4) monitor recovery via the forecast vs actual health trajectory.\n"
    )

    lines.append("\n## 9. Output Files\n")
    lines.append("| File | Description |\n")
    lines.append("|------|-------------|\n")
    lines.append("| `src/threat_explanation/threat_story_engine.py` | Engine implementation |\n")
    lines.append("| `reports/threat_stories.json` | Example stories in JSON |\n")
    lines.append("| `reports/threat_story_report.md` | This report |\n")
    lines.append("| `reports/phase7_summary.md` | Phase 7 summary |\n")

    (REPORTS_DIR / 'threat_story_report.md').write_text('\n'.join(lines), encoding='utf-8')
    print("  [DOC] reports/threat_story_report.md")


def generate_summary(all_stories, region_trends):
    """Write phase7_summary.md."""
    lines = []
    lines.append("# AutoShield Edge — Phase 7 Summary\n")
    lines.append("**Explainable Threat Story Engine**\n")

    lines.append("## Overview\n")
    lines.append(
        "Built a multi-audience explanation engine that transforms anomaly detection and "
        "cyber health metrics into structured, human-readable cybersecurity narratives. "
        "The engine supports 5 severity levels, 5 attack scenarios, and produces both "
        "JSON (machine) and narrative (human) output formats.\n"
    )

    lines.append("## Story Statistics\n")
    lines.append("| Attack Type | Health | Category | Trend | Forecast |\n")
    lines.append("|-------------|--------|----------|-------|----------|\n")
    for atk in ['Normal', 'DoS', 'Fuzzy', 'Gear', 'RPM']:
        rt = region_trends.get(atk, {})
        story = all_stories.get(atk, {})
        lines.append(
            f"| {atk} | {rt.get('mean_health', 'N/A')} | "
            f"{story.get('risk_category', 'N/A')} | "
            f"{rt.get('trend', 'N/A')} | "
            f"{rt.get('forecast', [None])[0]:.0f}/100 |\n"
        )

    lines.append("## Method\n")
    lines.append("- Root-cause attribution via z-score healthiness ranking (7 tracked features)\n")
    lines.append("- Component-level analysis (Threat/Stability/Pressure)\n")
    lines.append("- Severity-aware templates with 5 risk categories\n")
    lines.append("- Attack-specific context injection (DoS, Fuzzy, Gear, RPM)\n")
    lines.append("- Dual output: structured JSON + human-readable narrative\n")

    lines.append("## Key Capabilities\n")
    lines.append("1. **Driver alerts**: One-line summaries (e.g., 'Cyber Health: 45/100 — Warning. CAN anomaly detected.')\n")
    lines.append("2. **Root cause attribution**: Identifies the specific feature and component driving health degradation\n")
    lines.append("3. **Trend context**: Improving/Stable/Degrading with magnitude\n")
    lines.append("4. **Forecast awareness**: Projects health trajectory for proactive response\n")
    lines.append("5. **Attack classification**: Maps patterns to known attack types with mitigations\n")

    lines.append("\n## Readiness for Self-Healing Response Agent\n")
    lines.append(
        "Output format includes all fields needed for automated response: "
        "risk level, root cause (feature-level), recommended action, attack type, "
        "and forecast trajectory. The JSON schema is designed for direct integration "
        "with a rule-based or ML-based response agent.\n"
    )

    (REPORTS_DIR / 'phase7_summary.md').write_text('\n'.join(lines), encoding='utf-8')
    print("  [DOC] reports/phase7_summary.md")


if __name__ == '__main__':
    main()
