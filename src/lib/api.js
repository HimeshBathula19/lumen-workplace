const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorDetail = `Status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.detail) {
          errorDetail = errorJson.detail;
        }
      } catch {
        // use default status message
      }
      throw new Error(`LUMEN API error (${endpoint}): ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(`Unable to connect to LUMEN API at ${API_BASE_URL}. Ensure the backend server is running.`);
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// SYSTEM & OVERVIEW
// ---------------------------------------------------------------------------

export function getHealth() {
  return request("/health");
}

export function getOverview(rangeDays = "30d") {
  return request(`/overview?range_days=${rangeDays}`);
}

// ---------------------------------------------------------------------------
// TEAMS
// ---------------------------------------------------------------------------

export function getTeams() {
  return request("/teams");
}

export function getTeamDetail(teamId) {
  return request(`/teams/${encodeURIComponent(teamId)}`);
}

// ---------------------------------------------------------------------------
// SIGNALS
// ---------------------------------------------------------------------------

export function getSignals() {
  return request("/signals");
}

export function getSignalDetail(signalId) {
  return request(`/signals/${encodeURIComponent(signalId)}`);
}

// ---------------------------------------------------------------------------
// CAUSAL INTELLIGENCE
// ---------------------------------------------------------------------------

export function getCausalAnalysis(teamId = "atlas") {
  return request(`/causal?team_id=${encodeURIComponent(teamId)}`);
}

export function analyzeCausal(teamId = "atlas", controls = ["Workload", "Project pressure"]) {
  return request("/causal/analyze", {
    method: "POST",
    body: JSON.stringify({
      team_id: teamId,
      treatment: "Meeting load",
      outcome: "Recovery",
      controls,
    }),
  });
}

// ---------------------------------------------------------------------------
// WHAT-IF ENGINE
// ---------------------------------------------------------------------------

export function getWhatIf(teamId = "atlas") {
  return request(`/what-if?team_id=${encodeURIComponent(teamId)}`);
}

export function simulateWhatIf(payload = {}) {
  return request("/what-if/simulate", {
    method: "POST",
    body: JSON.stringify({
      team_id: teamId,
      proposed_treatment: Number(proposedTreatment),
    }),
  });
}

// ---------------------------------------------------------------------------
// EXPERIMENTS
// ---------------------------------------------------------------------------

export function getExperiments() {
  return request("/experiments");
}

export function getExperimentDetail(experimentId) {
  return request(`/experiments/${encodeURIComponent(experimentId)}`);
}

export function createExperiment(experimentData) {
  return request("/experiments", {
    method: "POST",
    body: JSON.stringify(experimentData),
  });
}

export function updateExperiment(experimentId, patchData) {
  return request(`/experiments/${encodeURIComponent(experimentId)}`, {
    method: "PATCH",
    body: JSON.stringify(patchData),
  });
}

export function deleteExperiment(experimentId) {
  return request(`/experiments/${encodeURIComponent(experimentId)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// PRIVACY & SETTINGS
// ---------------------------------------------------------------------------

export function getPrivacy() {
  return request("/privacy");
}

export function getSettings() {
  return request("/settings");
}

export function updateSettings(settingsData) {
  return request("/settings", {
    method: "PUT",
    body: JSON.stringify(settingsData),
  });
}

// ---------------------------------------------------------------------------
// REPORTS & EXPORTS
// ---------------------------------------------------------------------------

export function getReportSummary(teamId = "atlas") {
  return request(`/reports/summary?team_id=${encodeURIComponent(teamId)}`);
}

export function generateReport(teamId = "atlas") {
  return request(`/reports/generate?team_id=${encodeURIComponent(teamId)}`, {
    method: "POST",
  });
}

export function getExportJsonUrl(teamId = "atlas") {
  return `${API_BASE_URL}/reports/export/json?team_id=${encodeURIComponent(teamId)}`;
}

export function getExportCsvUrl(teamId = "atlas") {
  return `${API_BASE_URL}/reports/export/csv?team_id=${encodeURIComponent(teamId)}`;
}

export function getTeam(teamId) { return getTeamDetail(teamId); }

export function getIntegrations() {
  return request("/integrations");
}

export function disconnectIntegration(provider) {
  return request(`/integrations/${encodeURIComponent(provider)}/disconnect`, {
    method: "POST",
  });
}

export function syncIntegration(provider) {
  return request(`/integrations/${encodeURIComponent(provider)}/sync`, {
    method: "POST",
  });
}

