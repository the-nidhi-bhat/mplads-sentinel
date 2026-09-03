# inspect_flagged.py
import sys
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
CLEAN = BASE_DIR / "data" / "mplads_clean.csv"
ANOM = BASE_DIR / "data" / "mplads_anomalies.csv"
OUT = BASE_DIR / "data" / "inspect_flagged.csv"

# Load files
df = pd.read_csv(CLEAN, dtype=str)
ann = pd.read_csv(ANOM, dtype=str)

# Normalize and cast numeric columns safely
df['project_id'] = df['project_id'].astype(str).str.strip()
ann['project_id'] = ann['project_id'].astype(str).str.strip()

# Merge model outputs back into metadata
m = df.merge(ann, on='project_id', how='left', suffixes=('', '_ann'))

# Convert numeric columns that we expect to use
num_cols = [
    "sanction_amount", "expenditure_to_date", "months_elapsed",
    "cost_overrun_ratio", "delay_days", "fund_utilization_speed", "percent_spent", "anomaly_score"
]
for c in num_cols:
    if c in m.columns:
        m[c] = pd.to_numeric(m[c], errors='coerce')
    else:
        m[c] = np.nan

# Fill obvious missing numeric defaults
m['months_elapsed'] = m['months_elapsed'].fillna(0)
m['cost_overrun_ratio'] = m['cost_overrun_ratio'].fillna(0)
m['delay_days'] = m['delay_days'].fillna(0)
m['fund_utilization_speed'] = m['fund_utilization_speed'].fillna(0)
m['percent_spent'] = m['percent_spent'].fillna(0)
m['anomaly_score'] = m['anomaly_score'].fillna(0)

# Identify flagged rows securely, handling varying string cases and formats
if 'is_flagged' in m.columns:
    # Convert to string, strip whitespace, lowercase, and check against truthy values
    m['is_flagged'] = m['is_flagged'].astype(str).str.strip().str.lower().isin(['true', '1', 't', 'yes'])
else:
    m['is_flagged'] = False

flagged = m.loc[m['is_flagged'] == True].copy()

# Remove excluded columns if present
cols_to_remove = ["last_update_date", "last_update_age", "possible_unit_error", "diagnostics"]
flagged = flagged.drop(columns=[c for c in cols_to_remove if c in flagged.columns], errors='ignore')

# Keep ALL projects (not just flagged) so the frontend can display everything.
# The is_flagged column distinguishes normal vs anomalous projects.
pd.set_option('display.max_columns', None)
print(f"Total projects: {len(m)}")
print(f"Flagged count: {int(m['is_flagged'].sum())}")

if not flagged.empty:
    print("=== Flagged rows ===")
    print(flagged.to_string(index=False))

# Remove excluded columns if still present
m = m.drop(columns=[c for c in cols_to_remove if c in m.columns], errors='ignore')

# Write ALL projects to CSV (flagged and non-flagged)
m.to_csv(OUT, index=False)
print(f"\nWrote all {len(m)} projects to {OUT}")
print("Done.")