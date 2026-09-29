# MPLADS Sentinel

## Explainable AI/ML and GIS-Based Risk Intelligence and Audit Prioritization for MPLADS

MPLADS Sentinel is an explainable analytical and AI/ML-assisted platform designed to analyze MPLADS project data, identify unusual patterns across financial, timeline, geographic, agency, and progress-related dimensions, and prioritize projects that may require closer human review.

The system combines multiple analytical signals into a transparent **Audit Priority Score from 0–100**, generates evidence explaining the factors contributing to the score, and presents prioritized projects through a monitoring, GIS, and investigation interface.

> **Sentinel identifies patterns that deserve attention. It does not automatically declare fraud or irregularity. Final findings remain with authorized human reviewers.**

---

## Smart India Hackathon 2026

| Field             | Details                                                     |
| ----------------- | ----------------------------------------------------------- |
| Hackathon         | Smart India Hackathon 2026                                  |
| Problem Statement | SIH26102                                                    |
| Organization      | Ministry of Statistics and Programme Implementation (MoSPI) |
| Division          | Data Informatics & Innovation Division (DIID)               |
| Category          | Software                                                    |
| Theme             | Smart Automation                                            |
| Project           | MPLADS Sentinel                                             |
| Team              | Phantom Syndicate                                           |

---

## Problem

Large-scale implementation of MPLADS projects produces records containing information such as:

* project expenditure
* execution timelines
* project locations
* implementing agencies
* project descriptions
* reported progress

When many project records must be monitored, examining every project with the same level of attention can make prioritization difficult.

Potentially unusual patterns may appear across several dimensions:

* unusual project costs
* unusual execution durations
* potentially similar or spatially related projects
* repeated agency-level patterns
* differences between expenditure and reported physical progress

These signals become more useful when considered together rather than independently.

MPLADS Sentinel addresses this by combining multiple analytical signals into an explainable prioritization workflow that helps reviewers identify projects that may warrant closer examination.

---

## Proposed Solution

Sentinel transforms project data into an evidence-backed investigation workflow.

```mermaid
flowchart LR
    A["MPLADS Project Data"] --> B["Data Processing"]
    B --> C["Analytical Signals"]
    C --> D["Audit Priority Score"]
    D --> E["Evidence"]
    E --> F["Priority Queue"]
    F --> G["GIS and Investigation"]
    G --> H["Human Review"]
    H --> I["Investigation Outcome"]
```

The workflow consists of:

* processing project records
* preparing analytical features
* identifying unusual patterns
* calculating analytical risk signals
* combining signals into a transparent score
* generating supporting evidence
* prioritizing projects for review
* providing geographic and project context
* recording human investigation outcomes

---

## Core Analytical Signals

Sentinel uses five complementary analytical signals.

| Signal                          | Maximum Contribution | Purpose                                                                           |
| ------------------------------- | -------------------: | --------------------------------------------------------------------------------- |
| Cost Anomaly                    |                   30 | Identify unusual project cost patterns relative to relevant comparison groups     |
| Timeline Anomaly                |                   25 | Identify unusual execution-duration patterns                                      |
| Duplicate / Spatial Similarity  |                   20 | Identify potentially related projects using geographic and descriptive similarity |
| Agency Risk                     |                   15 | Identify unusual historical patterns associated with implementing agencies        |
| Progress / Expenditure Mismatch |                   10 | Identify unusual relationships between expenditure and reported progress          |
| **Total**                       |              **100** | **Audit Priority Score**                                                          |

These are referred to as **analytical risk signals** rather than five independent AI models because Sentinel can combine machine-learning, statistical, rule-based, aggregation, geographic, and similarity-based methods.

---

## Audit Priority Score

Each signal contributes a bounded value to the final score.

```mermaid
flowchart TB
    A["Cost Anomaly: 0-30"] --> F["Weighted Aggregation"]
    B["Timeline Anomaly: 0-25"] --> F
    C["Spatial Similarity: 0-20"] --> F
    D["Agency Risk: 0-15"] --> F
    E["Progress Mismatch: 0-10"] --> F
    F --> G["Audit Priority Score: 0-100"]
    G --> H["Evidence Generation"]
    H --> I["Priority Queue"]
```

Conceptually:

```text
Audit Priority Score
=
Cost Contribution
+ Timeline Contribution
+ Spatial / Similarity Contribution
+ Agency Contribution
+ Progress Contribution
```

