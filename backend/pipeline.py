# backend/pipeline.py
#
# This file runs the complete normalizer and model chain for an uploaded source.

import subprocess
import sys
from pathlib import Path

# BASE_DIR points to the "workspace" folder (one level above "backend")
BASE_DIR = Path(__file__).resolve().parent.parent

# Path to the Python interpreter inside your virtual environment
if sys.platform.startswith("win"):
    PYTHON_EXE = BASE_DIR / ".venv" / "Scripts" / "python.exe"
else:
    PYTHON_EXE = BASE_DIR / ".venv" / "bin" / "python3"

NORMALIZER_SRC = BASE_DIR / "project-normalizer" / "src"
MPLADS_SRC = BASE_DIR / "mplads-ml" / "src"
MPLADS_ROOT = BASE_DIR / "mplads-ml"

FINALIZED_CSV = BASE_DIR / "project-normalizer" / "data" / "finalized.csv"
RAW_MODEL_CSV = BASE_DIR / "mplads-ml" / "data" / "mplads_raw.csv"
CLEAN_CSV = BASE_DIR / "mplads-ml" / "data" / "mplads_clean.csv"
INSPECT_FLAGGED_CSV = BASE_DIR / "mplads-ml" / "data" / "inspect_flagged.csv"
ALLOWED_SOURCES = {"recommended", "sanctioned", "completed"}


def get_python_exe() -> Path:
    """Return the project venv Python when available, otherwise the current interpreter."""
    if PYTHON_EXE.exists():
        return PYTHON_EXE
    return Path(sys.executable)


def run_step(script_path, args=None, step_name="", cwd=None):
    """Runs one script using the project's own Python, and raises a clear
    error if it fails, including the script's own error message."""
    cmd = [str(get_python_exe()), str(script_path)] + (args or [])
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd or BASE_DIR)
    if result.returncode != 0:
        raise RuntimeError(
            f"Step '{step_name}' failed.\n"
            f"Command: {' '.join(cmd)}\n"
            f"--- Error output ---\n{result.stderr}"
        )
    return result.stdout


def run_full_pipeline(uploaded_csv_path: str, source_label: str = "sanctioned"):
    """
    Runs the whole chain on one uploaded CSV file and returns the path
    to the final cleaned CSV.

    uploaded_csv_path: full path to the CSV the user just uploaded
    source_label: which source type this file represents
                  (matches your existing --source flag: e.g. "sanctioned",
                  "recommended", or "completed")
    """
    source_label = source_label.strip().lower()
    if source_label not in ALLOWED_SOURCES:
        raise ValueError(
            f"Invalid source '{source_label}'. Choose one of: recommended, sanctioned, completed."
        )

    uploaded_path = Path(uploaded_csv_path)
    if not uploaded_path.exists():
        raise FileNotFoundError(f"Uploaded CSV not found: {uploaded_path}")
    if uploaded_path.stat().st_size == 0:
        raise ValueError(f"Uploaded CSV is empty: {uploaded_path}")

    # Step 1: normalize the uploaded file (this also writes it into
    # project-normalizer/data, matching how you run it manually today)
    run_step(
        NORMALIZER_SRC / "normalize_user_csv.py",
        args=["--input", str(uploaded_path), "--source", source_label],
        step_name="normalize_user_csv.py",
    )

    # Step 2: merge/finalize all available source files into finalized.csv
    run_step(
        NORMALIZER_SRC / "finalize_merge.py",
        step_name="finalize_merge.py",
    )

    # Step 3: turn finalized.csv into the raw model input
    run_step(
        NORMALIZER_SRC / "prepare_for_model.py",
        step_name="prepare_for_model.py",
    )

    # Step 4: clean the raw model input
    run_step(
        MPLADS_SRC / "prepare_data.py",
        step_name="prepare_data.py",
        cwd=MPLADS_ROOT,
    )

    if not CLEAN_CSV.exists():
        raise RuntimeError(
            f"Pipeline finished but expected output was not found at {CLEAN_CSV}"
        )

    # Train the persisted IsolationForest against this exact uploaded dataset.
    run_step(
        MPLADS_SRC / "train_model.py",
        step_name="train_model.py",
        cwd=MPLADS_ROOT,
    )
    run_step(
        MPLADS_ROOT / "inspect_flagged.py",
        step_name="inspect_flagged.py",
        cwd=MPLADS_ROOT,
    )
    if not INSPECT_FLAGGED_CSV.exists():
        raise RuntimeError(f"Pipeline finished but expected output was not found at {INSPECT_FLAGGED_CSV}")
    return str(INSPECT_FLAGGED_CSV)
