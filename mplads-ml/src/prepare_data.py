# src/prepare_data.py
import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parents[1]
RAW = BASE_DIR / "data" / "mplads_raw.csv"
CLEAN = BASE_DIR / "data" / "mplads_clean.csv"

def load_raw(path=RAW):
    return pd.read_csv(path, dtype=str)

def clean_and_engineer(df):
    # Normalize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    # Ensure project_id exists and normalized
    if "project_id" in df.columns:
        df["project_id"] = df["project_id"].astype(str).str.strip()
    else:
        raise KeyError("project_id column not found in raw data")

    # Numeric coercion
    for col in ["sanction_amount", "expenditure_to_date"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
        else:
            df[col] = 0.0

    # Parse dates (create columns if missing)
    for d in ["start_date", "expected_end_date", "actual_end_date", "sanction_date"]:
        if d in df.columns:
            df[d] = pd.to_datetime(df[d], errors="coerce")
        else:
            df[d] = pd.NaT

    # Standardize text fields
    for t in ["mp_name", "district", "work_type", "status"]:
        if t in df.columns:
            df[t] = df[t].astype(str).str.strip()
        else:
            df[t] = ""

    if "status" in df.columns:
        df["status"] = df["status"].replace({"nan": ""}).fillna("Sanctioned").astype(str).str.title()
    else:
        df["status"] = "Sanctioned"

    # --- Begin snippet: infer expected_end_date by work_type heuristic ---
    default_durations_days = {
        "road": 365,
        "school": 540,
        "water": 270,
        "community_hall": 365,
        "drainage": 270,
        "electrification": 180,
        "playground": 180,
        "health": 365,
        "other": 365
    }

    # Normalize work_type for matching
    df["work_type_norm"] = df["work_type"].astype(str).str.strip().str.lower().str.replace(" ", "_")

    def infer_expected_end(row):
        if pd.notna(row.get("expected_end_date")):
            return row["expected_end_date"]
        start = row.get("start_date")
        if pd.isna(start):
            # fallback to sanction_date if start_date missing
            start = row.get("sanction_date")
            if pd.isna(start):
                return pd.NaT
        wt = row.get("work_type_norm", "other") or "other"
        days = default_durations_days.get(wt, default_durations_days["other"])
        return start + pd.Timedelta(days=days)

    df["expected_end_date"] = df.apply(infer_expected_end, axis=1)
    # --- End snippet ---

    # Feature: months_elapsed (from start_date)
    today = pd.Timestamp.today()
    df["months_elapsed"] = ((today - df["start_date"]).dt.days / 30).clip(lower=0).fillna(0)

    # Feature: cost_overrun_ratio
    df["cost_overrun_ratio"] = df["expenditure_to_date"] / df["sanction_amount"].replace({0: np.nan})
    df["cost_overrun_ratio"] = df["cost_overrun_ratio"].fillna(0.0)

    # Feature: delay_days (actual - expected)
    df["delay_days"] = (df["actual_end_date"] - df["expected_end_date"]).dt.days
    df["delay_days"] = df["delay_days"].fillna(0).astype(int)

    # Feature: fund_utilization_speed
    df["fund_utilization_speed"] = df["expenditure_to_date"] / df["months_elapsed"].replace({0: np.nan})
    df["fund_utilization_speed"] = df["fund_utilization_speed"].fillna(0.0)

    # Feature: percent_spent
    df["percent_spent"] = df["expenditure_to_date"] / df["sanction_amount"].replace({0: np.nan})
    df["percent_spent"] = df["percent_spent"].fillna(0.0)

    # Keep useful columns (ensure metadata preserved)
    keep = [
        "project_id", "mp_name", "district", "work_type", "sanction_date",
        "sanction_amount", "expenditure_to_date", "start_date", "expected_end_date", "actual_end_date",
        "status", "months_elapsed", "cost_overrun_ratio", "delay_days", "fund_utilization_speed",
        "percent_spent"
    ]

    # Ensure columns exist and return subset
    for c in keep:
        if c not in df.columns:
            df[c] = np.nan if c.endswith("_date") or "date" in c else 0.0 if c in ["sanction_amount", "expenditure_to_date", "months_elapsed", "cost_overrun_ratio", "delay_days", "fund_utilization_speed", "percent_spent"] else ""

    return df[[c for c in keep if c in df.columns]]

if __name__ == "__main__":
    raw_path = sys.argv[1] if len(sys.argv) > 1 else RAW
    clean_path = sys.argv[2] if len(sys.argv) > 2 else CLEAN
    df_raw = load_raw(raw_path)
    df_clean = clean_and_engineer(df_raw)
    df_clean.to_csv(clean_path, index=False)
    print("Saved cleaned data to", clean_path)
