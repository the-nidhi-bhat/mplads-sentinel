#!/usr/bin/env python3
"""
project-normalizer/src/normalize_user_csv.py

Usage:
  python project-normalizer/src/normalize_user_csv.py --input /path/to/user.csv [--source recommended|sanctioned|completed|auto] [--run-pipeline] [--venv-python path/to/python]

What it does:
  - Reads an arbitrary CSV provided by the user.
  - Attempts to map its columns to the canonical schema:
      project_id, mp_name, district, work_type, sanction_date, sanction_amount,
      expenditure_to_date, start_date, expected_end_date, actual_end_date, status
    using the project's existing map_columns() when possible and fuzzy matching otherwise.
  - Normalizes date formats and numeric fields.
  - Writes the normalized CSV to one or more of:
      project-normalizer/data/works_recommended.csv
      project-normalizer/data/works_sanctioned.csv
      project-normalizer/data/works_completed.csv
    depending on --source (default: auto -> writes to all three).
  - Optionally runs finalize_merge.py, prepare_for_model.py, mplads-ml/src/prepare_data.py, and
    mplads-ml/src/detect_anomalies.py when --run-pipeline is supplied.
"""
import argparse
import os
import sys
import shutil
import subprocess
from pathlib import Path
import pandas as pd
import numpy as np
import difflib
import logging

# Resolve workspace root and ensure project-normalizer/src is on sys.path so imports work
ROOT = Path(__file__).resolve().parents[2]  # workspace root
PN_SRC = ROOT / "project-normalizer" / "src"
pn_src_str = str(PN_SRC)
if pn_src_str not in sys.path:
    sys.path.insert(0, pn_src_str)

# Use your project's map_columns if available
try:
    from normalize_headers import map_columns
except Exception:
    map_columns = None

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

PN_DATA = ROOT / "project-normalizer" / "data"
ML_DATA = ROOT / "mplads-ml" / "data"

SRC_FILES = {
    "recommended": PN_DATA / "works_recommended.csv",
    "sanctioned": PN_DATA / "works_sanctioned.csv",
    "completed": PN_DATA / "works_completed.csv",
}

CANONICAL = [
    "project_id",
    "mp_name",
    "district",
    "work_type",
    "sanction_date",
    "sanction_amount",
    "expenditure_to_date",
    "start_date",
    "expected_end_date",
    "actual_end_date",
    "status",
]

# synonyms to help fuzzy matching (lowercase keys)
SYNONYMS = {
    "project_id": ["id", "proj_id", "sr no", "sr. no", "srno", "project no", "project number"],
    "mp_name": ["mp", "mpname", "member_of_parliament", "name"],
    "district": ["dist", "district_name", "districtname"],
    "work_type": ["worktype", "type_of_work", "project_type"],
    "sanction_date": ["sanctiondate", "date_of_sanction", "date_sanctioned", "sanctioned_date"],
    "sanction_amount": ["sanctionamount", "amount_sanctioned", "sanctioned_amount", "amount"],
    "expenditure_to_date": ["expenditure", "expenditure_to_date", "exp_to_date", "expendituretodate", "spent"],
    "start_date": ["startdate", "date_start", "commencement_date"],
    "expected_end_date": ["expectedenddate", "expected_end", "expected_completion_date"],
    "actual_end_date": ["actualenddate", "actual_end", "completion_date", "date_completed"],
    "status": ["project_status", "state", "current_status"],
}

def _best_match(col, candidates):
    """Return best candidate from candidates for col using difflib and synonyms."""
    col_l = col.lower().strip()
    # exact match
    if col_l in candidates:
        return col_l
    # check synonyms
    for canon, syns in SYNONYMS.items():
        if col_l == canon or col_l in syns:
            return canon
    # fuzzy match against canonical names and synonyms
    pool = list(candidates) + [s for syns in SYNONYMS.values() for s in syns]
    matches = difflib.get_close_matches(col_l, pool, n=1, cutoff=0.7)
    if matches:
        m = matches[0]
        # if match is a synonym, find its canonical
        for canon, syns in SYNONYMS.items():
            if m == canon or m in syns:
                return canon
        return m
    return None

def build_rename_map(df_columns):
    """
    Try to build a rename_map mapping input columns -> canonical columns.
    Uses map_columns() if available; otherwise uses fuzzy matching and synonyms.
    """
    rename = {}
    cols = [c.strip() for c in df_columns]
    # If project has map_columns, use it first (it returns rename_map, canonical_order)
    if map_columns is not None:
        try:
            rm, _ = map_columns(cols)
            # map_columns returns mapping for columns it knows; use those
            for k, v in rm.items():
                rename[k] = v
        except Exception:
            pass

    # For remaining columns, attempt fuzzy match
    remaining = [c for c in cols if c not in rename]
    for c in remaining:
        best = _best_match(c, CANONICAL)
        if best:
            rename[c] = best
    return rename