Maximum contribution:

```text
Cost Anomaly                    <= 30
Timeline Anomaly                <= 25
Duplicate / Spatial Similarity <= 20
Agency Risk                     <= 15
Progress Mismatch               <= 10
-----------------------------------
Total                           <= 100
```

The score represents **analytical priority**. It is not a probability of fraud and does not independently establish wrongdoing.

### MVP Weighting

| Signal                          | Weight |
| ------------------------------- | -----: |
| Cost Anomaly                    |    30% |
| Timeline Anomaly                |    25% |
| Duplicate / Spatial Similarity  |    20% |
| Agency Risk                     |    15% |
| Progress / Expenditure Mismatch |    10% |

These are initial MVP weights used to provide a transparent and controllable scoring mechanism. They are not presented as universally optimal weights.

---

## Cost Anomaly

### Objective

Identify projects whose cost is unusual relative to an appropriate comparison group.

Potential analytical approaches include:

* peer-project benchmarking
* percentile comparison
* statistical deviation
* Isolation Forest where appropriate

```mermaid
flowchart LR
    A["Project Cost"] --> B["Peer Group"]
    B --> C["Comparable Projects"]
    C --> D["Cost Distribution"]
    D --> E["Deviation Analysis"]
    E --> F["Cost Signal"]
```

Example evidence:

```text
Observed Cost: ₹X
Peer Median: ₹Y
Deviation: +34%

Cost Signal: Elevated
Contribution: 22 / 30
```

The exact values depend on the dataset and comparison methodology.

---

## Timeline Anomaly

### Objective

Identify projects whose execution duration differs substantially from relevant peer or benchmark patterns.

```mermaid
flowchart LR
    A["Start Date"] --> C["Execution Duration"]
    B["Completion Date"] --> C
    C --> D["Peer Benchmark"]
    D --> E["Duration Deviation"]
    C --> E
    E --> F["Timeline Signal"]
```

The system focuses on unusual duration patterns.

A duration anomaly should not automatically be interpreted as a delay unless the available data contains an appropriate planned or expected completion reference.

---

## Duplicate and Spatial Similarity

Projects can be analyzed for potentially related records using:

* geographic distance
* project description similarity
* project attributes
* relevant contextual information

```mermaid
flowchart TB
    A["Project A"] --> C["Similarity Analysis"]
    B["Project B"] --> C
    C --> D["Geographic Distance"]
    C --> E["Description Similarity"]
    C --> F["Attribute Comparison"]
    D --> G["Combined Evidence"]
    E --> G
    F --> G
    G --> H["Similarity Signal"]
    H --> I["Human Verification"]
```

A similarity signal identifies a **candidate relationship for investigation**. It does not establish that two projects are duplicates.

---

## Agency Risk

Project-level analysis can be supplemented by historical aggregation at the implementing-agency level.

```mermaid
flowchart LR
    A["Project Records"] --> B["Group by Agency"]
    B --> C["Historical Aggregation"]
    C --> D["Agency Metrics"]
    D --> E["Pattern Analysis"]
    E --> F["Agency Signal"]
    F --> G["Project Context"]
```

Agency-level information provides additional context when reviewing individual projects.

The purpose is to identify patterns that may warrant examination, not to automatically characterize an agency as problematic.

---

## Progress and Expenditure Mismatch

Sentinel can compare reported financial expenditure with reported physical progress to identify potentially unusual relationships.

```mermaid
flowchart LR
    A["Financial Expenditure"] --> C["Relationship Analysis"]
    B["Reported Progress"] --> C
    C --> D["Reference Relationship"]
    D --> E["Mismatch Detection"]
    E --> F["Progress Signal"]
```

For example, a project with substantially higher reported expenditure relative to its reported progress may receive a review signal.

This signal alone does not establish wrongdoing.

---

## Explainability

A numerical score without supporting evidence is difficult to investigate.

Sentinel therefore connects analytical signals to the evidence that produced them.

```mermaid
flowchart LR
    A["Project"] --> B["Analytical Signal"]
    B --> C["Signal Contribution"]
    C --> D["Supporting Evidence"]
    D --> E["Human-Readable Explanation"]
    E --> F["Reviewer Investigation"]
```

Instead of showing only:

```text
Audit Priority Score: 87 / 100
```

the system is designed to provide a breakdown such as:

```text
Audit Priority Score: 87 / 100

Cost Anomaly:                    26 / 30
Timeline Anomaly:                22 / 25
Duplicate / Spatial Similarity:  18 / 20
Agency Risk:                      9 / 15
Progress Mismatch:                8 / 10
```

Possible supporting evidence includes:

* observed project value
* peer benchmark
* deviation from benchmark
* execution duration
* geographic distance
* similarity indicators
* agency-level aggregates
* expenditure/progress relationship

---

## Human-in-the-Loop Investigation

Sentinel separates **automated analytical prioritization** from **human decision-making**.

```mermaid
flowchart TD
    A["Project Data"] --> B["Analytical Processing"]
    B --> C["Risk Signals"]
    C --> D["Audit Priority Score"]
    D --> E["Evidence"]
    E --> F["Priority Queue"]
    F --> G["Authorized Reviewer"]
    G --> H{"Investigation Outcome"}
    H --> I["No Issue Found"]
    H --> J["Additional Information Required"]
    H --> K["Verified Anomaly"]
    H --> L["Escalated"]
```

Possible investigation outcomes include:

* **No Issue Found**
* **Additional Information Required**
* **Verified Anomaly**
* **Escalated**

A **Verified Anomaly** is an investigation outcome and should not automatically be interpreted as proof of fraud.

---

## GIS Intelligence

The GIS component adds geographic context to project analysis.

It can support visualization of:

* project distribution
* project status
* expenditure patterns
* high-priority projects
* geographic clusters
* potentially related projects
* spatial relationships

```mermaid
flowchart LR
    A["Project Records"] --> B["Latitude and Longitude"]
    B --> C["Geospatial Processing"]
    C --> D["Project Locations"]
    C --> E["Risk Distribution"]
    C --> F["Spatial Relationships"]
    D --> G["GIS Interface"]
    E --> G
    F --> G
    G --> H["Project Investigation"]
```

GIS is therefore part of the investigation workflow rather than only a map visualization.

---

## System Architecture

```mermaid
flowchart TB
    D["Project Data"] --> P["Data Processing"]
    P --> A["Analytical Intelligence"]
    A --> R["Risk Intelligence"]
    R --> S["Audit Priority Score"]
    S --> E["Evidence Generation"]

    E --> DB[("PostgreSQL")]

    DB --> API["FastAPI"]
    API --> WEB["Next.js / React"]

    WEB --> DASH["Dashboard"]
    WEB --> QUEUE["Priority Queue"]
    WEB --> MAP["GIS"]
    WEB --> PROJECT["Project Investigation"]
    WEB --> EXPLAIN["Explainability"]

    DASH --> REVIEW["Authorized Reviewer"]
    QUEUE --> REVIEW
    MAP --> REVIEW
    PROJECT --> REVIEW
    EXPLAIN --> REVIEW

    REVIEW --> OUTCOME["Investigation Outcome"]
    OUTCOME --> DB
```

The architecture separates the main responsibilities of the platform:

**Data → Processing → Analytics → Risk Scoring → Evidence → API → Web Interface → Human Review**

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript / TSX
* Tailwind CSS
* Recharts
* Leaflet / React Leaflet
* Lucide React

### Backend

* Python
* FastAPI
* Pandas
* scikit-learn
* joblib
* Pydantic

### Database

* PostgreSQL
* SQLAlchemy

### Communication

The frontend communicates with the backend through REST/JSON APIs.

```mermaid
flowchart LR
    A["Next.js / React"] -->|REST / JSON| B["FastAPI"]
    B --> C["Application Services"]
    C --> D[("PostgreSQL")]
    C --> E["Analytical Components"]
```

---

## Data Sources and Data Honesty

Sentinel distinguishes between different classes of data used during development and demonstration.

### Curated / Derived Project Data

Project records prepared for analytical processing and demonstration.

### Synthetic Validation Data

Controlled data or injected scenarios used to test whether analytical components respond to known patterns.

### Analytical Features

Derived values calculated from project records for use by analytical signals.

```mermaid
flowchart LR
    A["Project Data"] --> B["Curated / Derived Records"]
    A --> C["Synthetic Validation Scenarios"]
    B --> D["Feature Preparation"]
    C --> D
    D --> E["Analytical Signals"]
    E --> F["Audit Priority Score"]
```

Synthetic anomalies are explicitly treated as **synthetic validation scenarios** and are not presented as actual government findings.

