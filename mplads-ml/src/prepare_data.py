# src/prepare_data.py
import os
import sys
import logging
import yaml
import pandas as pd
import numpy as np
import tempfile

# Module logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Resolve repository root and config path
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CONFIG_PATH = os.path.join(ROOT, "config.yml")

def load_config(path=CONFIG_PATH):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Config not found at {path}")
    with open(path, "r") as f:
        return yaml.safe_load(f)

cfg = load_config()

# Resolve model input and cleaned output paths relative to workspace root (make absolute)
_model_input = cfg.get('mplads_ml', {}).get('model_input_path', "mplads-ml/data/mplads_raw_for_model.csv")
if os.path.isabs(_model_input):
    RAW = _model_input
else:
    RAW = os.path.abspath(os.path.join(ROOT, _model_input))

_clean_path = cfg.get('mplads_ml', {}).get('cleaned_path', "mplads-ml/data/mplads_clean.csv")
if os.path.isabs(_clean_path):
    CLEAN = _clean_path
else:
    CLEAN = os.path.abspath(os.path.join(ROOT, _clean_path))

# Optional pipeline temp dir (may be relative in config; resolve to absolute)
_pipeline_temp = cfg.get('pipeline', {}).get('temp_dir', None)
if _pipeline_temp:
    if os.path.isabs(_pipeline_temp):
        PIPELINE_TEMP_DIR = _pipeline_temp
    else:
        PIPELINE_TEMP_DIR = os.path.abspath(os.path.join(ROOT, _pipeline_temp))
else:
    PIPELINE_TEMP_DIR = None

# Date parsing preference from config
DAYFIRST = bool(cfg.get('project_normalizer', {}).get('dayfirst', True))

# MPLADS project timeline norms. Keys are normalized work-type labels from
# raw exports, so the calculation does not depend on presentation casing.
WORK_TYPE_DURATION_DAYS = {
    "roads & bridges": 180,
    "water & sanitation": 180,
    "community infrastructure": 240,
    "drainage & sewerage": 180,
    "education infrastructure": 270,
    "health infrastructure": 240,
    # Categories found in the current MPLADS export.
    "bar and associations": 240,
    "trust and society": 240,
}
DEFAULT_DURATION_DAYS = 180


def normalize_work_type(work_type):
    """Return a stable key for duration lookup without changing raw output."""
    if pd.isna(work_type):
        return ""
    return " ".join(str(work_type).strip().casefold().split())


def parse_date_column(values, column_name):
    """Parse a date series without failing the batch on missing/bad values.

    ``format='mixed'`` is essential with pandas 3: its default parser infers
    one format from the first value and then rejects otherwise valid dates in
    the same CSV. ``utc=True`` removes timezone ambiguity before retaining
    date-only values for duration arithmetic.
    """
    raw_values = values.astype("string").str.strip().replace("", pd.NA)
    parsed = pd.Series(pd.NaT, index=raw_values.index, dtype="datetime64[ns]")

    # Do not pass ISO dates through day-first parsing: pandas interprets an
    # ISO value such as 2024-03-01 as 3 January when dayfirst=True. For an
    # ISO timestamp, retain its written calendar date instead of shifting it
    # when normalizing its timezone.
    iso_dates = raw_values.str.match(r"^\d{4}-\d{2}-\d{2}(?:$|[T\s])", na=False)
    parsed.loc[iso_dates] = pd.to_datetime(
        raw_values.loc[iso_dates].str.slice(0, 10), format="%Y-%m-%d", errors="coerce"
    )
    non_iso_dates = raw_values.notna() & ~iso_dates
    if non_iso_dates.any():
        parsed.loc[non_iso_dates] = pd.to_datetime(
            raw_values.loc[non_iso_dates],
            errors="coerce",
            format="mixed",
            dayfirst=DAYFIRST,
            utc=True,
        ).dt.tz_localize(None)
    parsed = parsed.dt.normalize()
    malformed = raw_values.notna() & parsed.isna()
    if malformed.any():
        logger.warning(
            "Could not parse %d %s value(s); retaining them as missing dates",
            int(malformed.sum()), column_name,
        )
    return parsed


