MPLADS Sentinel — Master System Architecture

SIH26102 · Team Reference Document

1. Master System Architecture

DATA SOURCES
Curated public MPLADS / eSAKSHI CSVs
+ clearly-labelled synthetic demo data
        |
        v
DATA INGESTION
FastAPI upload endpoint -> raw CSV storage
        |
        v
CLEANING & FEATURE ENGINEERING
Python + Pandas
prepare_data.py / features.py
cost_overrun_ratio / delay_days /
fund_utilization_speed / months_elapsed
        |
        v
DATABASE
PostgreSQL
projects / agencies / MPs / locations /
expenditures / anomalies / risk_scores /
investigations / users / audit_logs
        |
        +----------------+----------------+----------------+----------------+
        v                v                v                v                v
   COST ANOMALY    TIMELINE ANOMALY   DUPLICATE /      AGENCY RISK    PROGRESS /
      ENGINE          ENGINE          OVERLAP            SCORING       EXPENDITURE
                                    DETECTION                            MISMATCH
        |                |                |                |                |
        +----------------+----------------+----------------+----------------+
                                      |
                                      v
                         RISK SCORING ENGINE
                         Rule-based weighted sum
                         of five signals, total 0–100
                                      |
                                      v
                         AUDIT PRIORITY + EVIDENCE
                         score / band / evidence_json
                                      |
                                      v
                         FASTAPI BACKEND (REST)
                         projects / dashboard / anomalies /
                         risk_scores / evidence /
                         investigations / GIS / ingestion / auth
                                      |
                                      v
                         NEXT.JS FRONTEND
                         Dashboard / Priority Queue /
                         Project Details / Evidence /
                         GIS Map / Investigation Workspace
                                      |
                                      v
                         AUDITOR / OFFICER
                         Review -> Investigate ->
                         Record finding -> Close / Escalate

Important: The system does not declare fraud. It identifies unusual patterns, prioritizes projects for review, and provides evidence for human investigation.

The Fraud / Relationship Graph using NetworkX is an investigation aid for later. It is not an MVP scoring input and must not be included in the risk-score computation.

2. Architecture Explanation

2.1 Data Sources

The MVP uses:

Curated public MPLADS / eSAKSHI-derived project data.

Clearly labelled synthetic data for demonstration and validation.

Synthetic data must never be presented as real government data.

There is no live eSAKSHI integration in the MVP.

2.2 Data Ingestion

A FastAPI upload endpoint accepts CSV files.

The ingestion flow is:

CSV Upload
    |
    v
Schema Validation
    |
    v
Raw File Storage
    |
    v
Cleaning / Normalization
    |
    v
Database

For the MVP, local filesystem storage and synchronous FastAPI processing are sufficient.

2.3 Cleaning and Feature Engineering

Python and Pandas transform raw project records into clean, comparable records.

Important derived features include:

cost_overrun_ratio

delay_days

fund_utilization_speed

months_elapsed

Peer-group comparison metrics

Progress / expenditure discrepancy

The processing logic should be deterministic and reproducible.

3. Analytics and Detection Engines

The system uses five scoring signals.

3.1 Cost Anomaly

Identifies projects whose cost is unusually high compared with relevant peer projects.

Peer groups should consider factors such as:

Work type

District

Project scale

Methods:

Isolation Forest

Percentile ranking

Peer-group deviation

Example evidence:

Observed cost: ₹23,00,000
Peer median: ₹13,50,000
Deviation: +70.4%

The exact displayed values must come from the actual dataset and must not be fabricated.

3.2 Timeline Anomaly

Identifies projects whose execution duration is unusually high compared with comparable projects.

Possible methods:

Isolation Forest

Percentile ranking

Peer benchmark comparison

Example:

Observed duration: 347 days
Peer benchmark: 160 days
Ratio: 2.17x

3.3 Duplicate / Overlap Detection

Identifies potentially overlapping or duplicate works using:

Geographic distance

Project description similarity

Nearby project comparison

Same or similar work categories

For the MVP, plain latitude / longitude fields and a Python Haversine-distance calculation are sufficient.

Text similarity can use:

TF-IDF

difflib

sentence-transformers may be added later if time and compute allow.

3.4 Agency Risk

Agency risk is a historical aggregation rather than a separate ML model.

It considers an agency's historical anomaly rate across its projects.

Important wording:

An elevated agency anomaly rate is a signal for review, not evidence of misconduct or fraud.

3.5 Progress / Expenditure Mismatch

This is a rule-based scoring signal.

It compares:

Funds disbursed / spent
vs.
Percentage of work certified complete

Example:

Funds disbursed: 62%
Work certified complete: 30%

A large discrepancy increases audit priority.

4. Audit Priority Scoring

The final score is a transparent, rule-based weighted sum.

Initial conceptual maximums:

Signal

Maximum Points

Cost anomaly

30

Timeline anomaly

25

Duplicate / spatial signal

20

Agency risk

15

Progress / expenditure mismatch

