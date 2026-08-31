import sys
from pathlib import Path

import pandas as pd


SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

from prepare_data import calculate_expected_end_date, clean_and_engineer


def test_expected_end_date_uses_sanction_date_and_category_duration():
    raw = pd.DataFrame(
        {
            "project_id": ["road", "legacy", "unknown"],
            "work_type": ["Roads & Bridges", "Trust and Society", "Unlisted work"],
            "sanction_date": ["2024-01-01", "", "2024-03-01"],
            "start_date": ["2024-01-20", "2024-02-01", "2024-03-02"],
            "expected_end_date": ["2099-01-01", "2099-01-01", "2099-01-01"],
            "actual_end_date": ["2024-07-01", "bad-date", ""],
            "sanction_amount": ["100", "100", "100"],
            "expenditure_to_date": ["50", "50", "50"],
        }
    )

    clean = clean_and_engineer(raw)

    assert clean.loc[0, "sanction_date"] == pd.Timestamp("2024-01-01")
    assert clean.loc[0, "start_date"] == pd.Timestamp("2024-01-01")
    assert clean.loc[0, "expected_end_date"] == pd.Timestamp("2024-06-29")
    assert clean.loc[1, "sanction_date"] == pd.Timestamp("2024-02-01")
    assert clean.loc[1, "expected_end_date"] == pd.Timestamp("2024-09-28")
    assert clean.loc[2, "expected_end_date"] == pd.Timestamp("2024-08-28")
    assert pd.isna(clean.loc[1, "actual_end_date"])


def test_calculate_expected_end_date_returns_missing_without_start_date():
    assert pd.isna(calculate_expected_end_date(pd.NaT, "Roads & Bridges"))
