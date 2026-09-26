import { useEffect, useState } from "react";
import {
  Check,
  Cloud,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";
import {
  getIntegrations,
  disconnectIntegration,
  syncIntegration,
} from "../lib/api";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

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

      setMessage("Integration disconnected successfully.");
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

      const result = await syncIntegration(provider);

      setMessage(
        result?.message ||
          `${provider} synchronization request submitted.`
      );

      await load();
    } catch (error) {
      setMessage(error.message || "Unable to synchronize integration.");
    } finally {
      setBusy("");
    }
  }

  function handleConnect(provider) {
    setMessage("");

    const url = `${API_BASE}/integrations/${provider}/authorize`;

    window.location.href = url;
  }

  const integrations = data?.integrations || {};

  if (loading) {
    return (
      <section className="integrations-page">
        <div className="integration-loading">
          <Loader2 size={20} className="spin" />
          <span>Loading workplace sources…</span>
        </div>
      </section>
    );
  }

  return (
    <section className="integrations-page">
      <style>{`
        .integrations-page {
          max-width: 1320px;
          margin: 0 auto;
          padding: 32px 36px 64px;
          color: #171717;
        }

        .integrations-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 30px;
        }

        .integrations-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .14em;
          color: #8a8a8a;
          margin-bottom: 10px;
        }

        .integrations-header h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.05;
          letter-spacing: -.035em;
          font-weight: 700;
        }

        .integrations-header p {
          max-width: 650px;
          margin: 12px 0 0;
          color: #737373;
          font-size: 15px;
          line-height: 1.65;
        }

        .refresh-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 15px;
          border: 1px solid #dedede;
          border-radius: 10px;
          background: #fff;
          color: #333;
          font-weight: 600;
          cursor: pointer;
        }

        .refresh-button:hover {
          background: #f7f7f7;
        }

        .integration-message {
          margin-bottom: 22px;
          padding: 13px 16px;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          background: #fafafa;
          color: #555;
          font-size: 13px;
        }

        .integration-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .integration-card {
          position: relative;
          overflow: hidden;
          min-height: 310px;
          padding: 26px;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 8px 30px rgba(0,0,0,.035);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .integration-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 38px rgba(0,0,0,.06);
        }

        .integration-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .provider-identity {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .provider-logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          border: 1px solid #e6e6e6;
          background: #fafafa;
          font-size: 17px;
          font-weight: 800;
          color: #222;
        }

        .provider-kicker {
          display: block;
          margin-bottom: 5px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .12em;
          color: #999;
        }

        .provider-name {
          margin: 0;
          font-size: 21px;
          letter-spacing: -.025em;
        }

        .connection-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 999px;
          background: #f6f6f6;
          color: #777;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .connection-status.connected {
          background: #f0f8f2;
          color: #28753c;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #aaa;
        }

        .connected .status-dot {
          background: #3d9a55;
        }

        .integration-description {
          margin: 25px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.65;
        }

        .integration-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid #ededed;
          border-bottom: 1px solid #ededed;
        }

        .integration-metric {
          padding: 15px 10px;
          border-right: 1px solid #ededed;
        }

        .integration-metric:last-child {
          border-right: 0;
        }

        .integration-metric span {
          display: block;
          margin-bottom: 5px;
          color: #999;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .integration-metric strong {
          font-size: 13px;
          font-weight: 650;
        }

        .integration-actions {
          display: flex;
          gap: 9px;
          margin-top: 20px;
        }

        .integration-primary,
        .integration-secondary,
        .integration-danger {
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 15px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
        }

        .integration-primary {
          border: 1px solid #171717;
          background: #171717;
          color: white;
        }

        .integration-primary:hover {
          background: #2a2a2a;
        }

        .integration-secondary {
          border: 1px solid #dedede;
          background: white;
          color: #333;
        }

        .integration-danger {
          border: 1px solid #eadede;
          background: #fffafa;
          color: #9a4545;
        }

        .integration-primary:disabled,
        .integration-secondary:disabled,
        .integration-danger:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .integration-note {
          margin-top: 13px;
          color: #999;
          font-size: 11px;
          line-height: 1.5;
        }

        .architecture-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .architecture-card {
          padding: 24px;
          border: 1px solid #e5e5e5;
          border-radius: 18px;
          background: #fafafa;
        }

        .architecture-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          margin-bottom: 15px;
          border-radius: 11px;
          background: #fff;
          border: 1px solid #e6e6e6;
        }

        .architecture-card h3 {
          margin: 0 0 8px;
          font-size: 16px;
        }

        .architecture-card p {
          margin: 0;
          color: #707070;
          font-size: 13px;
          line-height: 1.65;
        }

        .architecture-list {
          margin-top: 16px;
          display: grid;
          gap: 9px;
        }

        .architecture-list div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #555;
          font-size: 12px;
        }

        .integration-loading {
          min-height: 400px;
          display: grid;
          place-items: center;
          gap: 10px;
          color: #777;
        }

        @media (max-width: 900px) {
          .integration-grid,
          .architecture-grid {
            grid-template-columns: 1fr;
          }

          .integrations-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .integrations-page {
            padding: 24px 18px 48px;
          }

          .integrations-header h1 {
            font-size: 31px;
          }

          .integration-card {
            padding: 20px;
          }

          .integration-card-header {
            flex-direction: column;
          }

          .integration-metrics {
            grid-template-columns: 1fr;
          }

          .integration-metric {
            border-right: 0;
            border-bottom: 1px solid #ededed;
          }

          .integration-metric:last-child {
            border-bottom: 0;
          }
        }
      `}</style>

      <header className="integrations-header">
        <div>
          <div className="integrations-eyebrow">SYSTEM · DATA SOURCES</div>

          <h1>Integrations</h1>

          <p>
            Connect workplace systems to LUMEN while preserving the
            team-level privacy boundary that powers its analytical layer.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </header>

      {message && (
        <div className="integration-message">
          {message}
        </div>
      )}

      <div className="integration-grid">
        <IntegrationCard
          integration={integrations.slack}
          providerKey="slack"
          icon="S"
          description="Bring permitted Slack workspace activity into LUMEN's privacy-preserving team telemetry pipeline."
          busy={busy === "slack"}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onSync={handleSync}
        />

        <IntegrationCard
          integration={integrations.microsoft_teams}
          providerKey="microsoft_teams"
          icon="T"
          description="Connect Microsoft Teams so organizational communication patterns can be transformed into aggregated team-level signals."
          busy={busy === "microsoft_teams"}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onSync={handleSync}
        />
      </div>

      <div className="architecture-grid">
        <div className="architecture-card">
          <div className="architecture-icon">
            <ShieldCheck size={19} />
          </div>

          <h3>Privacy boundary</h3>

          <p>
            LUMEN is designed to analyze workplace conditions rather than
            individual employees.
          </p>

          <div className="architecture-list">
            <div>
              <Check size={14} />
              Raw messages excluded from analytics
            </div>

            <div>
              <Check size={14} />
              No individual burnout scores
            </div>

            <div>
              <Check size={14} />
              No employee ranking
            </div>

            <div>
              <Check size={14} />
              Team aggregation enforced
            </div>
          </div>
        </div>

        <div className="architecture-card">
          <div className="architecture-icon">
            <Cloud size={19} />
          </div>

          <h3>Data transformation</h3>

          <p>
            Connected source data flows through a privacy boundary before
            becoming LUMEN intelligence.
          </p>

          <div className="architecture-list">
            <div>
              <LockKeyhole size={14} />
              Source
            </div>

            <div>
              <ArrowUpRight size={14} />
              Privacy aggregation
            </div>

            <div>
              <ArrowUpRight size={14} />
              Team telemetry
            </div>

            <div>
              <ArrowUpRight size={14} />
              Signals → Causal Lab → What-If
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationCard({
  integration,
  providerKey,
  icon,
  description,
  busy,
  onConnect,
  onDisconnect,
  onSync,
}) {
  const connected = integration?.status === "connected";

  return (
    <article className="integration-card">
      <div className="integration-card-header">
        <div className="provider-identity">
          <div className="provider-logo">{icon}</div>

          <div>
            <span className="provider-kicker">WORKPLACE SOURCE</span>
            <h2 className="provider-name">
              {integration?.provider || providerKey}
            </h2>
          </div>
        </div>

        <div
          className={`connection-status ${
            connected ? "connected" : ""
          }`}
        >
          <span className="status-dot" />
          {connected ? "Connected" : "Not connected"}
        </div>
      </div>

      <p className="integration-description">
        {description}
      </p>

      <div className="integration-metrics">
        <div className="integration-metric">
          <span>Connection</span>
          <strong>OAuth 2.0</strong>
        </div>

        <div className="integration-metric">
          <span>Analytics</span>
          <strong>Team-level</strong>
        </div>

        <div className="integration-metric">
          <span>Raw content</span>
          <strong>Excluded</strong>
        </div>
      </div>

      <div className="integration-actions">
        {!connected ? (
          <button
            type="button"
            className="integration-primary"
            onClick={() => onConnect(providerKey)}
            disabled={busy}
          >
            {busy ? (
              <Loader2 size={15} className="spin" />
            ) : (
              <Link2 size={15} />
            )}
            Connect
          </button>
        ) : (
          <>
            <button
              type="button"
              className="integration-secondary"
              onClick={() => onSync(providerKey)}
              disabled={busy}
            >
              {busy ? (
                <Loader2 size={15} className="spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              Sync now
            </button>

            <button
              type="button"
              className="integration-danger"
              onClick={() => onDisconnect(providerKey)}
              disabled={busy}
            >
              <Unplug size={15} />
              Disconnect
            </button>
          </>
        )}
      </div>

      <div className="integration-note">
        {connected
          ? `Workspace: ${
              integration?.workspace || "Connected workspace"
            }`
          : integration?.message ||
            "OAuth connection required before telemetry can be synchronized."}
      </div>
    </article>
  );
}
