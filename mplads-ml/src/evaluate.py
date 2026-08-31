import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("data/mplads_clean.csv")
ann = pd.read_csv("data/mplads_anomalies.csv")

df['project_id'] = df['project_id'].astype(str)
ann['project_id'] = ann['project_id'].astype(str)

df = df.merge(ann, on="project_id", how="left")

print("Total projects:", len(df))
print("Flagged:", int(df["is_flagged"].fillna(False).sum()))

# Ensure columns used by reason_tags exist (avoid KeyError / AttributeError)
required_cols = ["percent_spent","months_elapsed","cost_overrun_ratio","delay_days","fund_utilization_speed"]
for c in required_cols:
    if c not in df.columns:
        df[c] = 0.0

def reason_tags(row):
    percent_spent = row.get("percent_spent", 0)
    months_elapsed = row.get("months_elapsed", 0)
    cost_overrun_ratio = row.get("cost_overrun_ratio", 0)
    delay_days = row.get("delay_days", 0)
    fund_utilization_speed = row.get("fund_utilization_speed", 0)

    tags = []
    if percent_spent < 0.2 and months_elapsed > 3:
        tags.append("low_utilization")
    if cost_overrun_ratio > 1.5:
        tags.append("high_cost_overrun")
    if delay_days > 90:
        tags.append("long_delay")
    if fund_utilization_speed < 1000 and months_elapsed > 3:
        tags.append("stalled_funds")
    return ";".join(tags)

df["reason_tags"] = df.apply(reason_tags, axis=1)

# Show flagged rows
cols = ["project_id","mp_name","district","work_type","status",
        "sanction_amount","expenditure_to_date","cost_overrun_ratio",
        "months_elapsed","delay_days","fund_utilization_speed","percent_spent",
        "anomaly_score","is_flagged","reason_tags"]

for c in cols:
    if c not in df.columns:
        df[c] = np.nan

flagged = df.loc[df["is_flagged"].fillna(False), cols]
if flagged.empty:
    print("No flagged rows to display.")
else:
    print(flagged.to_string(index=False))

# Visualization
sns.scatterplot(data=df, x="cost_overrun_ratio", y="delay_days", hue="is_flagged")
plt.title("Cost Overrun Ratio vs Delay Days")
plt.show()
