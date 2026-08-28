import { projectsData, type Project } from "@/lib/mock-data";
import {
  Investigation,
  InvestigationStatus,
  RiskLevel,
} from "./types";

const riskLevelMap: Record<Project["riskLevel"], RiskLevel> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function statusFor(project: Project): InvestigationStatus {
  return project.riskScore >= 80 ? "Under Review" : "New";
}

function projectToInvestigation(project: Project): Investigation {
  const flaggedOn = project.sanctionDate || "Not available";
  const anomalyReason = {
    id: `reason-${project.id}`,
    label: project.primaryFinding,
    detail: `${project.primaryFinding} detected by the shared audit dataset for ${project.agency}.`,
    weight: Math.min(100, Math.max(1, project.riskScore)),
  };

  return {
    id: `INV-${project.id.replace(/[^A-Za-z0-9]/g, "-")}`,
    projectId: project.id,
    projectName: project.title,
    mpName: "Not available",
    constituency: project.constituency || "Not available",
    district: project.district || "Not available",
    state: project.state,
    sector: project.workType || "Not classified",
    sanctionedAmount: 0,
    utilizedAmount: 0,
    riskScore: project.riskScore,
    riskLevel: riskLevelMap[project.riskLevel],
    status: statusFor(project),
    assignedTo: project.assignedTo || "Unassigned",
    flaggedOn,
    lastUpdated: flaggedOn,
    anomalyReasons: [anomalyReason],
    evidence: project.evidence.map((item, index) => ({
      id: `${project.id}-evidence-${index}`,
      type: "data",
      title: item.factor,
      description: item.observed || item.deviation || item.benchmark || project.primaryFinding,
      source: "Shared audit dataset",
      addedOn: flaggedOn,
    })),
    timeline: [
      {
        id: `${project.id}-timeline-1`,
        timestamp: flaggedOn,
        actor: "Sentinel",
        action: "flagged this project automatically",
        note: project.primaryFinding,
      },
    ],
    findings: [],
  };
}

export const INVESTIGATIONS: Investigation[] = projectsData
  .filter((project) => project.riskScore >= 60)
  .map(projectToInvestigation);