# src/train_model.py
import sys
import os
from pathlib import Path
import json
import joblib
from sklearn.ensemble import IsolationForest
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from features import get_features

MODEL_PATH = BASE_DIR / "models" / "isolation_forest.joblib"
SCALER_PATH = BASE_DIR / "models" / "scaler.joblib"
ANOMALIES_CSV = BASE_DIR / "data" / "mplads_anomalies.csv"
CONFIG_PATH = SRC_DIR / "train_config.json"

MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
ANOMALIES_CSV.parent.mkdir(parents=True, exist_ok=True)

def train(contamination=0.1, n_estimators=100, random_state=42):
    # Load features and scaler (features.get_features saves scaler by default)
    df, X_scaled, scaler = get_features()
    
    # Train Isolation Forest
    model = IsolationForest(n_estimators=n_estimators, contamination=contamination, random_state=random_state)
    model.fit(X_scaled)
    
    # Save artifacts
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    # Scores and predictions
    scores = model.decision_function(X_scaled)   # higher = more normal
    preds = model.predict(X_scaled)              # -1 anomaly, 1 normal
    df["anomaly_score"] = scores
    
    # Explicitly cast to Python native boolean to ensure correct CSV writing
    df["is_flagged"] = (preds == -1).astype(bool)
    
    # Prevent floats in ID columns
    df["project_id"] = df["project_id"].astype(str).str.strip().str.split('.').str[0]
    
    df[["project_id", "anomaly_score", "is_flagged"]].to_csv(ANOMALIES_CSV, index=False)
    
    # Save config for reproducibility
    with open(CONFIG_PATH, "w") as f:
        json.dump({"contamination": contamination, "n_estimators": n_estimators, "random_state": random_state}, f)
        
    print("Saved model to", MODEL_PATH)
    print("Saved scaler to", SCALER_PATH)
    print("Saved anomalies to", ANOMALIES_CSV)

if __name__ == "__main__":
    train(contamination=0.1)