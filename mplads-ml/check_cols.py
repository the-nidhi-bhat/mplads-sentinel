from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
clean_path = BASE_DIR / "data" / "mplads_clean.csv"
anom_path = BASE_DIR / "data" / "mplads_anomalies.csv"
flagged_path = BASE_DIR / "data" / "inspect_flagged.csv"

if clean_path.exists():
    a = pd.read_csv(clean_path, nrows=5)
    print("=== clean columns ===")
    print(a.columns.tolist())

if anom_path.exists():
    b = pd.read_csv(anom_path, nrows=5)
    print("\n=== anomalies columns ===")
    print(b.columns.tolist())

if flagged_path.exists():
    c = pd.read_csv(flagged_path, nrows=5)
    print("\n=== inspect_flagged columns ===")
    print(c.columns.tolist())
