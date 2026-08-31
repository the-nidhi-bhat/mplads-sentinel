import sys
from pathlib import Path

import pandas as pd


SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

from normalize_user_csv import build_rename_map, construct_canonical_df


def test_sanctioned_works_headers_map_to_distinct_fields():
    raw = pd.DataFrame(
        {
            "Sr. No.": ["1"],
            "IDA": ["Dharwad agency"],
            "Work category": ["Normal/Others"],
            "Work": ["Construction of a community hall"],
            "State": ["Karnataka"],
            "Work Status": ["Physical Inspection"],
            "Sanction Date": ["2024-07-09"],
            "Sanction Amount ( ₹ )": ["497185"],
            "Hon'ble Members of Parliament": ["Example MP"],
            "Constituency": ["Dharwad"],
        }
    )

    normalized = construct_canonical_df(raw, build_rename_map(raw.columns))

    assert normalized.columns.is_unique
    assert normalized.loc[0, "project_id"] == "1"
    assert normalized.loc[0, "agency_id"] == "Dharwad agency"
    assert normalized.loc[0, "work_type"] == "Normal/Others"
    assert normalized.loc[0, "work_title"] == "Construction of a community hall"
    assert normalized.loc[0, "state"] == "Karnataka"
    assert normalized.loc[0, "status"] == "Physical Inspection"
    assert normalized.loc[0, "sanction_date"] == "2024-07-09"
    assert normalized.loc[0, "start_date"] == "2024-07-09"


def test_summary_rows_are_excluded_from_canonical_output():
    raw = pd.DataFrame(
        {
            "Sr. No.": ["1", "Grand Total"],
            "Work category": ["Normal/Others", ""],
            "Sanction Date": ["2024-07-09", ""],
            "Sanction Amount ( ₹ )": ["100", "100"],
            "Work Status": ["Sanction", "100"],
        }
    )

    normalized = construct_canonical_df(raw, build_rename_map(raw.columns))

    assert normalized["project_id"].tolist() == ["1"]