10

Total

100

These are initial expert-elicited weights for the MVP. They should not be presented as universally validated or scientifically optimal weights.

The final output is:

Audit Priority Score: 0–100

Suggested bands:

Score

Band

0–24

Low

25–49

Medium

50–74

High

75–100

Critical

The band thresholds may be calibrated during validation.

Every score should be traceable to its component signals.

5. Evidence and Explainability

Each anomaly and score should store the specific values used to produce it.

An evidence payload may contain:

{
  "signal": "cost_anomaly",
  "observed_value": 2300000,
  "peer_benchmark": 1350000,
  "deviation_percent": 70.37,
  "method": "peer_percentile",
  "message": "Project cost is substantially above the peer-group benchmark."
}

The frontend must be able to display:

Why was this project flagged?

without recomputing the score.

Evidence should include:

Observed value

Benchmark

Deviation

Signal

Method

Human-readable explanation

6. Backend

Technology

Python 3.9+

FastAPI

Pydantic

SQLAlchemy

Pandas

scikit-learn

joblib

Backend structure

backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── projects.py
│   │   ├── dashboard.py
│   │   ├── anomalies.py
│   │   ├── risk_scores.py
│   │   ├── evidence.py
│   │   ├── investigations.py
│   │   ├── gis.py
│   │   ├── ingestion.py
│   │   └── auth.py
│   ├── models/
│   ├── schemas/
│   ├── ml/
│   │   ├── cost_anomaly.py
│   │   ├── timeline_anomaly.py
│   │   ├── duplicate_detection.py
│   │   ├── agency_risk.py
│   │   └── risk_scoring.py
│   ├── data_pipeline/
│   │   ├── prepare_data.py
│   │   ├── features.py
│   │   └── train_model.py
│   └── database.py
├── model_artifacts/
├── data/
└── requirements.txt

REST API areas

The backend should expose endpoints for:

Projects

Dashboard statistics

Anomalies

Audit priority scores

Evidence

Investigations

GIS data

Data ingestion

Authentication

7. Database

PostgreSQL is the canonical database.

Core entities:

projects
agencies
mps
locations
expenditures
anomalies
risk_scores
investigations
users
audit_logs

Relationships should allow the system to trace:

MP
 |
 v
Constituency
 |
 v
Project
 |
 +--> Expenditure
 |
 +--> Agency
 |
 +--> Location
 |
 +--> Anomalies
 |
 +--> Audit Priority Score
 |
 +--> Investigation

PostGIS Decision

PostGIS is not required for the 36-hour MVP.

Plain latitude / longitude fields plus Python distance calculations are sufficient.

PostGIS can be considered later if spatial SQL queries become necessary.

8. Frontend

Technology

Next.js

React

TypeScript

Tailwind CSS

Recharts

Leaflet

react-leaflet

lucide-react

Plain React state

Frontend structure

frontend/
├── app/
│   ├── dashboard/
│   ├── projects/
│   │   └── [id]/
│   ├── investigations/
│   └── map/
├── components/
├── lib/
├── styles/
├── public/
├── package.json
└── tsconfig.json

Main application screens

Landing page

Login

Dashboard

Priority Queue

Projects

Project Details

Why Was This Flagged?

GIS Map

Investigations

Data Ingestion

Audit Logs

The UI should communicate that this is a government monitoring and audit-prioritization system, not a consumer SaaS product.

9. Human-in-the-Loop Investigation

The system must never automatically declare fraud.

Recommended workflow:

Anomaly detected
      |
      v
Audit priority generated
      |
      v
Auditor reviews evidence
      |
      v
Investigation opened
      |
      v
Notes / verification / documents
      |
      v
Finding recorded
      |
      +--> No issue found
      |
      +--> Verified anomaly
      |
      +--> Additional information required
      |
      +--> Escalated

A finding such as Verified anomaly does not automatically mean fraud.

The final government decision remains with the responsible human authority.

10. GIS

The GIS view should display:

Project locations

Audit priority

Project status

High-priority clusters

Nearby / potentially overlapping projects

Suggested visual categories:

Low       -> green
Medium    -> yellow
High      -> orange
Critical  -> red

The exact UI colors are a frontend implementation detail.

Leaflet is preferred because it is free and does not require a Mapbox API key.

11. Data Ingestion UI

The ingestion interface should support:

Upload CSV
    |
    v
Validate schema
    |
    v
Report invalid / missing records
    |
    v
Clean and normalize
    |
    v
Store data
    |
    v
Run analysis

The interface should clearly distinguish:

Public / government-derived data

Synthetic demonstration data

Synthetic validation data

Example status fields:

Dataset: mplads_projects.csv
Records: 48,231
Valid: 47,982
Invalid / missing: 249
Processing: Complete
Data type: Synthetic — Validation

Numbers must come from actual data at runtime.

12. Audit Logs

The system should record important actions such as:

User login

Dataset upload

Project viewed

Investigation opened

Investigation updated

