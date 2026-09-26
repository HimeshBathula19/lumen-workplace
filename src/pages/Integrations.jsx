import { useEffect, useState } from "react";
import {
  Check,
  Cloud,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import {
  getIntegrations,
  disconnectIntegration,
  syncIntegration,
} from "../lib/api";

export default function Integrations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setLoading(true);
      const result = await getIntegrations();
      setData(result);
    } catch (error) {
      setMessage(error.message || "Unable to load integrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDisconnect(provider) {
    try {
      setBusy(provider);
      setMessage("");
      await disconnectIntegration(provider);
      await load();
      setMessage("Integration disconnected.");
    } catch (error) {
      setMessage(error.message || "Unable to disconnect integration.");
    } finally {
      setBusy("");
    }
  }

  async function handleSync(provider) {
    try {
      setBusy(provider);
      setMessage("");
      await syncIntegration(provider);
    } catch (error) {
      setMessage(error.message || "Integration is not connected yet.");
    } finally {
      setBusy("");
    }
  }

  const integrations = data?.integrations || {};

  if (loading) {
    return (
      <section className="settings-page">
        <div className="page-header">
          <div>
            <div className="eyebrow">SYSTEM</div>
            <h1>Integrations</h1>
            <p>Loading connected workplace sources…</p>
          </div>
        </div>

        <div className="overview-panel settings-panel">
          <Loader2 size={18} className="spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="settings-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">SYSTEM · DATA SOURCES</div>
          <h1>Integrations</h1>
          <p>
            Connect workplace communication systems while keeping LUMEN's
            analytical layer team-level and privacy-preserving.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="settings-saved">
          {message}
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-main">
          <IntegrationCard
            integration={integrations.slack}
            providerKey="slack"
            icon="S"
            busy={busy === "slack"}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
          />

          <IntegrationCard
            integration={integrations.microsoft_teams}
            providerKey="microsoft_teams"
            icon="T"
            busy={busy === "microsoft_teams"}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
          />
        </div>

        <aside className="settings-sidebar">
          <div className="overview-panel settings-summary">
            <div className="settings-summary-icon">
              <ShieldCheck size={21} />
            </div>

            <span className="panel-kicker">PRIVACY ARCHITECTURE</span>
            <h2>Aggregation comes first</h2>

            <p>
              LUMEN is designed to transform communication activity into
              team-level telemetry before it reaches causal analysis.
            </p>

            <div className="settings-check">
              <Check size={14} />
              Raw messages excluded from analytics
            </div>

            <div className="settings-check">
              <Check size={14} />
              No individual burnout scores
            </div>

            <div className="settings-check">
              <Check size={14} />
              Minimum team size enforced
            </div>

            <div className="settings-check">
              <Check size={14} />
              Causal analysis uses aggregated conditions
            </div>
          </div>

          <div className="overview-panel settings-summary">
            <div className="settings-summary-icon">
              <Cloud size={20} />
            </div>

            <span className="panel-kicker">PIPELINE</span>
            <h2>Source → Intelligence</h2>

            <p>
              Connected source → privacy aggregation → team telemetry →
              signals → causal analysis → What-If → experiments.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function IntegrationCard({
  integration,
  providerKey,
  icon,
  busy,
  onDisconnect,
  onSync,
}) {
  const connected = integration?.status === "connected";

  return (
    <div className="overview-panel settings-panel integration-card">
      <div className="integration-card-top">
        <div className="integration-brand">
          <div className="integration-logo">{icon}</div>

          <div>
            <span className="panel-kicker">WORKPLACE SOURCE</span>
            <h2>{integration?.provider}</h2>
          </div>
        </div>

        <div className={`integration-status ${connected ? "connected" : ""}`}>
          <span />
          {connected ? "Connected" : "Not connected"}
        </div>
      </div>

      <div className="integration-details">
        <div>
          <span>Connection</span>
          <strong>OAuth</strong>
        </div>

        <div>
          <span>Analytics</span>
          <strong>Team-level</strong>
        </div>

        <div>
          <span>Raw messages</span>
          <strong>Excluded</strong>
        </div>
      </div>

      <div className="integration-actions">
        {connected ? (
          <>
            <button
              type="button"
              className="secondary-action"
              onClick={() => onSync(providerKey)}
              disabled={busy}
            >
              {busy ? (
                <Loader2 size={15} className="spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              Sync
            </button>

            <button
              type="button"
              className="danger-action"
              onClick={() => onDisconnect(providerKey)}
              disabled={busy}
            >
              <Unplug size={15} />
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            className="primary-action"
            onClick={() =>
              alert(
                `${integration?.provider} OAuth connection will be enabled here.`
              )
            }
          >
            <Link2 size={15} />
            Connect
          </button>
        )}
      </div>

      <div className="integration-note">
        {integration?.message}
      </div>
    </div>
  );
}
