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

  const sanctionedAmountNum = parseFloat(project.sanctionedAmount) || 0;
  const utilizedAmountNum = parseFloat(project.expenditure) || 0;

  return {
    id: `INV-${project.id.replace(/[^A-Za-z0-9]/g, "-")}`,
    projectId: project.id,
    projectName: project.title,
    mpName: (project as any).mpName || project.agency || "Not available",
    constituency: project.constituency || project.district || "Not available",
    district: project.district || project.state || "Not available",
    state: project.state || "Not available",
    sector: project.workType || "Infrastructure",
    sanctionedAmount: sanctionedAmountNum,
    utilizedAmount: utilizedAmountNum,
    riskScore: project.riskScore,
    riskLevel: riskLevelMap[project.riskLevel] || "Medium",
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

export function investigationsFromProjects(projects: Project[]): Investigation[] {
  return projects
    .filter((project) => (project as any).is_flagged || project.riskScore >= 50)
    .map(projectToInvestigation);
}

export const INVESTIGATIONS: Investigation[] = investigationsFromProjects(projectsData);