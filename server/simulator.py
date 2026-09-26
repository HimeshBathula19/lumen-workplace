from typing import Dict, Optional
import numpy as np
from server.causal import estimate_causal_effect
from server.data import INITIAL_TEAMS
from server.models import WhatIfResponse


def simulate_counterfactual(
    team_id: str = "atlas",
    proposed_meeting_hours: float = 14.0,
) -> WhatIfResponse:
    """
    Simulates counterfactual recovery for a team under a modified meeting load.
    The response is computed dynamically from the fitted OLS causal model.
    """
    # 1. Lookup team baseline
    team = next(
        (t for t in INITIAL_TEAMS if t["id"] == team_id.lower()),
        INITIAL_TEAMS[0],
    )

    # Team baseline meeting load and recovery
    # Atlas defaults to 18.4h / 58% as specified in requirement 24
    if team["id"] == "atlas":
        baseline_meeting = 18.4
        baseline_recovery = 58.0
    else:
        # Scale meeting index (0-100) to representative weekly hours (8-26h)
        baseline_meeting = round(8.0 + (team["meetings"] / 100.0) * 16.0, 1)
        baseline_recovery = float(team["recovery"])

    # 2. Get fitted causal effect from OLS regression adjustment
    causal_res = estimate_causal_effect()
    beta = causal_res["estimated_effect"]  # Approx -1.25 recovery points per hour
    ci_lower = causal_res["ci_lower"]      # Approx -1.42
    ci_upper = causal_res["ci_upper"]      # Approx -1.08

    # 3. Compute counterfactual delta
    delta_treatment = float(proposed_meeting_hours) - baseline_meeting
    # When meetings decrease (delta_treatment < 0), recovery increases:
    # delta_outcome = beta * delta_treatment
    delta_outcome = beta * delta_treatment

    estimated_outcome = float(np.clip(baseline_recovery + delta_outcome, 0.0, 100.0))

    # Uncertainty bounds
    # Notice: if delta_treatment is negative (reduction in meetings),
    # the larger boost comes from the more negative slope (ci_lower)
    bound_1 = float(np.clip(baseline_recovery + ci_lower * delta_treatment, 0.0, 100.0))
    bound_2 = float(np.clip(baseline_recovery + ci_upper * delta_treatment, 0.0, 100.0))
    unc_lower = min(bound_1, bound_2)
    unc_upper = max(bound_1, bound_2)

    assumptions = [
        "Workload and project delivery pressure remain stationary at baseline levels.",
        "Team operational workflow can absorb the reduction without informal meeting spillover.",
        "Treatment response remains locally linear within the 8.0h–24.0h operating range.",
        "Estimated effects represent team-level aggregates, not individual employee resilience.",
    ]

    disclaimer = (
        "Counterfactual estimates are model outputs derived from synthetic causal regression, "
        "not guaranteed organizational outcomes. Real-world validation via controlled trials is required."
    )

    return WhatIfResponse(
        team_id=team["id"],
        treatment_name="Weekly Meeting Hours",
        outcome_name="Team Recovery Index",
        baseline_treatment=baseline_meeting,
        scenario_treatment=round(float(proposed_meeting_hours), 1),
        baseline_outcome=round(baseline_recovery, 1),
        estimated_outcome=round(estimated_outcome, 1),
        difference=round(delta_outcome, 1),
        ci_lower=round(unc_lower, 1),
        ci_upper=round(unc_upper, 1),
        assumptions=assumptions,
        disclaimer=disclaimer,
        status="Synthetic counterfactual simulation",
    )
