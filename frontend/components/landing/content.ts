/* ─────────────────────────────────────────────
   content.ts — All landing page copy & data
   Keep OUT of JSX so content edits never touch markup.
   ───────────────────────────────────────────── */

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#hero" },
  { label: "About the Scheme", href: "#overview" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Detection Signals", href: "#signals" },
  { label: "Dashboard", href: "/dashboard" },
];

export interface LandmarkImage {
  src: string;
  alt: string;
  credit: string;
}

export const LANDMARK_IMAGES: LandmarkImage[] = [
  {
    src: "/landmarks/india-gate.jpg",
    alt: "India Gate, New Delhi",
    credit: "Photo: Unsplash / Public Domain",
  },
  {
    src: "/landmarks/parliament-house.jpg",
    alt: "Parliament House (Sansad Bhavan), New Delhi",
    credit: "Photo: Unsplash / Public Domain",
  },
  {
    src: "/landmarks/rashtrapati-bhavan.jpg",
    alt: "Rashtrapati Bhavan, New Delhi",
    credit: "Photo: Unsplash / Public Domain",
  },
  {
    src: "/landmarks/gateway-of-india.jpg",
    alt: "Gateway of India, Mumbai",
    credit: "Photo: Unsplash / Public Domain",
  },
  {
    src: "/landmarks/red-fort.jpg",
    alt: "Red Fort, Delhi",
    credit: "Photo: Unsplash / Public Domain",
  },
];

export interface StatItem {
  value: string;
  label: string;
  note?: string;
}

export const STATS: StatItem[] = [
  { value: "24,681", label: "Projects Tracked", note: "Illustrative data" },
  { value: "28", label: "States & UTs Covered", note: "Illustrative data" },
  { value: "5", label: "Detection Signals Live", note: "" },
  { value: "1,284", label: "Projects Flagged", note: "Illustrative data" },
];

export interface MPLADSFundFlow {
  step: string;
  description: string;
}

export const MPLADS_FUND_FLOW: MPLADSFundFlow[] = [
  {
    step: "MP Recommends",
    description:
      "Members of Parliament recommend developmental works in their constituencies based on locally felt needs.",
  },
  {
    step: "District Authority Sanctions",
    description:
      "District Authorities conduct feasibility checks and sanction works after due diligence.",
  },
  {
    step: "Implementing Agency Executes",
    description:
      "Designated agencies execute the sanctioned works with periodic progress reporting.",
  },
  {
    step: "Monitoring & Audit",
    description:
      "MoSPI monitors utilization through the MPLADS-eSAKSHI portal and periodic audits.",
  },
];

export interface PipelineStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    number: 1,
    title: "Data Sources",
    description:
      "Public MPLADS project records, expenditure data, and implementation reports.",
    icon: "database",
  },
  {
    number: 2,
    title: "Ingestion",
    description:
      "Multi-modal data streams are normalized, validated, and prepared for analysis.",
    icon: "upload-cloud",
  },
  {
    number: 3,
    title: "Analysis",
    description:
      "ML models examine cost, timeline, spatial, agency, and progress dimensions.",
    icon: "cpu",
  },
  {
    number: 4,
    title: "Priority Score",
    description:
      "An explainable Audit Priority Score (0–100) is computed from weighted signals.",
    icon: "target",
  },
  {
    number: 5,
    title: "Evidence Pack",
    description:
      "Each flag is paired with concrete evidence — observed vs. benchmark values.",
    icon: "file-text",
  },
  {
    number: 6,
    title: "Human Investigation",
    description:
      "Nodal officers review evidence and make the final determination.",
    icon: "user-check",
  },
];

export interface DetectionSignal {
  name: string;
  description: string;
  example: string;
  status: "live" | "planned";
  icon: string;
}

export const DETECTION_SIGNALS: DetectionSignal[] = [
  {
    name: "Cost Outlier Detection",
    description:
      "Compares sanctioned costs against regional benchmarks for similar works to identify statistical outliers.",
    example: "Project cost 34.6% above peer median for community halls in Karnataka.",
    status: "live",
    icon: "indian-rupee",
  },
  {
    name: "Timeline Anomaly",
    description:
      "Flags projects with completion delays that exceed expected durations relative to scope and type.",
    example: "Project 326 days elapsed vs. 180-day expected completion.",
    status: "live",
    icon: "clock",
  },
  {
    name: "Spatial Overlap Detection",
    description:
      "Identifies projects with geographic proximity that may represent duplicate or overlapping works.",
    example: "92% similarity rating with an existing road completed 2km away.",
    status: "live",
    icon: "map-pin",
  },
  {
    name: "Agency Risk Profiling",
    description:
      "Aggregates historical performance by implementing agency to surface systemic patterns.",
    example: "Agency with 3 of 5 recent projects showing cost overruns.",
    status: "planned",
    icon: "building-2",
  },
  {
    name: "Progress-Payment Mismatch",
    description:
      "Detects divergence between physical progress reported and financial expenditure logged.",
    example: "Financial progress 96.8% while physical progress is only 48%.",
    status: "live",
    icon: "activity",
  },
];