Similarly, a high Audit Priority Score is not represented as proof of fraud or irregularity.

---

## Validation Strategy

Sentinel uses controlled scenarios to evaluate whether the analytical pipeline responds to known patterns.

```mermaid
flowchart LR
    A["Baseline Dataset"] --> B["Controlled Scenario"]
    B --> C["Analytical Pipeline"]
    C --> D["Generated Signals"]
    D --> E["Expected Behaviour"]
    E --> F["Validation Result"]
```

Example validation scenarios include:

* unusual project cost
* unusual execution duration
* potentially similar projects
* agency-level patterns
* expenditure/progress mismatch

The validation process is intended to test **analytical behaviour**, not to claim that synthetic scenarios represent real-world findings.

---

## Repository Structure

```text
mplads-sentinel/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── styles/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── ml/
│   │   ├── data_pipeline/
│   │   ├── main.py
│   │   └── database.py
│   │
│   ├── model_artifacts/
│   ├── data/
│   └── requirements.txt
│
├── docs/
│   └── MASTER_ARCHITECTURE.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Dashboard

The web platform is organized around the investigation workflow.

```mermaid
flowchart TB
    A["Sentinel Dashboard"]

    A --> B["Overview"]
    A --> C["Audit Priority Queue"]
    A --> D["GIS Intelligence"]
    A --> E["Project Search"]
    A --> F["Investigation Workspace"]

    B --> B1["Projects Monitored"]
    B --> B2["Priority Distribution"]
    B --> B3["Risk Signal Distribution"]

    C --> C1["Audit Priority Score"]
    C --> C2["Project Status"]
    C --> C3["Risk Signals"]
    C --> C4["Location"]

    D --> D1["Project Locations"]
    D --> D2["Risk Distribution"]
    D --> D3["Spatial Relationships"]

    F --> F1["Score Breakdown"]
    F --> F2["Supporting Evidence"]
    F --> F3["GIS Context"]
    F --> F4["Investigation Status"]
    F --> F5["Reviewer Outcome"]
```

Primary user journey:

**Dashboard → Priority Queue → Project → Evidence → GIS Context → Investigation → Outcome**

---

## Local Development

### Prerequisites

Recommended development environment:

* Python 3.11
* Node.js
* npm
* PostgreSQL
* Git

Python 3.11 is recommended for compatibility with the project's machine-learning dependencies.

### Environment Variables

Run the following from the **repository root**:

```powershell
Copy-Item .env.example .env
```

Configure the required database and application values in `.env`.

Do not commit `.env`, passwords, API keys, or other credentials.

### Backend

The backend commands should be run from the **repository root**.

Create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r backend\requirements.txt
```

Start the API:

```powershell
python -m uvicorn backend.app.main:app --reload
```

The backend will normally be available at:

```text
http://localhost:8000
```

FastAPI's interactive API documentation will normally be available at:

```text
http://localhost:8000/docs
```

### Frontend

Open a **second terminal**.

Move into the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

> **Important:** Do not run `npm install` from the repository root. The frontend `package.json` is located inside `frontend/`.

### PostgreSQL

If PostgreSQL is required by the current application configuration:

* make sure PostgreSQL is running
* create the required database
* configure the database connection in `.env`
* make sure the backend can connect to the configured database

The exact database name, credentials, and connection variables should be taken from `.env.example` and the backend configuration rather than assumed from this README.

---

## MVP Architecture Philosophy

The MVP intentionally keeps the core architecture lightweight.

```mermaid
flowchart LR
    A["Next.js"] --> B["FastAPI"]
    B --> C["Python Analytics"]
    B --> D[("PostgreSQL")]
```

The architecture is designed to remain:

* understandable
* reproducible
* testable
* easy to demonstrate
* easy to debug
* modular enough to extend

Distributed infrastructure is not a prerequisite for the core MVP.

Technologies such as Kafka, Kubernetes, Celery, Redis, object storage, or mandatory PostGIS infrastructure can be considered later if scale and deployment requirements justify them.

---

## Project Scope

### Current MVP Focus

The MVP focuses on:

* project data processing
* five analytical risk signals
* transparent 0–100 prioritization
* evidence generation
* priority-based project review
* GIS context
* human-in-the-loop investigation
* controlled validation scenarios
* modular frontend/backend architecture

### Outside the Core MVP

The system does not attempt to:

