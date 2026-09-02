"""Read persisted model output and expose frontend-safe audit records."""

from pathlib import Path
from typing import Any
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
CLEAN_PATH = BASE_DIR / "mplads-ml" / "data" / "mplads_clean.csv"
ANOM_PATH = BASE_DIR / "mplads-ml" / "data" / "mplads_anomalies.csv"
RESULT_PATH = BASE_DIR / "mplads-ml" / "data" / "inspect_flagged.csv"

STATE_COORDINATES = {
    "ANDHRA PRADESH": [15.9129, 79.7400],
    "BIHAR": [25.0961, 85.3131],
    "GUJARAT": [22.2587, 71.1924],
    "JAMMU": [33.7782, 76.5762],
    "KARNATAKA": [15.3173, 75.7139],
    "MADHYA PRADESH": [22.9734, 78.6569],
    "MAHARASHTRA": [19.7515, 75.7139],
    "RAJASTHAN": [27.0238, 74.2179],
    "UTTAR PRADESH": [26.8467, 80.9462],
}

_CACHE: list[dict[str, Any]] | None = None
_CACHE_MTIME: float = 0.0


def _load_projects_cached() -> list[dict[str, Any]]:
    global _CACHE, _CACHE_MTIME
    source_file = CLEAN_PATH if CLEAN_PATH.exists() else RESULT_PATH
    if not source_file.exists():
        return []
    mtime = source_file.stat().st_mtime
    if _CACHE is not None and _CACHE_MTIME == mtime:
        return _CACHE

    if CLEAN_PATH.exists() and ANOM_PATH.exists():
        df_clean = pd.read_csv(CLEAN_PATH, dtype=str, keep_default_na=False)
        df_anom = pd.read_csv(ANOM_PATH, dtype=str, keep_default_na=False)
        df = df_clean.merge(df_anom, on="project_id", how="left", suffixes=("", "_anom"))
    else:
        df = pd.read_csv(RESULT_PATH, dtype=str, keep_default_na=False)

    df["anom_score_num"] = pd.to_numeric(df["anomaly_score"], errors="coerce").fillna(0.0)
    df["sanc_num"] = pd.to_numeric(df["sanction_amount"], errors="coerce").fillna(0.0)
    df["exp_num"] = pd.to_numeric(df["expenditure_to_date"], errors="coerce").fillna(0.0)
    df["delay_num"] = pd.to_numeric(df["delay_days"], errors="coerce").fillna(0.0)
    df["pct_spent_num"] = pd.to_numeric(df["percent_spent"], errors="coerce").fillna(0.0)

    records = []
    for _, row in df.iterrows():
        pid = str(row.get("project_id", "")).strip()
        if not pid:
            continue
        is_flagged_val = str(row.get("is_flagged", "False")).strip().lower() in ("true", "1")
        score = float(row["anom_score_num"])

        if is_flagged_val:
            raw_risk = 50 + int(abs(score) * 200)
            risk_score = max(50, min(100, raw_risk))
        else:
            raw_risk = int(max(0, (0.10 - score) / 0.10 * 45))
            risk_score = max(0, min(45, raw_risk))

        risk_level = "critical" if risk_score >= 80 else "high" if risk_score >= 60 else "medium" if risk_score >= 40 else "low"
        delay = float(row["delay_num"])
        spent = float(row["pct_spent_num"]) * 100

        finding = (
            f"Completion delayed by {round(delay)} days" if delay > 0
            else f"Fund utilization at {round(spent)}%" if spent < 25
            else "Model score within normal range" if not is_flagged_val
            else "Cost and timeline anomaly flagged"
        )
        state = str(row.get("state", "")).strip()
        district = str(row.get("district", "")).strip()
        mp_name = str(row.get("mp_name", "")).strip()
        work_type = str(row.get("work_type", "")).strip()
        coords = STATE_COORDINATES.get(state.upper(), STATE_COORDINATES.get(district.upper(), [20.5937, 78.9629]))
        agency = str(row.get("agency_id", row.get("agency", mp_name or "Not available"))).strip() or "Not available"

        records.append({
            "id": pid,
            "title": str(row.get("work_type", "MPLADS project")).strip() or "MPLADS project",
            "state": state or "Not available",
            "district": district or "Not available",
            "constituency": district or state or "Not available",
            "mpName": mp_name or "Not available",
            "agency": agency,
            "workType": work_type,
            "riskLevel": risk_level,
            "riskScore": risk_score,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "is_flagged": is_flagged_val,
            "action": "Review evidence",
            "primaryFinding": finding,
            "sanctionedAmount": str(float(row["sanc_num"])),
            "expenditure": str(float(row["exp_num"])),
            "expenditurePercent": round(spent, 2),
            "sanctionDate": str(row.get("sanction_date", "")),
            "expectedCompletion": str(row.get("expected_end_date", "")),
            "actualStatus": str(row.get("status", "")),
            "coordinates": coords,
            "evidence": [{
                "factor": finding,
                "icon": "alert-triangle",
                "observed": f"IsolationForest anomaly score: {round(score, 4)}",
                "benchmark": "Normal decision score range: > 0.0",
                "deviation": f"Risk priority score: {risk_score}/100",
                "points": f"+{risk_score} points",
                "riskClass": risk_level,
                "devClass": "bad" if risk_score >= 60 else "warning" if risk_score >= 40 else "good",
            }],
            "investigation": None,
        })

    _CACHE = records
    _CACHE_MTIME = mtime
    return records


def get_projects() -> list[dict[str, Any]]:
    return _load_projects_cached()


def get_project(project_id: str) -> dict[str, Any] | None:
    return next((item for item in get_projects() if item["id"] == project_id), None)


def get_dashboard() -> dict[str, Any]:
    projects = get_projects()
    counts = {level: sum(item["riskLevel"] == level for item in projects) for level in ("critical", "high", "medium", "low")}
    anomalies_count = sum(1 for item in projects if item.get("is_flagged", False))
    return {"projects": len(projects), "analyzed": len(projects), "risk_levels": counts, "anomalies": anomalies_count, "items": projects}


def get_map_projects() -> list[dict[str, Any]]:
    return [{"id": item["id"], "coordinates": item["coordinates"], "riskScore": item["riskScore"], "riskLevel": item["riskLevel"]} for item in get_projects()]


def get_agencies() -> list[dict[str, Any]]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for item in get_projects():
        groups.setdefault(item["agency"], []).append(item)
    return [{"agency": name, "projects": len(items), "highRisk": sum(i["riskScore"] >= 60 for i in items), "averageScore": round(sum(i["riskScore"] for i in items) / len(items))} for name, items in groups.items()]


def get_investigations() -> list[dict[str, Any]]:
    return [item for item in get_projects() if item.get("is_flagged", False) or item["riskScore"] >= 50]
