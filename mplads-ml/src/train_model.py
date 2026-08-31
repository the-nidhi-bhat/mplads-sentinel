# src/train_model.py
import joblib
from sklearn.ensemble import IsolationForest
from features import get_features
import pandas as pd
import json
import os

MODEL_PATH = "models/isolation_forest.joblib"
SCALER_PATH = "models/scaler.joblib"
ANOMALIES_CSV = "data/mplads_anomalies.csv"
CONFIG_PATH = "src/train_config.json"

os.makedirs("models", exist_ok=True)

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
    df["is_flagged"] = (preds == -1)
    df[["project_id", "anomaly_score", "is_flagged"]].to_csv(ANOMALIES_CSV, index=False)
    # Save config for reproducibility
    with open(CONFIG_PATH, "w") as f:
        json.dump({"contamination": contamination, "n_estimators": n_estimators, "random_state": random_state}, f)
    print("Saved model to", MODEL_PATH)
    print("Saved scaler to", SCALER_PATH)
    print("Saved anomalies to", ANOMALIES_CSV)

if __name__ == "__main__":
    train(contamination=0.1)
