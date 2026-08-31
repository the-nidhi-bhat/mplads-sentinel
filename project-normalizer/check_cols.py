#!/usr/bin/env python3
import os
import yaml
import pandas as pd
import sys
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

# This script lives at workspace/project-normalizer/check_cols.py
THIS_DIR = os.path.abspath(os.path.dirname(__file__))        # .../workspace/project-normalizer
WORKSPACE_ROOT = os.path.abspath(os.path.join(THIS_DIR, ".."))  # .../workspace
CONFIG_PATH = os.path.join(WORKSPACE_ROOT, "config.yml")        # .../workspace/config.yml

def load_config(path=CONFIG_PATH):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Config not found at {path}")
    with open(path, "r") as f:
        return yaml.safe_load(f)

# Load config and resolve finalized path
cfg = load_config()
finalized_path = cfg['project_normalizer'].get('finalized_path', os.path.join(THIS_DIR, "data", "finalized.csv"))

logging.info("Using config at: %s", CONFIG_PATH)
logging.info("Resolved finalized_path: %s", finalized_path)

# Read finalized.csv using the absolute path from config
m = pd.read_csv(finalized_path, dtype=str)
logging.info("Read finalized header: %s", m.columns.tolist())

# canonical header check
canonical = ["project_id","mp_name","district","work_type","sanction_date",
             "sanction_amount","expenditure_to_date","start_date","expected_end_date",
             "actual_end_date","status"]

missing = [c for c in canonical if c not in m.columns]
if missing:
    print("Missing canonical columns:", missing)
    sys.exit(1)

print("check_cols.py: OK")
