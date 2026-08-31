# src/normalize_headers.py
"""
Robust normalize_headers helper.

- load_schema() tries to read schema/final_schema.json; if missing or invalid,
  it falls back to a built-in synonyms table.
- map_columns(raw_columns) returns (rename_map, canonical_order).
- clean_col_name() normalizes header strings for matching.
"""

import json
import re
import unicodedata
from pathlib import Path
from typing import List, Tuple, Dict

BASE = Path(__file__).resolve().parents[1]
SCHEMA_PATH = BASE / "schema" / "final_schema.json"

# Built-in canonical list and synonyms fallback (used if schema file missing)
FALLBACK_CANONICAL = [
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

FALLBACK_SYNONYMS = {
    "project_id": ["id", "proj_id", "sr no", "sr. no", "srno", "project no", "project number", "projectid"],
    "mp_name": ["mp", "mpname", "member_of_parliament", "name", "representative"],
    "district": ["dist", "district_name", "districtname", "districts"],
    "work_type": ["worktype", "type_of_work", "project_type", "type"],
    "sanction_date": ["sanctiondate", "date_of_sanction", "date_sanctioned", "sanctioned_date", "date_sanction"],
    "sanction_amount": ["sanctionamount", "amount_sanctioned", "sanctioned_amount", "amount", "sanction_amt"],
    "expenditure_to_date": ["expenditure", "exp_to_date", "expendituretodate", "spent", "expenditure_to_date"],
    "start_date": ["startdate", "date_start", "commencement_date", "commence_date"],
    "expected_end_date": ["expectedenddate", "expected_end", "expected_completion_date", "expected_completion"],
    "actual_end_date": ["actualenddate", "actual_end", "completion_date", "date_completed", "completed_on"],
    "status": ["project_status", "state", "current_status", "progress"],
}


def clean_col_name(s: str) -> str:
    """
    Normalize a column name for matching:
    - convert to str, normalize unicode, replace NBSP, lower-case
    - remove punctuation, collapse whitespace
    """
    if s is None:
        return ""
    s = str(s)
    # normalize unicode (NFKC) and replace non-breaking space
    s = unicodedata.normalize("NFKC", s).replace("\u00A0", " ")
    s = s.strip().lower()
    # replace non-word characters with space
    s = re.sub(r"[^\w\s]", " ", s)
    # collapse whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _build_alias_map_from_schema(schema: dict) -> Dict[str, str]:
    """
    Given schema dict {canonical: [aliases...]}, build alias_map mapping cleaned alias -> canonical.
    """
    alias_map = {}
    for canon, aliases in schema.items():
        # map canonical name itself
        alias_map[clean_col_name(canon)] = canon
        if isinstance(aliases, list):
            for a in aliases:
                alias_map[clean_col_name(a)] = canon
        else:
            # if schema entry is a single string, handle it
            alias_map[clean_col_name(str(aliases))] = canon
    return alias_map


def load_schema() -> Tuple[Dict[str, str], List[str]]:
    """
    Load schema from schema/final_schema.json.

    Returns:
      alias_map: dict mapping cleaned alias -> canonical name
      canonical_order: list of canonical field names

    If the schema file is missing or invalid, returns a fallback alias_map and canonical list.
    """
    try:
        if SCHEMA_PATH.exists():
            with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
                schema = json.load(f)
            # Expecting schema to be {canonical: [aliases...], ...}
            alias_map = _build_alias_map_from_schema(schema)
            canonical_order = list(schema.keys())
            return alias_map, canonical_order
    except Exception:
        # fall through to fallback
        pass

    # Fallback: build alias_map from built-in synonyms
    alias_map = {}
    for canon, syns in FALLBACK_SYNONYMS.items():
        alias_map[clean_col_name(canon)] = canon
        for s in syns:
            alias_map[clean_col_name(s)] = canon
    # ensure canonical entries present
    for c in FALLBACK_CANONICAL:
        alias_map.setdefault(clean_col_name(c), c)
    return alias_map, FALLBACK_CANONICAL.copy()


def map_columns(raw_columns: List[str]) -> Tuple[Dict[str, str], List[str]]:
    """
    Map raw_columns -> canonical names using schema aliases (or fallback).

    Returns:
      (rename_map, canonical_order)
      - rename_map: {original_column_name: canonical_name}
      - canonical_order: list of canonical names (for ordering)
    """
    alias_map, canonical_order = load_schema()
    mapped = {}
    # Build cleaned -> original mapping to preserve original casing/spelling
    cleaned_to_orig = {}
    for orig in raw_columns:
        if orig is None:
            continue
        cleaned = clean_col_name(orig)
        if cleaned == "":
            continue
        # If multiple original columns clean to same cleaned name, keep the first occurrence
        if cleaned not in cleaned_to_orig:
            cleaned_to_orig[cleaned] = orig

    # Map cleaned names using alias_map
    for cleaned, orig in cleaned_to_orig.items():
        if cleaned in alias_map:
            mapped[orig] = alias_map[cleaned]

    return mapped, canonical_order
