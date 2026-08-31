#!/usr/bin/env python3
import os
import yaml
import tempfile
import shutil
import pandas as pd
import logging

# Module logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)
logger.debug("module loaded")

# Resolve repository root and config path
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
CONFIG_PATH = os.path.join(ROOT, "config.yml")


def load_config(path=CONFIG_PATH):
    with open(path) as f:
        return yaml.safe_load(f)


def atomic_write_df(df, dest_path, temp_dir=None):
    """
    Atomically write DataFrame to dest_path.
    If temp_dir is provided, ensure it exists; otherwise use dest directory.
    """
    dest_dir = os.path.dirname(dest_path) or "."
    os.makedirs(dest_dir, exist_ok=True)

    # If a temp_dir is provided in config, resolve it relative to workspace root if needed
    if temp_dir:
        # If temp_dir is relative, make it relative to workspace root
        if not os.path.isabs(temp_dir):
            temp_dir = os.path.abspath(os.path.join(ROOT, temp_dir))
        try:
            os.makedirs(temp_dir, exist_ok=True)
        except Exception as e:
            # If we cannot create the configured temp_dir, fall back to dest_dir
            logger.warning(
                "Could not create temp_dir %s (%s); falling back to dest_dir %s",
                temp_dir,
                e,
                dest_dir,
            )
            temp_dir = dest_dir
    else:
        temp_dir = dest_dir

    # Create temp file in the chosen temp_dir
    tmp = tempfile.NamedTemporaryFile(delete=False, dir=temp_dir, suffix=".csv")
    tmp.close()
    try:
        df.to_csv(tmp.name, index=False)
        os.replace(tmp.name, dest_path)  # atomic replace
        logger.info("Wrote file atomically to %s", dest_path)
    except Exception:
        # Clean up temp file on error
        try:
            os.remove(tmp.name)
        except Exception:
            pass
        raise


def prepare_for_model(finalized_csv_path=None, config_path=CONFIG_PATH):
    cfg = load_config(config_path)

    # Resolve finalized CSV path (allow config to provide absolute or relative)
    if finalized_csv_path is None:
        finalized_csv_path = cfg["project_normalizer"].get(
            "finalized_path", os.path.join(ROOT, "project-normalizer", "data", "finalized.csv")
        )
    if not os.path.isabs(finalized_csv_path):
        finalized_csv_path = os.path.abspath(os.path.join(ROOT, finalized_csv_path))

    # Resolve model input path (absolute)
    model_input = cfg["mplads_ml"].get(
        "model_input_path", os.path.join("mplads-ml", "data", "mplads_raw_for_model.csv")
    )
    if not os.path.isabs(model_input):
        model_input = os.path.abspath(os.path.join(ROOT, model_input))

    logger.info("Loading finalized CSV from %s", finalized_csv_path)
    df = pd.read_csv(
        finalized_csv_path,
        dtype=str,
        keep_default_na=False,
        na_values=["", "NA", "NaN"],
        low_memory=False,
    )

    # Optionally drop provenance columns
    if cfg["project_normalizer"].get("provenance_mode") == "drop":
        prov_suffixes = ("_recommended", "_sanctioned", "_completed")
        prov_cols = [c for c in df.columns if c.endswith(prov_suffixes)]
        if prov_cols:
            df = df.drop(columns=prov_cols, errors="ignore")

    # Ensure sanction_amount is present and normalized for model input
    # If column missing, create it; otherwise normalize formatting
    if "sanction_amount" not in df.columns:
        df["sanction_amount"] = 0.0
    else:
        # preserve raw for debugging if desired
        if "_sanction_amount_raw" not in df.columns:
            df["_sanction_amount_raw"] = df["sanction_amount"].astype(str)
        # Normalize: strip whitespace, remove non-numeric chars, coerce to numeric, fill missing with 0.0
        df["sanction_amount"] = (
            df["sanction_amount"].astype(str).str.strip().replace({r"[^\d.\-]": ""}, regex=True)
        )
        df["sanction_amount"] = pd.to_numeric(df["sanction_amount"], errors="coerce").fillna(0.0)

    # Enforce canonical header order if present
    canonical = [
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
    cols = [c for c in canonical if c in df.columns]
    # keep any extra columns after canonical ones
    extra = [c for c in df.columns if c not in cols]
    df = df[cols + extra]

    # Ensure output directory exists
    os.makedirs(os.path.dirname(model_input), exist_ok=True)

    # Use pipeline temp_dir if configured
    temp_dir = None
    if cfg.get("pipeline") and cfg["pipeline"].get("temp_dir"):
        temp_dir = cfg["pipeline"]["temp_dir"]

    # Atomic write
    atomic_write_df(df, model_input, temp_dir=temp_dir)
    print(f"Wrote model input to {model_input}")


if __name__ == "__main__":
    prepare_for_model()
