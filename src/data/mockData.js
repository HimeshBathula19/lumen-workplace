export const workspace = {
  name: "LUMEN Workspace",
  lastUpdated: new Date(),
};

export const teams = [
  {
    id: "atlas",
    name: "Atlas",
    department: "Product Engineering",
    members: 18,
    communication: 72,
    meetings: 64,
    recovery: 58,
    workload: 74,
    afterHours: 31,
    signal: "Recovery disruption",
    severity: "Moderate",
  },
  {
    id: "northstar",
    name: "Northstar",
    department: "Data & Intelligence",
    members: 14,
    communication: 81,
    meetings: 71,
    recovery: 54,
    workload: 78,
    afterHours: 36,
    signal: "Communication burst",
    severity: "Moderate",
  },
  {
    id: "vector",
    name: "Vector",
    department: "Platform",
    members: 22,
    communication: 67,
    meetings: 59,
    recovery: 63,
    workload: 69,
    afterHours: 22,
    signal: "Workload intensity",
    severity: "Watch",
  },
  {
    id: "orbit",
    name: "Orbit",
    department: "Design Systems",
    members: 11,
    communication: 51,
    meetings: 43,
    recovery: 76,
    workload: 48,
    afterHours: 12,
    signal: "Stable",
    severity: "Stable",
  },
  {
    id: "meridian",
    name: "Meridian",
    department: "Customer Operations",
    members: 26,
    communication: 74,
    meetings: 68,
    recovery: 61,
    workload: 72,
    afterHours: 29,
    signal: "Meeting concentration",
    severity: "Watch",
  },
  {
    id: "vertex",
    name: "Vertex",
    department: "Security",
    members: 9,
    communication: 46,
    meetings: 38,
    recovery: 82,
    workload: 43,
    afterHours: 9,
    signal: "Stable",
    severity: "Stable",
  },
  {
    id: "harbor",
    name: "Harbor",
    department: "Operations",
    members: 17,
    communication: 59,
    meetings: 52,
    recovery: 69,
    workload: 57,
    afterHours: 17,
    signal: "Recovery improving",
    severity: "Stable",
  },
  {
    id: "summit",
    name: "Summit",
    department: "Research",
    members: 13,
    communication: 63,
    meetings: 48,
    recovery: 71,
    workload: 54,
    afterHours: 15,
    signal: "Focus disruption",
    severity: "Watch",
  },
];

export const signals = [
  {
    id: "SIG-104",
    team: "Atlas",
    type: "Recovery disruption",
    metric: "Recovery",
    value: -14,
    severity: "Moderate",
  },
  {
    id: "SIG-103",
    team: "Northstar",
    type: "After-hours communication",
    metric: "Communication",
    value: 31,
    severity: "Moderate",
  },
  {
    id: "SIG-102",
    team: "Vector",
    type: "Workload intensity",
    metric: "Workload",
    value: 18,
    severity: "Watch",
  },
  {
    id: "SIG-101",
    team: "Meridian",
    type: "Meeting concentration",
    metric: "Meetings",
    value: 16,
    severity: "Watch",
  },
];

export const causalAnalysis = {
  team: "Atlas",
  treatment: "Meeting load",
  outcome: "Recovery",
  estimatedEffect: -0.18,
  uncertainty: 0.06,
  confidence: 0.94,
  assumptions: [
    "Workload is adequately controlled",
    "Analysis uses team-level aggregation",
    "No major unobserved confounder is assumed",
  ],
};

export const whatIfModel = {
  baselineMeetingHours: 18.4,
  proposedMeetingHours: 14,
  baselineRecovery: 58,
  estimatedRecovery: 64,
};

export function getWorkspaceMetrics() {
  const activeSignals = signals.length;

  const communication = Math.round(
    teams.reduce(
      (sum, team) => sum + team.communication,
      0
    ) / teams.length
  );

  const meetings = Math.round(
    teams.reduce(
      (sum, team) => sum + team.meetings,
      0
    ) / teams.length
  );

  const recovery = Math.round(
    teams.reduce(
      (sum, team) => sum + team.recovery,
      0
    ) / teams.length
  );

  return {
    communication,
    meetings,
    recovery,
    teams: teams.length,
    activeSignals,
  };
}