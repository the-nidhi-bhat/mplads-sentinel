# MPLADS Sentinel - Code & Architecture Summary

## Overview

MPLADS Sentinel is a full-stack explainable AI-powered application designed for audit prioritization of MPLADS (Member of Parliament Local Area Development Scheme) projects. It analyzes large datasets of projects and ranks them based on an **Audit Priority Score (0-100)** to assist human auditors in identifying potentially anomalous projects.

## System Architecture & Tech Stack

The platform is structured into a modern full-stack architecture:

1. **Backend & Data Processing (Python)**
   - **FastAPI**: Serves as the REST API backend. It handles data ingestion via CSV uploads and provides endpoints for the frontend to retrieve project and anomaly data.
   - **Pandas / Python**: Responsible for data cleaning, normalization, and feature engineering.
   - **PostgreSQL**: The relational database used to store project details, investigation notes, audit logs, and computed anomalies.

2. **Anomaly Detection Pipeline (Machine Learning)**
   - **Isolation Forests**: Used to detect statistical outliers in project costs and timelines.
   - **Rule-based & Similarity Models**: Used for spatial overlap (geographic distance + text similarity), agency risk aggregation, and progress vs. expenditure mismatch.
   - **Explainability Engine**: Instead of black-box predictions, the system computes clear, readable evidence (e.g., "34% above comparable-project median") explaining *why* a project received its score.

3. **Frontend Application (TypeScript / React)**
   - **Next.js**: The React framework powering the user interface. It provides the investigation workspace, priority queues, and project intelligence dashboards.
   - Auditors interact with this interface to review evidence, add investigation notes, and escalate or close cases.

## Core Workflow

1. **Ingestion**: Raw MPLADS/eSAKSHI project data is uploaded via the FastAPI endpoint.
2. **Analysis**: The Python backend processes the data through five distinct signals:
   - **Cost Anomaly (30 pts)**
   - **Timeline Anomaly (25 pts)**
   - **Duplicate / Spatial Overlap (20 pts)**
   - **Agency Risk (15 pts)**
   - **Progress / Expenditure Mismatch (10 pts)**
3. **Scoring & Evidence Generation**: The system calculates a total Audit Priority Score and attaches specific evidence for each triggered signal.
4. **Prioritization**: The highest-scoring projects are surfaced in the Next.js frontend priority queue.
5. **Investigation**: Human auditors review the flagged projects, analyze the transparent evidence provided by the system, and make final judgements (e.g., "Verified Anomaly", "No Issue Found").

## Key Principle

Sentinel is explicitly designed as a **human-in-the-loop** system. It identifies patterns and provides transparent explanations but does not make automated fraud declarations. The final decision always rests with the human auditor.
