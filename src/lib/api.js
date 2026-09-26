const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

async function request(
  endpoint,
  options = {}
) {
  const url =
    `${API_BASE_URL}${endpoint}`;

  try {
    const response =
      await fetch(url, {
        headers: {
          "Content-Type":
            "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

    if (!response.ok) {
      let detail =
        `Status ${response.status}`;

      try {
        const errorJson =
          await response.json();

        if (
          errorJson?.detail
        ) {
          detail =
            errorJson.detail;
        }
      } catch {
        // Ignore invalid error JSON.
      }

      throw new Error(
        `LUMEN API error (${endpoint}): ${detail}`
      );
    }

    return await response.json();
  } catch (error) {
    if (
      error instanceof TypeError &&
      String(error.message)
        .toLowerCase()
        .includes("fetch")
    ) {
      throw new Error(
        `Unable to connect to LUMEN API at ${API_BASE_URL}. Ensure the backend server is running.`
      );
    }

    throw error;
  }
}

/* ----------------------------- */
/* HEALTH                        */
/* ----------------------------- */

export function getHealth() {
  return request(
    "/health"
  );
}

/* ----------------------------- */
/* OVERVIEW                      */
/* ----------------------------- */

export function getOverview(
  rangeDays = "30d"
) {
  return request(
    `/overview?range_days=${encodeURIComponent(
      rangeDays
    )}`
  );
}

/* ----------------------------- */
/* TEAMS                         */
/* ----------------------------- */

export function getTeams() {
  return request(
    "/teams"
  );
}

export function getTeamDetail(
  teamId
) {
  return request(
    `/teams/${encodeURIComponent(
      teamId
    )}`
  );
}

export function getTeam(
  teamId = "atlas"
) {
  return getTeamDetail(
    teamId
  );
}

/* ----------------------------- */
/* SIGNALS                       */
/* ----------------------------- */

export function getSignals() {
  return request(
    "/signals"
  );
}

export function getSignalDetail(
  signalId
) {
  return request(
    `/signals/${encodeURIComponent(
      signalId
    )}`
  );
}

/* ----------------------------- */
/* CAUSAL                        */
/* ----------------------------- */

export function getCausalAnalysis(
  teamId = "atlas"
) {
  return request(
    `/causal?team_id=${encodeURIComponent(
      teamId
    )}`
  );
}

export function analyzeCausal(
  teamId = "atlas",
  controls = [
    "Workload",
    "Project pressure",
  ]
) {
  return request(
    "/causal/analyze",
    {
      method: "POST",

      body: JSON.stringify({
        team_id: teamId,
        treatment:
          "Meeting load",
        outcome:
          "Recovery",
        controls,
      }),
    }
  );
}

/* ----------------------------- */
/* WHAT IF                       */
/* ----------------------------- */

export function getWhatIf(
  teamId = "atlas"
) {
  return request(
    `/what-if?team_id=${encodeURIComponent(
      teamId
    )}`
  );
}

export function simulateWhatIf(
  payload = {}
) {
  const teamId =
    payload?.team_id ||
    "atlas";

  const proposedHours =
    Number(
      payload?.proposed_meeting_hours ??
        payload?.proposed_treatment ??
        14
    );

  return request(
    "/what-if/simulate",
    {
      method: "POST",

      body: JSON.stringify({
        team_id: teamId,
        proposed_treatment:
          proposedHours,
      }),
    }
  );
}

/* ----------------------------- */
/* EXPERIMENTS                   */
/* ----------------------------- */

export function getExperiments() {
  return request(
    "/experiments"
  );
}

export function getExperimentDetail(
  experimentId
) {
  return request(
    `/experiments/${encodeURIComponent(
      experimentId
    )}`
  );
}

export function createExperiment(
  payload
) {
  return request(
    "/experiments",
    {
      method: "POST",
      body: JSON.stringify(
        payload
      ),
    }
  );
}

export function updateExperiment(
  experimentId,
  payload
) {
  return request(
    `/experiments/${encodeURIComponent(
      experimentId
    )}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        payload
      ),
    }
  );
}

export function deleteExperiment(
  experimentId
) {
  return request(
    `/experiments/${encodeURIComponent(
      experimentId
    )}`,
    {
      method: "DELETE",
    }
  );
}

/* ----------------------------- */
/* PRIVACY                       */
/* ----------------------------- */

export function getPrivacy() {
  return request(
    "/privacy"
  );
}

/* ----------------------------- */
/* SETTINGS                      */
/* ----------------------------- */

export function getSettings() {
  return request(
    "/settings"
  );
}

export function updateSettings(
  payload
) {
  return request(
    "/settings",
    {
      method: "PATCH",
      body: JSON.stringify(
        payload
      ),
    }
  );
}

/* ----------------------------- */
/* REPORTS                       */
/* ----------------------------- */

export function getReportSummary() {
  return request(
    "/reports/summary"
  );
}

export function generateReport(
  payload = {}
) {
  return request(
    "/reports/generate",
    {
      method: "POST",
      body: JSON.stringify(
        payload
      ),
    }
  );
}

export function getExportJsonUrl() {
  return `${API_BASE_URL}/reports/export.json`;
}

export function getExportCsvUrl() {
  return `${API_BASE_URL}/reports/export.csv`;
}

/* ----------------------------- */
/* INTEGRATIONS                  */
/* ----------------------------- */

export function getIntegrations() {
  return request(
    "/integrations"
  );
}

export function disconnectIntegration(
  provider
) {
  return request(
    `/integrations/${encodeURIComponent(
      provider
    )}/disconnect`,
    {
      method: "POST",
    }
  );
}

export function syncIntegration(
  provider
) {
  return request(
    `/integrations/${encodeURIComponent(
      provider
    )}/sync`,
    {
      method: "POST",
    }
  );
}

/* ----------------------------- */
/* EXPORT BASE URL               */
/* ----------------------------- */

export {
  API_BASE_URL,
};