def calculate_expected_end_date(start_date, work_type):
    """Calculate expected completion from the authoritative project start date."""
    if pd.isna(start_date):
        return pd.NaT
    duration = WORK_TYPE_DURATION_DAYS.get(
        normalize_work_type(work_type), DEFAULT_DURATION_DAYS
    )
    return pd.Timestamp(start_date).normalize() + pd.Timedelta(days=duration)


def atomic_write_df(df, dest_path, temp_dir=None):
    """
    Atomically write a DataFrame to dest_path.
    If temp_dir is provided, ensure it exists; otherwise use dest directory.
    """
    dest_dir = os.path.dirname(dest_path) or "."
    os.makedirs(dest_dir, exist_ok=True)

    # Resolve and ensure temp_dir exists; fall back to dest_dir on failure
    if temp_dir:
        if not os.path.isabs(temp_dir):
            temp_dir = os.path.abspath(os.path.join(ROOT, temp_dir))
        try:
            os.makedirs(temp_dir, exist_ok=True)
        except Exception as e:
            logger.warning("Could not create temp_dir %s (%s); falling back to dest_dir %s", temp_dir, e, dest_dir)
            temp_dir = dest_dir
    else:
        temp_dir = dest_dir

    tmp = tempfile.NamedTemporaryFile(delete=False, dir=temp_dir, suffix=".csv")
    tmp.close()
    try:
        df.to_csv(tmp.name, index=False)
        os.replace(tmp.name, dest_path)  # atomic on most OSes
        logger.info("Wrote file atomically to %s", dest_path)
    except Exception:
        # Clean up temp file on error
        try:
            os.remove(tmp.name)
        except Exception:
            pass
        raise


def load_raw(path=None):
    """
    Load the raw model input CSV. If path is None, uses RAW constant resolved from config.
    Reads as strings to avoid premature coercion; let clean_and_engineer handle types.
    """
    if path is None:
        path = RAW
    logger.info("Loading raw input from %s", path)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Raw input not found at {path}")
    # Read as strings to avoid pandas guessing types (currency symbols, commas, mixed units)
    return pd.read_csv(path, dtype=str, keep_default_na=False, na_values=["", "NA", "NaN"])


def detect_possible_unit_error(row):
    try:
        s = float(row.get("sanction_amount", 0) or 0)
        e = float(row.get("expenditure_to_date", 0) or 0)
    except Exception:
        return 0
    if s == 0 or e == 0:
        return 0
    ratio = max(s / e, e / s)
    return 1 if ratio > 1e4 else 0