Evidence reviewed

Finding recorded

Report generated

Audit logs support accountability and traceability.

13. End-to-End Example

Example project:

Project: MPL-20481
Type: Road construction
District: District X

Illustrative flow:

Cost
₹23,00,000 vs peer median ₹13,50,000
        |
        v
Cost anomaly signal

Duration
347 days vs peer benchmark 160 days
        |
        v
Timeline anomaly signal

Spatial relationship
Similar project within configured distance threshold
        |
        v
Duplicate / overlap signal

Agency history
6 of 22 projects previously flagged
        |
        v
Agency signal

Progress
62% funds disbursed vs 30% work certified
        |
        v
Progress / expenditure signal

        |
        v

Audit Priority Score
        |
        v
Evidence trail
        |
        v
Priority Queue
        |
        v
Auditor review
        |
        v
Investigation

The values above are illustrative only and must not be represented as actual government findings unless supported by the dataset.

14. Synthetic Data Validation

Because reliable fraud labels are generally unavailable, the project should distinguish between:

Real / Public Data

Used to demonstrate that Sentinel can identify unusual patterns in project data.

No claim of confirmed fraud should be made without verified ground truth.

Synthetic Validation

Controlled anomalies are injected into clean records.

Example:

Normal project cost: ₹20,00,000
Synthetic anomalous cost: ₹45,00,000

The system can then test whether the modified project receives a high anomaly or audit-priority score.

Validation results should be labelled:

Synthetic validation experiment

Possible evaluation metrics:

Precision@K

Recall

Detection rate

Ranking quality

False-positive rate

These metrics must be calculated from actual experiments.

15. Technology Stack

Layer

Technology

Frontend

Next.js, React, TypeScript

Styling

Tailwind CSS

Charts

Recharts

Maps

Leaflet, react-leaflet

Icons

lucide-react

Backend

Python, FastAPI

Data Processing

Pandas

ML

scikit-learn, joblib

Validation / Schemas

Pydantic

ORM

SQLAlchemy

Database

PostgreSQL

Containerization

Docker Compose

API Format

JSON / REST

Documentation

Markdown

16. MVP Simplifications

The MVP intentionally avoids unnecessary infrastructure.

Not required initially

Kubernetes

Celery

Redis

S3 / MinIO

PostGIS

Complex message queues

Live eSAKSHI integration

NetworkX relationship graph in scoring

Large-scale distributed processing

These may be introduced later if the application grows beyond hackathon requirements.

17. Implementation Order

The recommended implementation order is:

Phase 1 — Repository and configuration

README

Architecture documentation

.env.example

.gitignore

Docker Compose

Backend and frontend directories

Phase 2 — Database

PostgreSQL setup

SQLAlchemy models

Database connection

Initial schema

Phase 3 — Data pipeline

CSV schema

Data preparation

Cleaning

Feature engineering

Seed / synthetic data

Phase 4 — Detection engines

Implement independently:

Cost anomaly

Timeline anomaly

Duplicate / overlap

Agency risk

Progress / expenditure mismatch

Phase 5 — Audit priority

Weighted scoring

Score bands

Evidence generation

Evidence persistence

Phase 6 — FastAPI

Implement REST endpoints for:

Dashboard

Projects

Anomalies

Scores

Evidence

GIS

Investigations

Ingestion

Auth

Phase 7 — Next.js frontend

Build in this order:

Application shell

Dashboard

Priority Queue

Project Details

Why Was This Flagged?

GIS Map

Investigations

Data Ingestion

Audit Logs

Phase 8 — Integration

Connect the frontend to FastAPI and verify the complete data flow.

Phase 9 — Testing and validation

Unit tests

API tests

Detection-engine tests

Synthetic validation

End-to-end demo flow

Phase 10 — Demo hardening

Clear synthetic-data labels

Error states

Loading states

Empty states

README

Architecture diagram

Demo dataset

Judge-ready workflow

18. Project Principles

The implementation must follow these principles:

Explainability over black-box complexity.

Human investigation remains the final decision point.

Synthetic data must always be clearly labelled.

Do not claim fraud without verified ground truth.

Every audit-priority score must be traceable to evidence.

Prefer a working MVP over unnecessary infrastructure.

Do not add technologies that are not required by the architecture.

Use real data where available and synthetic data only where clearly identified.

Keep the scoring pipeline deterministic and reproducible.

Do not fabricate statistics, government findings, or model performance.

19. Final Product Definition

MPLADS Sentinel is an explainable AI-powered audit-prioritization platform.

Its core flow is:

Ingest
  ->
Clean
  ->
Engineer Features
  ->
Detect Anomalies
  ->
Generate Signals
  ->
Calculate Audit Priority
  ->
Store Evidence
  ->
Prioritize Projects
  ->
Explain Flags
  ->
Human Investigation

The system's purpose is not to replace auditors.

Its purpose is to help auditors answer:

"Out of thousands of projects, which ones deserve human attention first, and why?"