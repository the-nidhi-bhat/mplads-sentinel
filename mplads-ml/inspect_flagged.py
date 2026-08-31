# inspect_flagged.py
import pandas as pd
import numpy as np

CLEAN = "data/mplads_clean.csv"
ANOM = "data/mplads_anomalies.csv"
OUT = "data/inspect_flagged.csv"

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
    "sanction_amount","expenditure_to_date","months_elapsed",
    "cost_overrun_ratio","delay_days","fund_utilization_speed","percent_spent","anomaly_score"
]
for c in num_cols:
    if c in m.columns:
        m[c] = pd.to_numeric(m[c], errors='coerce')
    else:
        m[c] = np.nan

# Fill obvious missing numeric defaults for diagnostics only
m['months_elapsed'] = m['months_elapsed'].fillna(0)
m['cost_overrun_ratio'] = m['cost_overrun_ratio'].fillna(0)
m['delay_days'] = m['delay_days'].fillna(0)
m['fund_utilization_speed'] = m['fund_utilization_speed'].fillna(0)
m['percent_spent'] = m['percent_spent'].fillna(0)
m['anomaly_score'] = m['anomaly_score'].fillna(0)

# Identify flagged rows
m['is_flagged'] = m['is_flagged'].map({'True': True, 'False': False}).fillna(False)
flagged = m.loc[m['is_flagged'] == True].copy()

# If none flagged, print summary and exit
if flagged.empty:
    print("No flagged rows found.")
    print("Total projects:", len(m))
    print("Flagged count:", int(m['is_flagged'].sum()))
    m.head(5).to_csv(OUT, index=False)
    print("Wrote sample to", OUT)
    raise SystemExit

# Print full flagged rows to console
pd.set_option('display.max_columns', None)
print("=== Flagged rows full details ===")
print(flagged.to_string(index=False))

# Print the numeric features used by the model for flagged rows
print("\n=== Numeric features for flagged rows ===")
print(flagged[['project_id','cost_overrun_ratio','delay_days','months_elapsed','fund_utilization_speed','percent_spent','anomaly_score']].to_string(index=False))

# Quick diagnostics per flagged row
def diagnostics(row):
    notes = []
    if row['percent_spent'] < 0.05 and row['months_elapsed'] > 3:
        notes.append("very_low_utilization")
    if row['fund_utilization_speed'] == 0 and row['months_elapsed'] > 1:
        notes.append("no_spend")
    if row['cost_overrun_ratio'] > 1.5:
        notes.append("high_overrun")
    if row['delay_days'] > 90:
        notes.append("long_delay")
    if row['months_elapsed'] < 1:
        notes.append("very_recent_start")
    if row['sanction_amount'] == 0 or np.isnan(row['sanction_amount']):
        notes.append("zero_sanction_amount")
    return ";".join(notes) if notes else "none"

flagged['diagnostics'] = flagged.apply(diagnostics, axis=1)

# Save flagged rows with diagnostics to CSV for reviewer
cols_out = list(flagged.columns) + ['diagnostics']
flagged.to_csv(OUT, index=False, columns=cols_out)
print("\nWrote flagged rows with diagnostics to", OUT)

# Summary counts of diagnostics
print("\n=== Diagnostics summary ===")
print(flagged['diagnostics'].value_counts().to_string())

# Helpful suggestions printed for each flagged row
print("\n=== Suggested next actions per flagged project ===")
for _, r in flagged.iterrows():
    pid = r['project_id']
    diag = r['diagnostics']
    print(f"\nProject {pid} diagnostics: {diag}")
    if "zero_sanction_amount" in diag:
        print("  - Check raw data for missing or mis-entered sanction_amount.")
    if "very_low_utilization" in diag or "no_spend" in diag:
        print("  - Possible data lag or stalled work. Request latest expenditure update.")
    if "high_overrun" in diag:
        print("  - Investigate invoices and approvals. Verify currency units.")
    if "long_delay" in diag:
        print("  - Check project status and contractor reports for delays.")
    if "very_recent_start" in diag:
        print("  - Project may be early stage. Re-evaluate after 1-2 months.")
    if diag == "none":
        print("  - Flagging likely due to model sensitivity. Consider lowering contamination or adding features.")

print("\nDone.")
