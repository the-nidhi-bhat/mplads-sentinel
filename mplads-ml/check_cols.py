import pandas as pd

a = pd.read_csv("data/mplads_clean.csv")
b = pd.read_csv("data/mplads_anomalies.csv")

print("=== clean columns ===")
print(a.columns.tolist())
print("\n=== anomalies columns ===")
print(b.columns.tolist())

print("\n=== project_id dtypes ===")
print("clean:", a['project_id'].dtype, "anomalies:", b['project_id'].dtype)

print("\n=== clean sample ===")
print(a.head().to_string(index=False))

print("\n=== anomalies sample ===")
print(b.head().to_string(index=False))