def normalize_dates_and_numbers(df):
    # parse dates with dayfirst True (India style) but allow fallback
    for d in ["sanction_date", "start_date", "expected_end_date", "actual_end_date"]:
        if d in df.columns:
            df[d] = pd.to_datetime(df[d], errors="coerce", dayfirst=True)
    # numeric normalization
    for n in ["sanction_amount", "expenditure_to_date"]:
        if n in df.columns:
            df[n] = df[n].astype(str).str.replace(r"[^\d\.\-eE]", "", regex=True).replace("", "0")
            df[n] = pd.to_numeric(df[n], errors="coerce").fillna(0.0)
    return df

def construct_canonical_df(df, rename_map):
    # rename columns
    df = df.rename(columns=rename_map)
    # ensure canonical columns exist
    for c in CANONICAL:
        if c not in df.columns:
            # default values: numeric -> 0.0, dates -> NaT, others -> empty string
            if "amount" in c or "expenditure" in c:
                df[c] = 0.0
            elif "date" in c:
                df[c] = pd.NaT
            else:
                df[c] = ""
    # keep only canonical columns in canonical order
    df = df[CANONICAL].copy()
    # normalize types
    df = normalize_dates_and_numbers(df)
    # format dates to ISO strings for CSV
    for d in ["sanction_date", "start_date", "expected_end_date", "actual_end_date"]:
        if d in df.columns:
            df[d] = df[d].dt.strftime("%Y-%m-%d")
    return df

def write_to_sources(df_canonical, source):
    PN_DATA.mkdir(parents=True, exist_ok=True)
    if source == "auto":
        for k, p in SRC_FILES.items():
            df_canonical.to_csv(p, index=False, encoding="utf-8")
            logger.info("Wrote normalized CSV to %s", p)
    else:
        if source not in SRC_FILES:
            raise ValueError("Invalid source. Choose recommended|sanctioned|completed|auto")
        dest = SRC_FILES[source]
        df_canonical.to_csv(dest, index=False, encoding="utf-8")
        logger.info("Wrote normalized CSV to %s", dest)

def run_pipeline(venv_python):
    # run finalize_merge.py
    run_cmd = lambda cmd, cwd=None: subprocess.run(cmd, shell=True, cwd=cwd, check=True)
    logger.info("Running finalize_merge.py")
    run_cmd(f"{venv_python} project-normalizer/src/finalize_merge.py", cwd=str(ROOT))
    logger.info("Running prepare_for_model.py")
    run_cmd(f"{venv_python} project-normalizer/src/prepare_for_model.py", cwd=str(ROOT))
    logger.info("Running prepare_data.py")
    # FIX: run prepare_data.py relative to the mplads-ml working directory to avoid duplicated path
    run_cmd(f"{venv_python} src/prepare_data.py", cwd=str(ROOT / "mplads-ml"))
    # detect_anomalies may not exist; run if present
    detect_script = ROOT / "mplads-ml" / "src" / "detect_anomalies.py"
    if detect_script.exists():
        logger.info("Running detect_anomalies.py")
        run_cmd(f"{venv_python} {detect_script}", cwd=str(ROOT / "mplads-ml"))
    else:
        logger.info("detect_anomalies.py not found; skipping anomaly detection")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", "-i", required=True, help="Path to user CSV")
    p.add_argument("--source", "-s", default="auto", help="recommended|sanctioned|completed|auto")
    p.add_argument("--run-pipeline", action="store_true", help="Run downstream pipeline after normalizing")
    p.add_argument("--venv-python", default=sys.executable, help="Python executable to run pipeline")
    args = p.parse_args()

    input_path = Path(args.input).resolve()
    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")
    if input_path.stat().st_size == 0:
        raise SystemExit(f"Input CSV is empty: {input_path}")

    logger.info("Reading user CSV: %s", input_path)
    try:
        df = pd.read_csv(input_path, dtype=str, keep_default_na=False, na_values=["", "NA", "NaN"], low_memory=False)
    except pd.errors.EmptyDataError:
        raise SystemExit(f"Input CSV has no header or rows: {input_path}")
    if df.empty and len(df.columns) == 0:
        raise SystemExit(f"Input CSV has no columns: {input_path}")

    # Build rename map and canonical df
    rename_map = build_rename_map(df.columns)
    logger.info("Rename map (sample): %s", {k: rename_map[k] for k in list(rename_map)[:10]})
    df_canonical = construct_canonical_df(df, rename_map)

    # Write normalized CSV to source files
    write_to_sources(df_canonical, args.source)

    # Let callers choose whether normalization is standalone or full-chain.
    # The backend orchestrates downstream steps itself, so it intentionally does not pass this flag.
    if args.run_pipeline:
        run_pipeline(args.venv_python)

    logger.info("Done. Outputs:")
    if args.source == "auto":
        for pth in SRC_FILES.values():
            logger.info(" - %s", pth)
    else:
        logger.info(" - %s", SRC_FILES[args.source])
    if args.run_pipeline:
        logger.info(" - %s", PN_DATA / "finalized.csv")
        logger.info(" - %s", ML_DATA / "mplads_raw_for_model.csv")
        logger.info(" - %s", ML_DATA / "mplads_clean.csv")
        logger.info(" - %s", ML_DATA / "mplads_anomalies.csv (if detect_anomalies exists)")

if __name__ == "__main__":
    main()
