# MPLADS Sentinel

### Explainable AI/ML and GIS-Based Risk Intelligence for MPLADS

MPLADS Sentinel is an analytical platform designed to help reviewers identify MPLADS projects that may require closer examination.

It analyzes project data across **cost, timeline, location, agency, and progress** dimensions and combines these signals into a transparent **Audit Priority Score from 0–100**.

> **The score indicates review priority. It does not prove fraud or wrongdoing. Final decisions remain with authorized human reviewers.**

---

## Smart India Hackathon 2026

| Field             | Details                                                     |
| ----------------- | ----------------------------------------------------------- |
| Problem Statement | SIH26102                                                    |
| Organization      | Ministry of Statistics and Programme Implementation (MoSPI) |
| Division          | Data Informatics & Innovation Division (DIID)               |
| Category          | Software                                                    |
| Theme             | Smart Automation                                            |
| Team              | Phantom Syndicate                                           |

---

## What Sentinel Does

Sentinel analyzes MPLADS project records using five signals:

* **Cost Anomaly** — identifies unusual project costs compared with relevant projects.
* **Timeline Anomaly** — identifies unusual execution-duration patterns.
* **Duplicate / Spatial Similarity** — identifies potentially related projects using location and project information.
* **Agency Risk** — provides historical agency-level context.
* **Progress / Expenditure Mismatch** — identifies unusual relationships between reported expenditure and physical progress.

These signals are combined into an **Audit Priority Score (0–100)**.

---

## Audit Priority Score

| Signal                          | Maximum |
| ------------------------------- | ------: |
| Cost Anomaly                    |      30 |
| Timeline Anomaly                |      25 |
| Duplicate / Spatial Similarity  |      20 |
| Agency Risk                     |      15 |
| Progress / Expenditure Mismatch |      10 |
| **Total**                       | **100** |

The score is designed to help reviewers decide **which projects may deserve closer attention first**.

It is not a fraud probability and is not a final investigation finding.

---

## Explainability

Sentinel is designed to show **why** a project received its score.

Example:

```text
Audit Priority Score: 82 / 100

Cost Anomaly:                    25 / 30
Timeline Anomaly:                20 / 25
Duplicate / Spatial Similarity:  16 / 20
Agency Risk:                     11 / 15
Progress Mismatch:               10 / 10
```

The system can provide supporting evidence such as:

* project cost
* peer benchmark
* execution duration
* geographic distance
* similarity indicators
* agency-level patterns
* expenditure and progress information

---

## GIS Intelligence

The GIS component provides geographic context for MPLADS projects.

It can be used to view:

* project locations
* project distribution
* priority projects
* geographic clusters
* spatial relationships

GIS is intended to support project investigation rather than simply display locations.

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts
* Leaflet / React Leaflet

### Backend

* Python
* FastAPI
* Pandas
* scikit-learn
* Pydantic

### Database

* PostgreSQL
* SQLAlchemy

---

## Basic Architecture

```text
MPLADS Project Data
        ↓
Data Processing
        ↓
Analytical Signals
        ↓
Audit Priority Score
        ↓
Evidence
        ↓
Priority Queue
        ↓
GIS / Project Investigation
        ↓
Human Review
```

---

## Data and Validation

The project distinguishes between:

* **Curated / derived project data** used by the application.
* **Synthetic validation scenarios** used to test analytical behaviour.
* **Derived analytical features** calculated from project records.

Synthetic scenarios are not presented as real government findings.

---

## Responsible Use

MPLADS Sentinel follows these principles:

* Explain analytical results where possible.
* Keep human reviewers in the decision-making loop.
* Clearly distinguish real, derived, and synthetic data.
* Treat analytical signals as indicators for review.
* Do not present scores as proof of fraud or wrongdoing.

---

## Project Structure

```text
mplads-sentinel/
├── frontend/
├── backend/
├── docs/
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Local Development

### Backend

From the repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

> **Important:** Run `npm install` inside the `frontend` directory, not the repository root.

---

## Team — Phantom Syndicate

| Member                     | Responsibility                                                |
| -------------------------- | ------------------------------------------------------------- |
| **Nidhi — Team Lead**      | Product direction, coordination, architecture and integration |
| **Arati A. Patil**         | Documentation, research and presentation                      |
| **Agam BharatKumar Doshi** | Research and data analysis                                    |
| **Iffa A. Attar**          | Architecture and solution structuring                         |
| **Dayyanahmed Jamadar**    | Backend and machine learning                                  |
| **Krupal Rayakar**         | Frontend and UI/UX                                            |

---

## Project Status

**Smart India Hackathon 2026 — MVP Development**

MPLADS Sentinel is currently focused on building a working, explainable and reproducible analytical system for MPLADS project prioritization and investigation support.
