from typing import Dict, List
from server.models import PrivacyResponse, Team
from server.settings import load_settings


def sanitize_team_for_privacy(team_data: Dict, min_team_size: int) -> Team:
    """
    Applies server-side privacy suppression if team membership is below threshold.
    Guarantees that small teams cannot be re-identified or individually reverse-engineered.
    """
    members = team_data.get("members", 0)

    if members < min_team_size:
        return Team(
            id=team_data["id"],
            name=team_data["name"],
            department=team_data["department"],
            members=members,
            communication=0.0,
            meetings=0.0,
            recovery=0.0,
            workload=0.0,
            after_hours=0.0,
            signal="Metrics suppressed for privacy",
            severity="Protected",
            is_suppressed=True,
            suppression_reason=(
                f"Team headcount ({members}) is below the privacy threshold ({min_team_size} members). "
                "Aggregated indicators are suppressed to prevent differential identification of individuals."
            ),
        )

    return Team(
        id=team_data["id"],
        name=team_data["name"],
        department=team_data["department"],
        members=members,
        communication=float(team_data["communication"]),
        meetings=float(team_data["meetings"]),
        recovery=float(team_data["recovery"]),
        workload=float(team_data["workload"]),
        after_hours=float(team_data["after_hours"]),
        signal=team_data["signal"],
        severity=team_data["severity"],
        is_suppressed=False,
        suppression_reason=None,
    )


def sanitize_teams_list(teams_data: List[Dict]) -> List[Team]:
    settings = load_settings()
    threshold = settings.minimum_team_size
    return [sanitize_team_for_privacy(t, threshold) for t in teams_data]


def get_privacy_metadata() -> PrivacyResponse:
    settings = load_settings()
    return PrivacyResponse(
        privacy_mode="Team-level aggregate only",
        raw_messages_stored=False,
        individual_burnout_scores=False,
        individual_ranking=False,
        aggregation_required=settings.team_aggregation,
        minimum_team_size=settings.minimum_team_size,
        synthetic_demo_data=settings.synthetic_demo_mode,
        description=(
            f"Active privacy boundary enforces a minimum group threshold of {settings.minimum_team_size} members. "
            "No raw messages, sentiment scores, or employee rankings are captured or computed."
        ),
    )
