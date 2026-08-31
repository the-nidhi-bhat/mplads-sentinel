# src/features.py
import os
import yaml
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib

# Resolve workspace root relative to this file
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CONFIG_PATH = os.path.join(ROOT, "config.yml")

def load_config(path=CONFIG_PATH):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Config not found at {path}")
    with open(path, "r") as f:
        return yaml.safe_load(f)

cfg = load_config()

# Use cleaned_path from config; fallback to mplads-ml/data/mplads_clean.csv
_clean_from_cfg = cfg.get("mplads_ml", {}).get(
    "cleaned_path",
    "mplads-ml/data/mplads_clean.csv"
)
if os.path.isabs(_clean_from_cfg):
    CLEAN = _clean_from_cfg
else:
    CLEAN = os.path.abspath(os.path.join(ROOT, _clean_from_cfg))

# Scaler path (from config if present) with sensible fallback
_scaler_from_cfg = cfg.get("mplads_ml", {}).get(
    "scaler_path",
    "mplads-ml/models/scaler.joblib"
)
if os.path.isabs(_scaler_from_cfg):
    SCALER_PATH = _scaler_from_cfg
else:
    SCALER_PATH = os.path.abspath(os.path.join(ROOT, _scaler_from_cfg))

def ensure_dir_for(path):
    d = os.path.dirname(path) or "."
    os.makedirs(d, exist_ok=True)

def get_features(clean_csv=CLEAN, save_scaler=True):
    """
    Read cleaned CSV (absolute path from config), extract features, scale them,
    optionally save the fitted scaler, and return (df, X_scaled, scaler).
    """
    # Read cleaned CSV using absolute path
    df = pd.read_csv(clean_csv)

    # Features we use
    features = ["cost_overrun_ratio", "delay_days", "fund_utilization_speed"]

    # Ensure numeric and fill missing
    X = df[features].fillna(0.0).astype(float)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    if save_scaler:
        ensure_dir_for(SCALER_PATH)
        joblib.dump(scaler, SCALER_PATH)

    return df, X_scaled, scaler

if __name__ == "__main__":
    df, X_scaled, scaler = get_features()
    print("Features shape:", X_scaled.shape)
    print("First rows (scaled):")
    print(X_scaled[:5])
