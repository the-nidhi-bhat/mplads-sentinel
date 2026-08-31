# src/finalize_merge.py
import pandas as pd
import numpy as np
import logging
from pathlib import Path
from normalize_headers import map_columns, load_schema

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

BASE = Path(__file__).resolve().parents[1]
DATA_DIR = BASE / "data"
RECOMMENDED = DATA_DIR / "works_recommended.csv"
SANCTIONED = DATA_DIR / "works_sanctioned.csv"
COMPLETED = DATA_DIR / "works_completed.csv"
OUT_FINAL = DATA_DIR / "finalized.csv"

CANONICAL_FIELDS = [
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


def read_and_map(path):
    """
    Robust reader + mapper for a source CSV.

    Behavior:
      - If file missing or empty, returns an empty DataFrame with a project_id column.
      - If file has data, attempts to map columns using map_columns().
      - If project_id is missing in a non-empty file after mapping, tries common fallbacks.
      - If still missing and rows exist, raises KeyError to force user/schema fix.
    """
    p = Path(path)
    # If file missing or zero bytes, return empty df with project_id column
    if not p.exists() or p.stat().st_size == 0:
        return pd.DataFrame({"project_id": pd.Series(dtype=str)})

    try:
        df = pd.read_csv(path, dtype=str, encoding="utf-8", low_memory=False)
    except pd.errors.EmptyDataError:
        # empty CSV (no header / no data)
        return pd.DataFrame({"project_id": pd.Series(dtype=str)})

    # If read succeeded but no columns (rare), treat as empty
    if df.shape[1] == 0:
        return pd.DataFrame({"project_id": pd.Series(dtype=str)})

    # normalize column names and apply mapping
    df.columns = [c.strip() for c in df.columns]
    try:
        rename_map, canonical_order = map_columns(df.columns)
    except Exception:
        rename_map, canonical_order = {}, []

    if rename_map:
        # Only rename keys that actually exist in df to avoid KeyError
        valid_renames = {k: v for k, v in rename_map.items() if k in df.columns}
        if valid_renames:
            df = df.rename(columns=valid_renames)

    # If project_id not present but file has data, try common fallbacks
    if "project_id" not in df.columns:
        # Only attempt fallbacks when the dataframe has at least one non-empty column
        if df.shape[1] == 0 or df.dropna(how="all").shape[0] == 0:
            return pd.DataFrame({"project_id": pd.Series(dtype=str)})
        for fallback in ["id", "proj_id", "sr. no.", "sr no", "srno", "projectid", "project id"]:
            if fallback in df.columns:
                df = df.rename(columns={fallback: "project_id"})
                break

    # If still missing project_id and dataframe has rows, raise so user can fix mapping
    if "project_id" not in df.columns:
        if df.shape[0] == 0:
            return pd.DataFrame({"project_id": pd.Series(dtype=str)})
        raise KeyError(f"project_id not found in {path}. Add mapping to schema/final_schema.json")

    df["project_id"] = df["project_id"].astype(str).str.strip()
    return df


def coalesce_row(row, field):
    """
    Coalesce for a single row and canonical field name.
    Order: <field>_completed, <field>_sanctioned, <field>_recommended
    """
    for suffix in ("_completed", "_sanctioned", "_recommended"):
        col = field + suffix
        if col not in row.index:
            continue
        val = row[col]
        try:
            if hasattr(val, "__iter__") and not isinstance(val, (str, bytes)):
                for v in val:
                    if not pd.isna(v) and str(v).strip() != "":
                        return v
                continue
        except Exception:
            pass
        if pd.isna(val):
            continue
        sval = str(val).strip()
        if sval == "":
            continue
        return val
    return np.nan


def _find_date_candidates(columns, keyword="sanction_date"):
    """
    Return list of column names that likely contain date values for the given keyword.
    """
    cand = []
    for c in columns:
        lc = c.lower()
        if keyword in lc:
            cand.append(c)
        # catch patterns like 'date_sanctioned' or 'sanctioned_date'
        elif "date" in lc and ("sanction" in lc or "sanctioned" in lc):
            cand.append(c)
    # dedupe preserving order
    seen = set()
    out = []
    for c in cand:
        if c not in seen:
            out.append(c)
            seen.add(c)
    return out


def run_merge(san_path=None, com_path=None, rec_path=None, out_path=None):
    """
    Merge the three normalized source files into the finalized model input.

    Parameters are file paths so the merge can be exercised against temporary
    files in tests without touching the real project data directory. Each
    defaults to the module-level SANCTIONED / COMPLETED / RECOMMENDED /
    OUT_FINAL paths.

    Returns the finalized DataFrame (canonical fields only).
    """
    san_path = Path(san_path) if san_path else SANCTIONED
    com_path = Path(com_path) if com_path else COMPLETED
    rec_path = Path(rec_path) if rec_path else RECOMMENDED
    out_path = Path(out_path) if out_path else OUT_FINAL

    # Read each source; read_and_map returns empty DataFrame with project_id if missing/empty
    rec = read_and_map(rec_path)
    san = read_and_map(san_path)
    com = read_and_map(com_path)

    # Ensure each DataFrame has at least the project_id column (read_and_map guarantees this)
    for df in (rec, san, com):
        if "project_id" not in df.columns:
            df["project_id"] = ""

    # provenance flags used internally but not written to final CSV
    rec["from_recommended"] = True
    san["from_sanctioned"] = True
    com["from_completed"] = True

    # suffix each source and keep project_id canonical
    # If a DataFrame is empty (only project_id), add no-op columns are fine; add_suffix works
    rec = rec.add_suffix("_recommended").rename(columns={"project_id_recommended": "project_id"})
    san = san.add_suffix("_sanctioned").rename(columns={"project_id_sanctioned": "project_id"})
    com = com.add_suffix("_completed").rename(columns={"project_id_completed": "project_id"})

    # outer merge
    merged = pd.merge(pd.merge(rec, san, on="project_id", how="outer"), com, on="project_id", how="outer")

    # If duplicate column labels exist, keep first occurrence
    if merged.columns.duplicated().any():
        dup_cols = [c for i, c in enumerate(merged.columns) if merged.columns.duplicated()[i]]
        logger.warning("duplicate column labels detected and removed (keeping first occurrence): %s", dup_cols)
        merged = merged.loc[:, ~merged.columns.duplicated()]

    # Ensure provenance flags exist and are boolean (kept only internally)
    for f in ["from_recommended", "from_sanctioned", "from_completed"]:
        if f not in merged.columns:
            merged[f] = False
        merged[f] = merged[f].fillna(False)

    # --- Explicit coalesce for sanction_date from source-specific columns ---
    date_candidates = _find_date_candidates(merged.columns, keyword="sanction_date")
    # Preferred explicit names first
    preferred_dates = []
    for pref in ("sanction_date_recommended", "sanction_date_sanctioned", "sanction_date_completed"):
        if pref in merged.columns:
            preferred_dates.append(pref)
    for c in date_candidates:
        if c not in preferred_dates:
            preferred_dates.append(c)

    # Ensure canonical sanction_date exists
    if "sanction_date" not in merged.columns:
        merged["sanction_date"] = pd.NA

    # Coalesce preferred date columns into canonical sanction_date
    for c in preferred_dates:
        if c not in merged.columns:
            continue
        try:
            merged["sanction_date"] = merged["sanction_date"].fillna(merged[c])
        except Exception:
            merged["sanction_date"] = merged["sanction_date"].fillna(merged[c].astype(str).replace({"": pd.NA}))

    # If still missing, try any other date-like candidates
    for c in date_candidates:
        if c == "sanction_date" or c in preferred_dates:
            continue
        try:
            merged["sanction_date"] = merged["sanction_date"].fillna(merged[c])
        except Exception:
            merged["sanction_date"] = merged["sanction_date"].fillna(merged[c].astype(str).replace({"": pd.NA}))

    # Preserve raw sanction_date for debugging
    merged["_sanction_date_raw"] = merged["sanction_date"].astype(str)

    # --- Generic coalescing for other canonical fields (skip sanction_date because handled) ---
    for fld in CANONICAL_FIELDS[1:]:
        if fld == "sanction_date":
            continue
        # sanction_amount must ALWAYS come from the sanctioned source. The
        # completed/recommended sources do not carry a sanctioned amount (they
        # are 0/blank) and must never overwrite it, so it is not coalesced.
        if fld == "sanction_amount":
            continue
        merged[fld] = merged.apply(lambda r: coalesce_row(r, fld), axis=1)

    # --- sanction_amount from the sanctioned source only ---
    # The completed/recommended sources have no sanctioned amount, so a naive
    # coalesce (or outer merge with completed first) would blank it. Fill it
    # exclusively from the sanctioned dataframe.
    if "sanction_amount_sanctioned" in merged.columns:
        merged["sanction_amount"] = merged["sanction_amount_sanctioned"]
    elif "sanction_amount" not in merged.columns:
        merged["sanction_amount"] = 0.0

    # --- expenditure_to_date: prefer completed, then sanctioned source ---
    # The sanctioned export has no expenditure column (always 0); the completed
    # export carries the real disbursed amount. Prefer completed, fall back to
    # whatever sanctioned/recommended supplied (e.g. a row only present in the
    # sanctioned source).
    if "expenditure_to_date" not in merged.columns:
        merged["expenditure_to_date"] = 0.0
    if "expenditure_to_date_completed" in merged.columns:
        com_exp = merged["expenditure_to_date_completed"].astype(str).replace({"": pd.NA, "nan": pd.NA, "0.0": pd.NA, "0": pd.NA})
        merged["expenditure_to_date"] = com_exp.where(com_exp.notna(), merged["expenditure_to_date"])

    # --- actual_end_date from the completed source when available ---
    # The completed export carries the real Completion Date; a completed match
    # is the authoritative source for this field.
    if "actual_end_date" not in merged.columns:
        merged["actual_end_date"] = pd.NA
    if "actual_end_date_completed" in merged.columns:
        com_end = merged["actual_end_date_completed"].astype(str).replace({"": pd.NA, "nan": pd.NA, "NaT": pd.NA})
        merged["actual_end_date"] = com_end.where(com_end.notna(), merged["actual_end_date"])

    # ensure project_id present
    if "project_id" not in merged.columns:
        raise SystemExit("project_id missing after merge")

    # ensure canonical columns exist and in exact order
    final_cols = CANONICAL_FIELDS.copy()
    for c in final_cols:
        if c not in merged.columns:
            merged[c] = 0 if ("amount" in c or "expenditure" in c) else ""

    # Build final DataFrame WITHOUT provenance flags
    merged_final = merged[final_cols].copy()

    # normalize dates and numbers
    for d in ["sanction_date", "start_date", "expected_end_date", "actual_end_date"]:
        merged_final[d] = pd.to_datetime(merged_final[d], errors="coerce").dt.strftime("%Y-%m-%d")

    for n in ["sanction_amount", "expenditure_to_date"]:
        merged_final[n] = (
            merged_final[n].astype(str)
            .str.replace(r"[^\d\.\-eE]", "", regex=True)
            .replace("", "0")
            .astype(float)
            .fillna(0.0)
        )

    # Save finalized CSV
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    merged_final.to_csv(out_path, index=False, encoding="utf-8")
    logger.info("Saved finalized file to %s", out_path)
    logger.info("Rows: %d Unique project_id: %d", len(merged_final), merged_final["project_id"].nunique())

    return merged_final


def main():
    run_merge()


if __name__ == "__main__":
    main()
