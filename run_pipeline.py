#!/usr/bin/env python3
import subprocess
import sys
import os
import yaml
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
ROOT = os.path.abspath(os.path.dirname(__file__))
CONFIG_PATH = os.path.join(ROOT, "config.yml")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        raise FileNotFoundError(f"Config not found at {CONFIG_PATH}")
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)

cfg = load_config()
PY = sys.executable

def run_cmd(cmd, cwd=None):
    cwd = cwd or ROOT
    logging.info("Running: %s (cwd=%s)", cmd, cwd)
    res = subprocess.run(cmd, shell=True, cwd=cwd)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed (exit {res.returncode}): {cmd}")

def run_normalizer_steps():
    # 1. finalize_merge.py
    run_cmd(f"{PY} project-normalizer/src/finalize_merge.py")
    # 2. check columns
    run_cmd(f"{PY} project-normalizer/check_cols.py")
    # 3. prepare_for_model (writes model input)
    run_cmd(f"{PY} project-normalizer/src/prepare_for_model.py")

def run_model_steps():
    # 4. prepare_data (reads model input, writes cleaned) — run from mplads-ml root
    run_cmd(f"{PY} src/prepare_data.py", cwd=os.path.join(ROOT, "mplads-ml"))
    # 5. train_model (reads cleaned, writes models) — run from mplads-ml root
    run_cmd(f"{PY} src/train_model.py", cwd=os.path.join(ROOT, "mplads-ml"))


def main():
    logging.info("Starting full pipeline")
    run_normalizer_steps()
    run_model_steps()
    logging.info("Pipeline completed successfully")

if __name__ == "__main__":
    main()
