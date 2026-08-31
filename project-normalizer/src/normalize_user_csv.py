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
import re
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
    "state",
    "agency_id",
    "work_type",
    "work_title",
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
    "state": ["state", "state_name"],
    "agency_id": ["ida", "implementing_agency", "implementing agency"],
    "work_type": ["worktype", "type_of_work", "project_type"],
    "work_title": ["work", "project_title", "work_title"],
    "sanction_date": ["sanctiondate", "date_of_sanction", "date_sanctioned", "sanctioned_date"],
    "sanction_amount": ["sanctionamount", "amount_sanctioned", "sanctioned_amount", "amount"],
    "expenditure_to_date": ["expenditure", "expenditure_to_date", "exp_to_date", "expendituretodate", "spent"],
    "start_date": ["startdate", "date_start", "commencement_date"],
    "expected_end_date": ["expectedenddate", "expected_end", "expected_completion_date"],
    "actual_end_date": ["actualenddate", "actual_end", "completion_date", "date_completed"],
    "status": ["project_status", "current_status"],
}

# The sanctioned-works export has several headers that are intentionally
# similar to canonical names. Apply exact mappings after generic schema and
# fuzzy matching so each source column has one unambiguous destination.
SOURCE_HEADER_OVERRIDES = {
    "sr. no.": "project_id",
    "ida": "agency_id",
    "work category": "work_type",
    "work": "work_title",
    "state": "state",
    "work status": "status",
    "sanction date": "sanction_date",
}

# Explicit mappings for the MPLADS "Works Completed" (Lok Sabha) export.
# These are applied on top of the generic schema/fuzzy mapping for the
# "completed" source. They are stricter than the generic path so the correct
# canonical field is targeted even when a header is ambiguous (for example
# "Work" would otherwise map to work_title, but it is also our project_id
# source via the embedded work reference number).
SOURCE_HEADER_OVERRIDES_COMPLETED = {
    "sr. no.": "project_id",
    "work": "work_title",
    "work category": "work_type",
    "state": "state",
    "ida": "agency_id",
    "work description": "work_description",
    "hon'ble members of parliament": "mp_name",
    "constituency": "district",
    "completion date": "actual_end_date",
    "amount disbursed ( ? )": "expenditure_to_date",
}

# The real unique work reference number is embedded in the Work column, e.g.
#   WS/ MP620/2024-2025/133166-Construction of buildings ...
# The id is the number directly after the year-range segment and before the
# dash (133166 above). Anchoring on the year range avoids accidentally matching
# the year range start (2024-2025 -> would match 2024 with a naive /(\d+)-).
WORK_ID_RE = re.compile(r"/\d{4}-\d{4}/(\d+)-")
# Canonical field used when the completed source provides free-text work
# description that has no dedicated canonical column. Appended to work_title.
WORK_DESCRIPTION_CANONICAL = "work_description"


def extract_work_id(work_values, logger=logger):
    """Extract the embedded work reference number from a Work column.

    Accepts a pandas Series (or iterable) of raw Work strings and returns a
    Series of extracted ids (empty string where none matched). A count of rows
    where extraction failed is reported via the logger so no row is silently
    dropped or mis-joined.
    """
    ids = work_values.astype("string").fillna("").str.extract(WORK_ID_RE, expand=False)
    ids = ids.fillna("").astype(str).str.strip()
    unmatched = int((ids == "").sum())
    if unmatched:
        logger.warning("Could not extract work reference number from %d Work value(s)", unmatched)
    return ids


SUMMARY_PROJECT_ID_PATTERN = r"^(?:grand\s+)?(?:sub\s+)?total(?:s)?$"


def drop_summary_rows(df):
    """Remove spreadsheet-export total rows before they become projects.

    Government CSV exports commonly append a final row such as ``Grand
    Total``. It has no project metadata and its aggregate amount can otherwise
    be shifted into a canonical field during normalization.
    """
    if "project_id" not in df.columns:
        return df
    project_ids = df["project_id"].astype("string").str.strip()
    summary_rows = project_ids.str.match(SUMMARY_PROJECT_ID_PATTERN, case=False, na=False)
    if summary_rows.any():
        logger.warning("Dropping %d spreadsheet summary row(s)", int(summary_rows.sum()))
        df = df.loc[~summary_rows].copy()
    return df

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

