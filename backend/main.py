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

from backend.pipeline import run_full_pipeline

app = FastAPI(title="Workspace Backend")

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
    return {"message": "Workspace backend is running."}
