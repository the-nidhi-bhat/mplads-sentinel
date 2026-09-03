"""
Read persisted model output and expose frontend-safe audit records.
Converts ingested CSV pipeline outputs into rich, clean API models.
"""

import hashlib
import json
import re
from pathlib import Path
from typing import Any
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
CLEAN_PATH = BASE_DIR / "mplads-ml" / "data" / "mplads_clean.csv"
ANOM_PATH = BASE_DIR / "mplads-ml" / "data" / "mplads_anomalies.csv"
RESULT_PATH = BASE_DIR / "mplads-ml" / "data" / "inspect_flagged.csv"

STATE_COORDINATES: dict[str, list[float]] = {
    "ANDHRA PRADESH": [15.9129, 79.7400],
    "BIHAR": [25.0961, 85.3131],
    "GUJARAT": [22.2587, 71.1924],
    "JAMMU": [33.7782, 76.5762],
    "JAMMU AND KASHMIR": [33.7782, 76.5762],
    "KARNATAKA": [15.3173, 75.7139],
    "MADHYA PRADESH": [22.9734, 78.6569],
    "MAHARASHTRA": [19.7515, 75.7139],
    "RAJASTHAN": [27.0238, 74.2179],
    "UTTAR PRADESH": [26.8467, 80.9462],
    "WEST BENGAL": [22.9868, 87.8550],
    "TAMIL NADU": [11.1271, 78.6569],
    "DELHI": [28.7041, 77.1025],
    "KERALA": [10.8505, 76.2711],
    "ODISHA": [20.9517, 85.0985],
    "PUNJAB": [31.1471, 75.3412],
    "HARYANA": [29.0588, 76.0856],
    "ASSAM": [26.2006, 92.9376],
    "TELANGANA": [18.1124, 79.0193],
    "JHARKHAND": [23.6102, 85.2799],
    "SIKKIM": [27.5330, 88.5122],
    "CHHATTISGARH": [21.2787, 81.8661],
    "GOA": [15.2993, 74.1240],
    "HIMACHAL PRADESH": [31.1048, 77.1665],
    "UTTARAKHAND": [30.0668, 79.0193],
    "ARUNACHAL PRADESH": [28.2180, 94.7278],
    "MANIPUR": [24.6637, 93.9063],
    "MEGHALAYA": [25.4670, 91.3662],
    "MIZORAM": [23.1645, 92.9376],
    "NAGALAND": [26.1584, 94.5624],
    "TRIPURA": [23.9408, 91.9882],
    "LADAKH": [34.1526, 77.5770],
}

# District-to-state lookup so that CSVs missing the "state" column still
# render projects on the correct state in the dashboard and map views.
# Keys are uppercase; add entries as new districts appear in the data.
DISTRICT_STATE: dict[str, str] = {
    # Gujarat
    "KHEDA": "Gujarat",
    "AHMEDABAD": "Gujarat",
    "RAJKOT": "Gujarat",
    "BHARUCH": "Gujarat",
    "NAGPUR": "Maharashtra",
    # Madhya Pradesh
    "BHOPAL": "Madhya Pradesh",
    "RAJGARH": "Madhya Pradesh",
    "SATNA": "Madhya Pradesh",
    # Rajasthan
    "JAIPUR": "Rajasthan",
    "JODHPUR": "Rajasthan",
    "UDAIPUR": "Rajasthan",
    # Uttar Pradesh
    "LUCKNOW": "Uttar Pradesh",
    "AGRA": "Uttar Pradesh",
    "VARANASI": "Uttar Pradesh",
    # Bihar
    "GAYA": "Bihar",
    # West Bengal
    "HOWRAH": "West Bengal",
    "MIDNAPORE": "West Bengal",
    # Tamil Nadu
    "CHENNAI": "Tamil Nadu",
    "COIMBATORE": "Tamil Nadu",
    # Kerala
    "THIRUVANANTHAPURAM": "Kerala",
    "KOZHIKODE": "Kerala",
    # Karnataka
    "MYSURU": "Karnataka",
    "BELAGAVI": "Karnataka",
    "DHARWAD": "Karnataka",
    # Andhra Pradesh
    "EAST GODAVARI": "Andhra Pradesh",
    "AMALAPURAM(SC)": "Andhra Pradesh",
    "ANAKAPALLE": "Andhra Pradesh",
    "ANANTAPUR": "Andhra Pradesh",
    "ARAKKONAM": "Tamil Nadu",
    # Telangana
    "HYDERABAD": "Telangana",
    # Odisha
    "CUTTACK": "Odisha",
    # Punjab
    "AMRITSAR": "Punjab",
    # Haryana
    "HISAR": "Haryana",
    # Jharkhand
    "RANCHI": "Jharkhand",
    # Assam
    "GUWAHATI": "Assam",
    # Delhi
    "NEW DELHI": "Delhi",
    # Sikkim
    "SIKKIM": "Sikkim",
    # Maharashtra
    "PUNE": "Maharashtra",
    # Jammu
    "JAMMU": "Jammu and Kashmir",
    # Uttarakhand
    "NAINITAL UDHAM SINGH NAG.": "Uttarakhand",
}

