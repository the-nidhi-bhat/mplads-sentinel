# src/features.py
from pathlib import Path
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib

BASE_DIR = Path(__file__).resolve().parents[1]
CLEAN = BASE_DIR / "data" / "mplads_clean.csv"
SCALER_PATH = BASE_DIR / "models" / "scaler.joblib"

def get_features(clean_csv=CLEAN, save_scaler=True):
    df = pd.read_csv(clean_csv, low_memory=False)
    # Features we use
    features = ["cost_overrun_ratio", "delay_days", "fund_utilization_speed"]
    # Ensure numeric and fill missing
    X = df[features].fillna(0.0).astype(float)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    if save_scaler:
        SCALER_PATH.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(scaler, SCALER_PATH)
    return df, X_scaled, scaler

if __name__ == "__main__":
    df, X_scaled, scaler = get_features()
    print("Features shape:", X_scaled.shape)
    print("First rows (scaled):")
    print(X_scaled[:5])