* automatically declare fraud
* conduct fully autonomous investigations
* guarantee detection of every irregularity
* replace authorized human reviewers
* require large-scale distributed infrastructure for the core demonstration

---

## Limitations

### Data Quality

Analytical output depends on the completeness, accuracy, and consistency of the underlying project data.

### Threshold Sensitivity

Different datasets and peer-group definitions can produce different anomaly results.

### Weight Selection

The current scoring weights are MVP design choices and should be validated and calibrated using appropriate domain evidence and historical evaluation.

### Similarity Interpretation

Geographic or descriptive similarity can identify candidate relationships but cannot establish duplication on its own.

### Agency-Level Patterns

Historical aggregation can provide useful context but should not be interpreted as proof that an agency has acted improperly.

### Human Verification

Final conclusions require examination of supporting records and appropriate human review.

---

## Future Scope

Potential extensions include:

* richer semantic similarity models
* advanced geospatial analysis
* additional analytical signals
* document and evidence intelligence
* historical trend analysis
* reviewer feedback loops
* analytical model monitoring
* asynchronous processing
* production-grade data pipelines
* advanced access control
* larger-scale deployment infrastructure

These are future directions and are not presented as current MVP capabilities.

---

## SIH Demonstration Flow

A demonstration can follow a single project through the complete Sentinel workflow.

```mermaid
sequenceDiagram
    actor Reviewer
    participant UI as Sentinel UI
    participant API as FastAPI
    participant Risk as Risk Analysis
    participant DB as PostgreSQL

    Reviewer->>UI: Open Dashboard
    UI->>API: Request project overview
    API->>DB: Retrieve project data
    DB-->>API: Project records
    API-->>UI: Dashboard data

    Reviewer->>UI: Open Priority Queue
    UI->>API: Request prioritized projects
    API->>Risk: Calculate or retrieve signals
    Risk->>DB: Retrieve analytical data
    DB-->>Risk: Project features
    Risk-->>API: Signals, score and evidence
    API-->>UI: Priority queue

    Reviewer->>UI: Select project
    UI->>API: Request investigation details
    API-->>UI: Score, evidence and GIS context

    Reviewer->>UI: Review evidence
    Reviewer->>UI: Record investigation outcome

    UI->>API: Submit outcome
    API->>DB: Store investigation result
    DB-->>API: Confirmation
    API-->>UI: Updated status
```

The demonstration story is:

```text
Project Data
     ↓
Five Analytical Signals
     ↓
Audit Priority Score
     ↓
Evidence
     ↓
Priority Queue
     ↓
GIS + Project Investigation
     ↓
Human Review
     ↓
Investigation Outcome
```

---

## Responsible AI and Design Principles

### Explainability

Important analytical results should be connected to measurable evidence wherever possible.

### Human Decision-Making

The system prioritizes projects for attention; it does not replace authorized human review.

### Data Honesty

Curated, derived, and synthetic data are clearly distinguished.

### Reproducibility

Analytical methods, dependencies, datasets, and validation scenarios should be documented.

### Modular Architecture

Data processing, analytics, backend services, and frontend presentation are separated so that components can evolve independently.

### MVP Discipline

The project prioritizes a coherent, explainable working system instead of unnecessary infrastructure or unsupported capabilities.

---

## Team — Phantom Syndicate

MPLADS Sentinel is being developed by **Team Phantom Syndicate** for Smart India Hackathon 2026.

| Team Member                | Primary Responsibility                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Nidhi — Team Lead**      | Product direction, system coordination, architecture oversight, integration, technical decision-making and project leadership |
| **Arati A. Patil**         | Documentation, research support and presentation development                                                                  |
| **Agam BharatKumar Doshi** | Research, data analysis and domain/data support                                                                               |
| **Iffa A. Attar**          | System architecture, domain design and solution structuring                                                                   |
| **Dayyanahmed Jamadar**    | Backend and machine-learning development                                                                                      |
| **Krupal Rayakar**         | Frontend development and UI/UX implementation                                                                                 |

---

## Project Status

**Smart India Hackathon 2026 — MVP Development**

MPLADS Sentinel is being developed around **SIH Problem Statement SIH26102**.

The implementation is focused on:

* analytical correctness
* explainability
* evidence-backed prioritization
* reproducibility
* human-in-the-loop investigation
* modular architecture
* focused MVP scope

Features and technologies are documented according to their actual implementation status rather than being presented as completed capabilities prematurely.
