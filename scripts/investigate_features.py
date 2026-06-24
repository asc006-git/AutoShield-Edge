"""
Investigate feature separability between Normal and Attack CAN data.
"""
import numpy as np
import pyarrow.parquet as pq
from pathlib import Path
from sklearn.ensemble import IsolationForest

warnings = __import__('warnings')
warnings.filterwarnings('ignore')
gc = __import__('gc')

BASE = Path(r'C:\Users\HP\Desktop\AutoShield-Edge')
DATA = BASE / 'data' / 'processed'

FEATURES = ['CAN_ID','DLC','D0','D1','D2','D3','D4','D5','D6','D7',
            'payload_mean','payload_std','payload_min','payload_max',
            'payload_entropy','delta_time']


def load(path, n, seed=42):
    t = pq.read_table(path, columns=FEATURES)
    rng = np.random.RandomState(seed)
    idx = rng.choice(t.num_rows, size=n, replace=False)
    result = t.take(idx).to_pandas()
    del t; gc.collect()
    return result


print('Loading datasets...')
X_norm = load(DATA / 'normal.parquet', 100000, 1)
X_dos  = load(DATA / 'dos.parquet', 25000, 2)
X_fuzz = load(DATA / 'fuzzy.parquet', 25000, 3)
X_gear = load(DATA / 'gear.parquet', 25000, 4)
X_rpm  = load(DATA / 'rpm.parquet', 25000, 5)

print('\n=== delta_time statistics per dataset ===')
for name, df in [('Normal', X_norm), ('DoS', X_dos), ('Fuzzy', X_fuzz), ('Gear', X_gear), ('RPM', X_rpm)]:
    s = df['delta_time']
    zero_pct = (s == 0.0).mean() * 100
    print(f'  {name:8s}: mean={s.mean():.6f} std={s.std():.6f} min={s.min():.8f} max={s.max():.6f} zero%={zero_pct:.1f}')

print('\n=== CAN_ID unique counts ===')
for name, df in [('Normal', X_norm), ('DoS', X_dos), ('Fuzzy', X_fuzz), ('Gear', X_gear), ('RPM', X_rpm)]:
    print(f'  {name:8s}: {df["CAN_ID"].nunique()} unique')

print('\n=== payload_entropy statistics ===')
for name, df in [('Normal', X_norm), ('DoS', X_dos), ('Fuzzy', X_fuzz), ('Gear', X_gear), ('RPM', X_rpm)]:
    s = df['payload_entropy']
    print(f'  {name:8s}: mean={s.mean():.4f} std={s.std():.4f}')

print('\n=== DLC distribution ===')
for name, df in [('Normal', X_norm), ('DoS', X_dos), ('Fuzzy', X_fuzz), ('Gear', X_gear), ('RPM', X_rpm)]:
    counts = df['DLC'].value_counts().sort_index()
    print(f'  {name:8s}: {dict(counts)}')

# Now train IF and evaluate per attack type
print('\n--- Isolation Forest per-attack detection ---')
del X_norm; gc.collect()

X_train = load(DATA / 'normal.parquet', 100000, 42)
print(f'Training IF on {len(X_train):,} normal samples...')
model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42, n_jobs=-1, verbose=0)
model.fit(X_train)

# Score on training data for threshold estimation
scores_train = model.decision_function(X_train)
thresh_p5 = np.percentile(scores_train, 5)
thresh_p2 = np.percentile(scores_train, 2)
thresh_p1 = np.percentile(scores_train, 1)
print(f'  Score thresholds: P1={thresh_p1:.4f} P2={thresh_p2:.4f} P5={thresh_p5:.4f}')

for name, X_att in [('DoS', X_dos), ('Fuzzy', X_fuzz), ('Gear', X_gear), ('RPM', X_rpm)]:
    scores_att = model.decision_function(X_att)
    mean_n = scores_train.mean()
    mean_a = scores_att.mean()
    for pct_name, thresh in [('P1', thresh_p1), ('P2', thresh_p2), ('P5', thresh_p5)]:
        dr = (scores_att < thresh).mean()
        fpr = pct_name  # approximate
        print(f'  {name:8s} @ {pct_name}: DR={dr:.4f}  (mean_norm={mean_n:.4f}, mean_att={mean_a:.4f})')

del X_train, X_dos, X_fuzz, X_gear, X_rpm; gc.collect()

# Check pure byte-level features as numpy array
print('\n--- KNN-based anomaly detection (quick benchmark) ---')
X_train = load(DATA / 'normal.parquet', 10000, 42)  # smaller set
X_dos  = load(DATA / 'dos.parquet', 5000, 2)

from sklearn.neighbors import LocalOutlierFactor
lof = LocalOutlierFactor(n_neighbors=20, contamination=0.05, novelty=True)
lof.fit(X_train.values)
scores_lof = lof.decision_function(X_dos.values)
dr_lof = (scores_lof < np.percentile(lof.decision_function(X_train.values), 5)).mean()
print(f'  LOF DoS detection rate @P5: {dr_lof:.4f}')
del X_train, X_dos; gc.collect()
print('Done')
