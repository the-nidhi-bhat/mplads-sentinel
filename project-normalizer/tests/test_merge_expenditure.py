"""
Regression tests for the sanctioned + completed works merge.

Covers three related bugs that made expenditure_to_date wrong/zero:

  Bug 1 - project_id was the per-export Sr. No. row index, causing unrelated
          rows in the sanctioned and completed exports to be joined on a
          shared row number. The real unique key is the work reference number
          embedded in the Work column.
  Bug 2 - the completed-works export's columns were not all mapped (Amount
          Disbursed -> expenditure_to_date, Completion Date -> actual_end_date).
  Bug 3 - finalize_merge.py overwrote sanction_amount with the completed
          source's blank/zero value instead of preserving the sanctioned value.

Uses real sample rows taken from the actual MPLADS exports (work id 133166:
sanctioned 497185, completed disbursed 497185, completion date 14-Oct-2024).
"""
import sys
from pathlib import Path

import pandas as pd

SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

from normalize_user_csv import build_rename_map, construct_canonical_df  # noqa: E402
import finalize_merge  # noqa: E402

# Real row extracted from the sanctioned-works export.
SANCTIONED_ROW = {
    "Sr. No.": "1",
    "Work category": "Normal/Others",
    "Work": "WS/ MP620/2024-2025/133166-Construction of buildings for community cultural activities",
    "State": "Karnataka",
    "IDA": "DHARWAD(DEPUTY COMMISSIONER DHARWAR_IDA)",
    "Hon'ble Members of Parliament": "Pralhad Venkatesh Joshi",
    "Constituency": "DHARWAD",
    "Work description": "Construction of Community Bhavan at Navalgund",
    "Sanction Date": "09-Jul-24",
    "Sanction Amount ( \u20b9 )": "497185",
    "Work Status": "Physical Inspection",
}

# Real row extracted from the completed-works export (note stray tab in Work).
COMPLETED_ROW = {
    "Sr. No.": "1",
    "Work Category": "Normal/Others",
    "Work": "WS/\t MP620/2024-2025/133166-Construction of buildings for community cultural activities",
    "State": "Karnataka",
    "IDA": "DHARWAD(DEPUTY COMMISSIONER DHARWAR_IDA)",
    "Work Description": "Construction of Community Bhavan at Navalgund",
    "Hon'ble Members of Parliament": "Pralhad Venkatesh Joshi",
    "Constituency": "DHARWAD",
    "Image": "N/A",
    "Completion Date": "14-Oct-2024",
    "Amount Disbursed ( \u20b9 )": "497185",
}


def test_extract_work_id_uses_embedded_number_not_sr_no():
    # Bug 1: project_id must be the work reference number (133166), not the
    # row's Sr. No. (1), and must survive the stray tab in the completed Work.
    for src, row, expected in (
        ("sanctioned", SANCTIONED_ROW, "133166"),
        ("completed", COMPLETED_ROW, "133166"),
    ):
        df = pd.DataFrame([row])
        normalized = construct_canonical_df(df, build_rename_map(df.columns, source=src), source=src)
        assert normalized.loc[0, "project_id"] == expected, f"{src} project_id should be {expected}"


def test_completed_columns_map_to_canonical_fields():
    # Bug 2: Amount Disbursed -> expenditure_to_date, Completion Date ->
    # actual_end_date must be populated for the completed source.
    df = pd.DataFrame([COMPLETED_ROW])
    normalized = construct_canonical_df(df, build_rename_map(df.columns, source="completed"), source="completed")
    assert normalized.loc[0, "expenditure_to_date"] == 497185.0
    assert normalized.loc[0, "actual_end_date"] == "2024-10-14"
    # mp_name and district also come from this source.
    assert normalized.loc[0, "mp_name"] == "Pralhad Venkatesh Joshi"
    assert normalized.loc[0, "district"] == "DHARWAD"


def test_merge_preserves_sanction_amount_and_fills_expenditure(tmp_path):
    # Bug 3: after merging the matching sanctioned + completed rows on the real
    # work id, sanction_amount must come from sanctioned, while expenditure and
    # actual_end_date must be filled from completed.
    san_df = construct_canonical_df(
        pd.DataFrame([SANCTIONED_ROW]),
        build_rename_map(pd.DataFrame([SANCTIONED_ROW]).columns, source="sanctioned"),
        source="sanctioned",
    )
    com_df = construct_canonical_df(
        pd.DataFrame([COMPLETED_ROW]),
        build_rename_map(pd.DataFrame([COMPLETED_ROW]).columns, source="completed"),
        source="completed",
    )

    san_path = tmp_path / "works_sanctioned.csv"
    com_path = tmp_path / "works_completed.csv"
    rec_path = tmp_path / "works_recommended.csv"
    out_path = tmp_path / "finalized.csv"

    san_df.to_csv(san_path, index=False, encoding="utf-8")
    com_df.to_csv(com_path, index=False, encoding="utf-8")
    pd.DataFrame(columns=["project_id"]).to_csv(rec_path, index=False, encoding="utf-8")

    merged = finalize_merge.run_merge(
        san_path=str(san_path),
        com_path=str(com_path),
        rec_path=str(rec_path),
        out_path=str(out_path),
    )

    row = merged[merged["project_id"] == "133166"]
    assert len(row) == 1
    row = row.iloc[0]
    assert row["sanction_amount"] == 497185.0, "sanction_amount must be preserved from sanctioned source"
    assert row["expenditure_to_date"] == 497185.0, "expenditure_to_date must come from completed source"
    assert row["actual_end_date"] == "2024-10-14", "actual_end_date must come from completed source"