export interface ScoreBand {
  range: string;
  label: string;
  color: string;
  description: string;
}

export const SCORE_BANDS: ScoreBand[] = [
  {
    range: "0 – 30",
    label: "Low",
    color: "risk-low",
    description: "Normal progression. No anomalies detected.",
  },
  {
    range: "31 – 60",
    label: "Medium",
    color: "risk-medium",
    description: "Minor deviations. Worth monitoring but not urgent.",
  },
  {
    range: "61 – 80",
    label: "High",
    color: "risk-high",
    description: "Significant anomalies. Recommended for review.",
  },
  {
    range: "81 – 100",
    label: "Critical",
    color: "risk-critical",
    description: "Multiple severe indicators. Prioritize for investigation.",
  },
];

export interface EvidenceCard {
  factor: string;
  observed: string;
  benchmark: string;
  deviation: string;
  points: string;
  riskClass: "critical" | "high" | "medium" | "low";
}

export const EXAMPLE_EVIDENCE: EvidenceCard[] = [
  {
    factor: "Cost Anomaly",
    observed: "₹82.40 Lakh",
    benchmark: "₹61.20 Lakh",
    deviation: "+34.6%",
    points: "+28 Points",
    riskClass: "critical",
  },
  {
    factor: "Payment Pattern",
    observed: "78% spent in last 12 days",
    benchmark: "Gradual expenditure over time",
    deviation: "High concentration",
    points: "+21 Points",
    riskClass: "critical",
  },
  {
    factor: "Project Delay",
    observed: "326 days elapsed",
    benchmark: "180 days limit",
    deviation: "+146 days",
    points: "+16 Points",
    riskClass: "high",
  },
  {
    factor: "Progress-Payment Mismatch",
    observed: "Fin: 96.8% | Phys: 48%",
    benchmark: "Proportional progress matching",
    deviation: "High mismatch",
    points: "+14 Points",
    riskClass: "high",
  },
];

export interface AuditorRole {
  role: string;
  description: string;
  icon: string;
}

export const AUDITOR_ROLES: AuditorRole[] = [
  {
    role: "District Auditors",
    description:
      "Review flagged projects in their jurisdiction and initiate field verification.",
    icon: "search",
  },
  {
    role: "Monitoring Officers",
    description:
      "Track investigation progress and ensure timely resolution of flagged cases.",
    icon: "eye",
  },
  {
    role: "State Nodal Authorities",
    description:
      "Oversee cross-district patterns and coordinate escalation with MoSPI.",
    icon: "shield",
  },
  {
    role: "MoSPI Administrators",
    description:
      "Access system-wide analytics and manage scheme-level policy configurations.",
    icon: "settings",
  },
];

export const FOOTER_LINKS = [
  { label: "About", href: "#about" },
  { label: "Methodology", href: "#signals" },
  { label: "Data Sources", href: "#transparency" },
  { label: "Privacy", href: "#" },
  { label: "Accessibility", href: "#" },
];

export const POSITIONING_LINE =
  "We don't replace eSAKSHI. Existing systems record and expose project information — Sentinel adds an independent analytical layer on top of that data: it looks for unusual patterns, explains the evidence behind every flag, and prioritizes projects for human investigation.";

export const DISCLAIMER =
  "Independent SIH 2026 prototype — not an official Government of India portal.";

export const HERO_HEADLINE = "From Project Data to Audit Intelligence";

export const HERO_PITCH =
  "MPLADS Sentinel is an explainable AI audit-prioritization tool that analyzes public project and expenditure data for unusual cost, timeline, spatial, agency, and progress patterns. It produces a traceable Audit Priority Score so that human auditors can focus limited review capacity on the projects that most need a closer look.";

export const HERO_CTA_PRIMARY = "Enter Sentinel";
export const HERO_CTA_SECONDARY = "Explore the System";
export const HERO_TRUST_LINE =
  "Evidence-Based · Explainable · Human-in-the-Loop";

export const FINAL_CTA_HEADLINE =
  "Turn Project Data Into Actionable Audit Priorities";
export const FINAL_CTA_SUBTEXT =
  "AI-assisted · Evidence-backed · Human-led.";

export const SCORE_EXPLAINER_DISCLAIMER =
  "The score prioritizes attention. It does not establish wrongdoing.";
