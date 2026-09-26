"""
LUMEN Extension Points & Future Architectural Interfaces

These interfaces establish clean architectural extension boundaries for future
enterprise integrations, privacy-preserving federated computation, on-device edge
inference, and multi-agent reasoning.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class SignalDetector(ABC):
    """Extension interface for automated workplace anomaly and trend detection."""

    @abstractmethod
    def detect_signals(self, time_series_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass


class CausalEstimator(ABC):
    """Extension interface for statistical and machine-learning causal identification algorithms."""

    @abstractmethod
    def estimate_effect(
        self,
        treatment: str,
        outcome: str,
        controls: List[str],
        data: Any,
    ) -> Dict[str, Any]:
        pass


class CounterfactualModel(ABC):
    """Extension interface for counterfactual and do-calculus simulation engines."""

    @abstractmethod
    def simulate_scenario(
        self,
        intervention: Dict[str, Any],
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        pass


class ExperimentEvaluator(ABC):
    """Extension interface for pre-post and synthetic control trial evaluation."""

    @abstractmethod
    def evaluate_trial(self, experiment_id: str) -> Dict[str, Any]:
        pass


class DataConnector(ABC):
    """Extension interface for enterprise communication connectors (Slack, Teams, Calendar, Jira)."""

    @abstractmethod
    def extract_aggregates(self, team_id: str, start_time: str, end_time: str) -> Dict[str, Any]:
        pass


class PrivacyProvider(ABC):
    """Extension interface for differential privacy, k-anonymity, and noise injection."""

    @abstractmethod
    def apply_differential_privacy(
        self,
        aggregates: Dict[str, Any],
        epsilon: float = 0.5,
    ) -> Dict[str, Any]:
        pass


class FederatedDataProvider(ABC):
    """Future Research: Federated learning across disparate organizational business units."""

    @abstractmethod
    def compute_local_gradient(self, local_data: Any) -> Any:
        pass


class OnDeviceInferenceProvider(ABC):
    """Future Research: Local client-side causal estimation without transmitting telemetry."""

    @abstractmethod
    def run_local_inference(self, team_model_weights: Any) -> Dict[str, Any]:
        pass


# ============================================================================
# AGENTIC REASONING INTERFACES
# ============================================================================

class CausalReasoningAgent(ABC):
    """Future Agent: Hypothesizes potential confounders and backdoor paths."""

    @abstractmethod
    def formulate_hypotheses(self, signal: Dict[str, Any]) -> List[str]:
        pass


class PrivacyAgent(ABC):
    """Future Agent: Audits queries and data requests for re-identification vulnerabilities."""

    @abstractmethod
    def audit_privacy_boundary(self, query: str) -> bool:
        pass


class ExperimentAgent(ABC):
    """Future Agent: Automatically proposes trial designs and minimum sample periods."""

    @abstractmethod
    def design_intervention(self, hypothesis: str) -> Dict[str, Any]:
        pass


class ExplanationAgent(ABC):
    """Future Agent: Produces plain-language decision memos for organizational leaders."""

    @abstractmethod
    def generate_briefing(self, findings: Dict[str, Any]) -> str:
        pass