_CACHE: list[dict[str, Any]] | None = None
_CACHE_MTIME: float = 0.0


def _infer_state(district: str, project_id: str) -> str:
    """Infer the Indian state from a district name or project_id prefix."""
    key = str(district).upper().strip()
    if key in DISTRICT_STATE:
        return DISTRICT_STATE[key]
    # Try partial match (e.g. "NAINITAL UDHAM SINGH NAG." contains "NAINITAL")
    for district_key, state in DISTRICT_STATE.items():
        if district_key in key or key in district_key:
            return state
    return ""


def _get_coordinates(district: str, state: str) -> list[float]:
    """Return [lat, lng] for a district, centered on its state with a small
    deterministic jitter so projects within the same state spread out rather
    than stacking on a single point.
    """
    state_key = str(state).upper().strip()
    district_key = str(district).upper().strip()

    # 1. Resolve the state — first try the explicit state value, then the
    #    district-to-state mapping for CSVs that lack a state column.
    resolved_state = state_key
    if resolved_state not in STATE_COORDINATES:
        resolved_state = DISTRICT_STATE.get(district_key, "")
    if not resolved_state:
        # Fallback: scan all known states to find a substring match
        for s in STATE_COORDINATES:
            if s in district_key or s in state_key:
                resolved_state = s
                break

    # 2. Look up the state centroid.
    base = STATE_COORDINATES.get(resolved_state)
    if base is None:
        # Final fallback — spread across all of India
        h = int(hashlib.md5(district_key.encode("utf-8")).hexdigest(), 16)
        lat = 8.0 + ((h % 1000) / 1000.0) * 24.0   # 8 °N – 32 °N
        lng = 68.0 + (((h // 1000) % 1000) / 1000.0) * 20.0  # 68 °E – 88 °E
        return [round(lat, 4), round(lng, 4)]

    # 3. Add a small deterministic jitter based on district name so that
    #    projects in the same state don't all land on the exact centroid.
    #    The jitter is bounded to ~±1.5° (~165 km) to stay within the state.
    h = int(hashlib.md5(district_key.encode("utf-8")).hexdigest(), 16)
    jitter_lat = ((h % 1000) / 1000.0 - 0.5) * 3.0   # ±1.5°
    jitter_lng = (((h // 1000) % 1000) / 1000.0 - 0.5) * 3.0
    return [round(base[0] + jitter_lat, 4), round(base[1] + jitter_lng, 4)]


def _load_projects_cached() -> list[dict[str, Any]]:
    global _CACHE, _CACHE_MTIME
    source_file = RESULT_PATH if RESULT_PATH.exists() else CLEAN_PATH
    if not source_file.exists():
        return []

    mtime = source_file.stat().st_mtime
    if _CACHE is not None and _CACHE_MTIME == mtime:
        return _CACHE

    if RESULT_PATH.exists():
        df = pd.read_csv(RESULT_PATH, dtype=str, keep_default_na=False)
    elif CLEAN_PATH.exists() and ANOM_PATH.exists():
        df_clean = pd.read_csv(CLEAN_PATH, dtype=str, keep_default_na=False)
        df_anom = pd.read_csv(ANOM_PATH, dtype=str, keep_default_na=False)
        df = df_clean.merge(df_anom, on="project_id", how="left", suffixes=("", "_anom"))
    else:
        df = pd.read_csv(CLEAN_PATH, dtype=str, keep_default_na=False)

    df["anom_score_num"] = pd.to_numeric(df.get("anomaly_score", 0), errors="coerce").fillna(0.0)
    df["sanc_num"] = pd.to_numeric(df.get("sanction_amount", 0), errors="coerce").fillna(0.0)
    df["exp_num"] = pd.to_numeric(df.get("expenditure_to_date", 0), errors="coerce").fillna(0.0)
    df["delay_num"] = pd.to_numeric(df.get("delay_days", 0), errors="coerce").fillna(0.0)
    df["pct_spent_num"] = pd.to_numeric(df.get("percent_spent", 0), errors="coerce").fillna(0.0)

    records = []
    for _, row in df.iterrows():
        raw_pid = str(row.get("project_id", "")).strip()
        if not raw_pid:
            continue

        # Extract clean project ID and clean title
        m = re.match(r"^(.*?/\d{4}-\d{4}/\d+)-(.*)$", raw_pid)
        if m:
            clean_id = m.group(1).strip()
            clean_title = m.group(2).strip()
        else:
            clean_id = raw_pid
            clean_title = str(row.get("work_type", "MPLADS Project")).strip() or "MPLADS Project"

        is_flagged_val = str(row.get("is_flagged", "False")).strip().lower() in ("true", "1")
        score = float(row["anom_score_num"])

        if is_flagged_val:
            raw_risk = 50 + int(abs(score) * 200)
            risk_score = max(50, min(100, raw_risk))
        else:
            raw_risk = int(max(0, (0.10 - score) / 0.10 * 45))
            risk_score = max(0, min(45, raw_risk))

        risk_level = (
            "critical"
            if risk_score >= 80
            else "high"
            if risk_score >= 60
            else "medium"
            if risk_score >= 40
            else "low"
        )
        delay = float(row["delay_num"])
        spent = float(row["pct_spent_num"]) * 100

        finding = (
            f"Completion delayed by {round(delay)} days"
            if delay > 0
            else f"Fund utilization at {round(spent)}%"
            if spent < 25
            else "Model score within normal range"
            if not is_flagged_val
            else "Cost and timeline anomaly flagged"
        )

        district = str(row.get("district", "")).strip()
        state = str(row.get("state", "")).strip()
        if not state:
            state = _infer_state(district, raw_pid) or "Gujarat"
        if not district:
            district = "Kheda"
        mp_name = str(row.get("mp_name", "")).strip() or "MP Office"
        work_type = str(row.get("work_type", "")).strip() or "Infrastructure"
        agency = str(row.get("agency_id", row.get("agency", mp_name))).strip() or mp_name
        coords = _get_coordinates(district, state)
        # Spread projects within the same district by adding a tiny per-row
        # jitter so that overlapping markers separate on the map.
        pid_hash = int(hashlib.md5(raw_pid.encode("utf-8")).hexdigest(), 16)
        coords = [
            round(coords[0] + ((pid_hash % 1000) / 1000.0 - 0.5) * 0.15, 4),
            round(coords[1] + (((pid_hash // 1000) % 1000) / 1000.0 - 0.5) * 0.15, 4),
        ]

        records.append({
            "id": raw_pid,
            "raw_id": raw_pid,
            "clean_id": clean_id,
            "title": clean_title,
            "state": state,
            "district": district,
            "constituency": district,
            "mpName": mp_name,
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
            "actualStatus": str(row.get("status", "Sanctioned")),
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
    projects = get_projects()
    target = project_id.strip()
    return next(
        (p for p in projects if p["id"] == target or p.get("raw_id") == target or p.get("clean_id") == target),
        None,
    )


def get_dashboard() -> dict[str, Any]:
    projects = get_projects()
    counts = {
        level: sum(item["riskLevel"] == level for item in projects)
        for level in ("critical", "high", "medium", "low")
    }
    anomalies_count = sum(1 for item in projects if item.get("is_flagged", False))
    return {
        "projects": len(projects),
        "analyzed": len(projects),
        "risk_levels": counts,
        "anomalies": anomalies_count,
        "items": projects,
    }


def get_map_projects() -> list[dict[str, Any]]:
    return [
        {
            "id": item["id"],
            "title": item["title"],
            "coordinates": item["coordinates"],
            "riskScore": item["riskScore"],
            "riskLevel": item["riskLevel"],
            "state": item["state"],
            "district": item["district"],
        }
        for item in get_projects()
    ]


def get_agencies() -> list[dict[str, Any]]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for item in get_projects():
        groups.setdefault(item["agency"], []).append(item)
    return [
        {
            "agency": name,
            "projects": len(items),
            "highRisk": sum(i["riskScore"] >= 60 for i in items),
            "averageScore": round(sum(i["riskScore"] for i in items) / len(items)),
        }
        for name, items in groups.items()
    ]


def get_investigations() -> list[dict[str, Any]]:
    return [item for item in get_projects() if item.get("is_flagged", False) or item["riskScore"] >= 50]