def clean_and_engineer(df):
    logger.info("Starting clean_and_engineer on %d rows", len(df))

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_", regex=False)

    # Ensure project_id exists and normalized
    if "project_id" in df.columns:
        df["project_id"] = df["project_id"].astype(str).str.strip()
    else:
        raise KeyError("project_id column not found in raw data")

    # Numeric coercion: strip non-numeric characters then coerce
    for col in ["sanction_amount", "expenditure_to_date"]:
        if col in df.columns:
            # remove currency symbols and commas before numeric conversion
            df[col] = df[col].astype(str).replace({r'[^\d.\-]': ''}, regex=True)
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
            logger.info("Converted %s to numeric; NaNs filled: %d", col, df[col].isna().sum())
        else:
            df[col] = 0.0

    # Parse pipeline dates before feature engineering. A project starts when
    # it is sanctioned; start_date is a legacy fallback only when needed.
    raw_sanction_dates = df.get("sanction_date", pd.Series(pd.NA, index=df.index))
    raw_start_dates = df.get("start_date", pd.Series(pd.NA, index=df.index))
    df["sanction_date"] = parse_date_column(raw_sanction_dates, "sanction_date")
    supplied_start_dates = parse_date_column(raw_start_dates, "start_date")
    df["actual_end_date"] = parse_date_column(
        df.get("actual_end_date", pd.Series(pd.NA, index=df.index)), "actual_end_date"
    )

    if "last_update_date" in df.columns:
        df["last_update_date"] = pd.to_datetime(
            df["last_update_date"], errors="coerce", dayfirst=DAYFIRST
        )
    else:
        df["last_update_date"] = pd.NaT

    date_mismatch = (
        df["sanction_date"].notna()
        & supplied_start_dates.notna()
        & df["sanction_date"].ne(supplied_start_dates)
    )
    if date_mismatch.any():
        logger.warning(
            "Found %d row(s) where start_date differs from sanction_date; using sanction_date",
            int(date_mismatch.sum()),
        )
    fallback_start = df["sanction_date"].isna() & supplied_start_dates.notna()
    if fallback_start.any():
        logger.warning(
            "Using start_date as sanction_date for %d legacy row(s) with no sanction_date",
            int(fallback_start.sum()),
        )
    df["sanction_date"] = df["sanction_date"].fillna(supplied_start_dates)
    df["start_date"] = df["sanction_date"]

    # Standardize text fields
    for t in ["mp_name", "district", "state", "agency_id", "work_type", "work_title", "status"]:
        if t in df.columns:
            df[t] = df[t].astype(str).str.strip()
        else:
            df[t] = ""

    if "status" in df.columns:
        df["status"] = df["status"].replace({"nan": ""}).fillna("Sanctioned").astype(str).str.title()
    else:
        df["status"] = "Sanctioned"

    work_type_keys = df["work_type"].map(normalize_work_type)
    unknown_work_types = sorted(
        key for key in work_type_keys.unique()
        if key and key not in WORK_TYPE_DURATION_DAYS
    )
    if unknown_work_types:
        logger.warning(
            "Using the %d-day default duration for unmapped work_type values: %s",
            DEFAULT_DURATION_DAYS, ", ".join(unknown_work_types),
        )

    # The source expected_end_date is intentionally ignored: a consistent
    # deadline is derived from the authoritative start/sanction date.
    df["expected_end_date"] = [
        calculate_expected_end_date(start_date, work_type)
        for start_date, work_type in zip(df["start_date"], df["work_type"])
    ]

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

    # New feature: last_update_age (days since last_update_date)
    df["last_update_age"] = (today - df["last_update_date"]).dt.days
    df["last_update_age"] = df["last_update_age"].fillna(9999).astype(int)

    # New feature: possible_unit_error (binary flag)
    df["possible_unit_error"] = df.apply(detect_possible_unit_error, axis=1).astype(int)

    # Keep useful columns (ensure metadata preserved)
    keep = [
        "project_id", "mp_name", "district", "state", "agency_id", "work_type", "work_title", "sanction_date",
        "sanction_amount", "expenditure_to_date", "start_date", "expected_end_date", "actual_end_date",
        "status", "months_elapsed", "cost_overrun_ratio", "delay_days", "fund_utilization_speed",
        "percent_spent", "last_update_date", "last_update_age", "possible_unit_error"
    ]

    # Ensure columns exist and return subset
    for c in keep:
        if c not in df.columns:
            if c.endswith("_date") or "date" in c:
                df[c] = pd.NaT
            elif c in ["sanction_amount", "expenditure_to_date", "months_elapsed", "cost_overrun_ratio", "delay_days", "fund_utilization_speed", "percent_spent", "last_update_age", "possible_unit_error"]:
                df[c] = 0.0
            else:
                df[c] = ""

    logger.info("Finished engineering; returning %d columns", len(df.columns))
    return df[[c for c in keep if c in df.columns]]


if __name__ == "__main__":
    logger.info("Starting prepare_data main")
    df_raw = load_raw()
    df_clean = clean_and_engineer(df_raw)
    # Atomic write to avoid partial files being read by downstream steps
    atomic_write_df(df_clean, CLEAN, temp_dir=PIPELINE_TEMP_DIR)
    logger.info("Saved cleaned data to %s", CLEAN)
