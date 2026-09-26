from typing import List, Optional
from pydantic import BaseModel, Field


class Team(BaseModel):
    id: str
    name: str
    department: str
    members: int
    communication: float
    meetings: float
    recovery: float
    workload: float
    after_hours: float
    signal: str
    severity: str
    is_suppressed: bool = False
    suppression_reason: Optional[str] = None


class Signal(BaseModel):
    id: str
    team: str
    pattern: str
    metric: str
    magnitude: float
    direction: str  # "increase" or "decrease"
    severity: str   # "Moderate", "Watch", "Stable"
    detected: str
    persistence: str
    hypothesis: str
    potential_contributors: List[str] = Field(default_factory=list)
    current_evidence: str
    next_analytical_step: str
    privacy_status: str = "Aggregated team-level metadata"


class TimeSeriesPoint(BaseModel):
    date: str
    communication: float
    meetings: float
    workload: float
    recovery: float


class OverviewResponse(BaseModel):
    communication: float
    meetings: float
    recovery: float
    workload: float
    teams_count: int
    active_signals_count: int
    synthetic: bool
    status: str
    last_update: str
    attention_team: str
    attention_signal: str
    attention_recovery: float
    attention_change: float
    time_series: List[TimeSeriesPoint]


class CausalNode(BaseModel):
    id: str
    label: str
    type: str  # "treatment", "outcome", "confounder", "covariate"
    role: str
    description: str


class CausalAnalysisResponse(BaseModel):
    team: str
    treatment: str
    outcome: str
    control_variables: List[str]
    estimated_effect: float
    std_error: float
    ci_lower: float
    ci_upper: float
    confidence: float
    p_value: float
    r_squared: float
    sample_size: int
    unadjusted_effect: float
    assumptions: List[str]
    status: str
    interpretation: str
    sensitivity: str
    nodes: List[CausalNode]


class CausalAnalyzeRequest(BaseModel):
    team_id: str = "atlas"
    treatment: str = "Meeting load"
    outcome: str = "Recovery"
    controls: List[str] = Field(default_factory=lambda: ["Workload", "Project pressure"])


class WhatIfRequest(BaseModel):
    team_id: str = "atlas"
    proposed_treatment: float = 14.0


class WhatIfResponse(BaseModel):
    team_id: str
    treatment_name: str
    outcome_name: str
    baseline_treatment: float
    scenario_treatment: float
    baseline_outcome: float
    estimated_outcome: float
    difference: float
    ci_lower: float
    ci_upper: float
    assumptions: List[str]
    disclaimer: str
    status: str


class Experiment(BaseModel):
    id: str
    name: str
    team: str
    hypothesis: str
    treatment: str
    intervention: str
    baseline: str
    target: str
    observation_window: str
    start_date: str
    end_date: str
    primary_outcome: str
    status: str  # "Draft", "Planned", "Running", "Paused", "Completed"
    progress: int
    notes: str
    created_at: str


class ExperimentCreate(BaseModel):
    name: str
    team: str
    hypothesis: str
    treatment: str
    intervention: str
    baseline: str
    target: str
    observation_window: str
    primary_outcome: str
    notes: Optional[str] = ""


class ExperimentUpdate(BaseModel):
    name: Optional[str] = None
    team: Optional[str] = None
    hypothesis: Optional[str] = None
    treatment: Optional[str] = None
    intervention: Optional[str] = None
    baseline: Optional[str] = None
    target: Optional[str] = None
    observation_window: Optional[str] = None
    primary_outcome: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    notes: Optional[str] = None


class SettingsModel(BaseModel):
    workspace_name: str = "LUMEN Workspace"
    timezone: str = "Asia/Kolkata"
    minimum_team_size: int = 5
    auto_refresh_interval: int = 10
    causal_confidence_display: bool = True
    signal_alerts: bool = True
    weekly_reports: bool = True
    synthetic_demo_mode: bool = True
    team_aggregation: bool = True


class PrivacyResponse(BaseModel):
    privacy_mode: str = "Team-level aggregate only"
    raw_messages_stored: bool = False
    individual_burnout_scores: bool = False
    individual_ranking: bool = False
    aggregation_required: bool = True
    minimum_team_size: int = 5
    synthetic_demo_data: bool = True
    description: str = (
        "LUMEN analyzes aggregated team conditions. "
        "No private message text or individual employee scores enter the analytical layer."
    )