def build_rename_map(df_columns, source=None):
    """
    Try to build a rename_map mapping input columns -> canonical columns.
    Uses map_columns() if available; otherwise uses fuzzy matching and synonyms.

    When ``source == "completed"``, the strict completed-works overrides are
    applied on top of the generic mapping so the export's headers land on the
    correct canonical fields.
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

    for c in cols:
        override = SOURCE_HEADER_OVERRIDES.get(c.lower().strip())
        if override:
            rename[c] = override

    if source == "completed":
        for c in cols:
            override = SOURCE_HEADER_OVERRIDES_COMPLETED.get(c.lower().strip())
            if override:
                rename[c] = override
    return rename

def normalize_dates_and_numbers(df):
    # Preserve unambiguous ISO dates before applying the India-style fallback.
    # With pandas 3, applying dayfirst=True to an ISO value such as
    # 2024-03-01 can silently change it to 3 January.
    for d in ["sanction_date", "start_date", "expected_end_date", "actual_end_date"]:
        if d in df.columns:
            raw_dates = df[d].astype("string").str.strip().replace("", pd.NA)
            parsed_dates = pd.Series(pd.NaT, index=df.index, dtype="datetime64[ns]")
            iso_dates = raw_dates.str.match(r"^\d{4}-\d{2}-\d{2}(?:$|[T\s])", na=False)
            parsed_dates.loc[iso_dates] = pd.to_datetime(
                raw_dates.loc[iso_dates].str.slice(0, 10), format="%Y-%m-%d", errors="coerce"
            )
            non_iso_dates = raw_dates.notna() & ~iso_dates
            if non_iso_dates.any():
                parsed_dates.loc[non_iso_dates] = pd.to_datetime(
                    raw_dates.loc[non_iso_dates], errors="coerce", format="mixed", dayfirst=True
                )
            malformed = raw_dates.notna() & parsed_dates.isna()
            if malformed.any():
                logger.warning("Could not parse %d %s value(s)", int(malformed.sum()), d)
            df[d] = parsed_dates
    # numeric normalization
    for n in ["sanction_amount", "expenditure_to_date"]:
        if n in df.columns:
            df[n] = df[n].astype(str).str.replace(r"[^\d\.\-eE]", "", regex=True).replace("", "0")
            df[n] = pd.to_numeric(df[n], errors="coerce").fillna(0.0)
    return df

def construct_canonical_df(df, rename_map, source=None):
    # rename columns
    df = df.rename(columns=rename_map)
    # For the completed source, free-text work description has no dedicated
    # canonical column; preserve it by appending to work_title. Strip any
    # existing work value first to avoid duplicating the work string.
    if source == "completed" and WORK_DESCRIPTION_CANONICAL in df.columns:
        work_desc = df[WORK_DESCRIPTION_CANONICAL].astype("string").fillna("").str.strip()
        if "work_title" in df.columns:
            work_title = df["work_title"].astype("string").fillna("").str.strip()
            df["work_title"] = work_title.where(work_title.ne(""), work_desc)
        # drop the temporary field so it does not leak into canonical output
        df = df.drop(columns=[WORK_DESCRIPTION_CANONICAL])
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
    df = drop_summary_rows(df)
    # Use the real embedded work reference number as project_id for the
    # sanctioned and completed sources instead of the per-export Sr. No. row
    # index (which is local to each file and causes mis-joins downstream).
    if source in ("sanctioned", "completed") and "work_title" in df.columns:
        work_ids = extract_work_id(df["work_title"])
        if source == "completed":
            # completed rows may also carry a legitimately-empty Work; keep the
            # (now numeric) id where it was extracted.
            df["project_id"] = work_ids
        else:
            df["project_id"] = work_ids.where(work_ids.ne(""), df["project_id"])
    # normalize types
    df = normalize_dates_and_numbers(df)
    # A project's start date is its sanction date. Populate both fields at
    # normalization time so downstream stages receive the canonical value.
    df["start_date"] = df["sanction_date"].fillna(df["start_date"])
    df["sanction_date"] = df["sanction_date"].fillna(df["start_date"])
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
    rename_map = build_rename_map(df.columns, source=args.source)
    logger.info("Rename map (sample): %s", {k: rename_map[k] for k in list(rename_map)[:10]})
    df_canonical = construct_canonical_df(df, rename_map, source=args.source)

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
