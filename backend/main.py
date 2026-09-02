# backend/main.py
#
# This is the web server. It exposes three URLs ("endpoints"):
#   POST /upload   -> user sends a CSV, we start processing it
#   GET  /status/{job_id} -> check if it's done yet
#   GET  /download/{job_id} -> download the finished CSV

import os
import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.pipeline import run_full_pipeline
from backend.data_service import (
    get_agencies,
    get_dashboard,
    get_investigations,
    get_project,
    get_projects,
    get_map_projects,
)

app = FastAPI(title="MPLADS Sentinel API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_SOURCES = {"recommended", "sanctioned", "completed"}

# A simple in-memory "database" of jobs. Since this is a dictionary that
# lives in the program's memory, it resets if you restart the server.
# That's fine for now — Part 6 shows how to make this permanent.
JOBS = {}


def process_job(job_id: str, saved_path: str, source_label: str):
    JOBS[job_id]["status"] = "running"
    try:
        print(f"[process_job] Starting job {job_id} for {saved_path} source={source_label}")
        result_path = run_full_pipeline(saved_path, source_label)
        JOBS[job_id]["status"] = "done"
        JOBS[job_id]["result_path"] = result_path
        print(f"[process_job] Job {job_id} done, result at {result_path}")
    except Exception as e:
        # Capture full exception text and store it so /status returns it
        import traceback
        tb = traceback.format_exc()
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        JOBS[job_id]["traceback"] = tb
        print(f"[process_job] Job {job_id} failed: {e}")
        print(tb)



@app.post("/upload")
async def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    source: str = "sanctioned",
):
    source = source.strip().lower()
    if source not in ALLOWED_SOURCES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid source '{source}'. Choose one of: recommended, sanctioned, completed.",
        )
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    # Save the uploaded file to disk under a unique name
    job_id = str(uuid.uuid4())
    saved_path = UPLOAD_DIR / f"{job_id}_{file.filename}"
    with open(saved_path, "wb") as out_file:
        shutil.copyfileobj(file.file, out_file)

    if saved_path.stat().st_size == 0:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Uploaded CSV is empty.")

    JOBS[job_id] = {"status": "queued", "filename": file.filename, "error": None}

    # Run the pipeline in the background so the upload response comes back
    # immediately instead of making the user wait with a spinning page.
    background_tasks.add_task(process_job, job_id, str(saved_path), source)

    return {"job_id": job_id, "status": "queued"}


@app.get("/status/{job_id}")
def get_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, **job}


@app.get("/download/{job_id}")
def download_result(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "done":
        raise HTTPException(status_code=400, detail=f"Job is not finished yet (status: {job['status']})")
    return FileResponse(job["result_path"], filename=os.path.basename(job["result_path"]))


@app.get("/")
def health_check():
    return {"message": "MPLADS Sentinel backend is running."}


@app.get("/api/dashboard")
def dashboard():
    return get_dashboard()


@app.get("/api/projects")
def projects():
    return get_projects()


@app.get("/api/projects/{project_id:path}")
def project(project_id: str):
    result = get_project(project_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return result


@app.get("/api/map")
def map_projects():
    return get_map_projects()


@app.get("/api/agency-watch")
def agency_watch():
    return get_agencies()


@app.get("/api/investigations")
def investigations():
    return get_investigations()


@app.get("/sources")
def get_sources_status():
    """Report whether each pipeline source data file has been populated.

    The normalizer merges three source datasets (sanctioned / recommended /
    completed) into the finalized model input. When a source file is missing
    or effectively empty, downstream fields computed from it (for example
    expenditure-based metrics) fall back to defaults such as 0. Exposing this
    here lets the UI warn the user that a source is still just a placeholder.
    """
    data_dir = Path(__file__).resolve().parent.parent / "project-normalizer" / "data"
    sources = ["works_sanctioned", "works_recommended", "works_completed"]
    result = {}
    for name in sources:
        path = data_dir / f"{name}.csv"
        is_empty = (
            not path.exists()
            or path.stat().st_size == 0
            or path.stat().st_size <= 3
        )
        result[name] = {
            "exists": path.exists(),
            "size": path.stat().st_size if path.exists() else 0,
            "empty": is_empty,
        }
    return result
