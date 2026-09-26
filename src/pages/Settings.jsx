import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Globe2,
  LockKeyhole,
  Save,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { getSettings, updateSettings } from "../lib/api";

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    workspaceName: "LUMEN Workspace",
    timezone: "Asia/Kolkata",
    signalAlerts: true,
    weeklyReports: true,
    syntheticMode: true,
    teamAggregation: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setError("");
        const data = await getSettings();

        setSettings((current) => ({
          ...current,
          ...(data || {}),
        }));
      } catch (err) {
        setError(err.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const updated = await updateSettings(settings);

      setSettings((current) => ({
        ...current,
        ...(updated || {}),
      }));

      setSaved(true);
    } catch (err) {
      setError(err.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="settings-page">
        <div className="page-header">
          <div>
            <div className="eyebrow">WORKSPACE</div>
            <h1>Settings</h1>
            <p>Loading workspace configuration…</p>
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
          <div className="eyebrow">WORKSPACE</div>
          <h1>Settings</h1>
          <p>
            Configure workspace behavior, notifications, and the privacy
            boundary used by LUMEN.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {saved && (
        <div className="settings-saved">
          <Check size={16} />
          Settings saved successfully.
        </div>
      )}

      {error && (
        <div className="settings-error">
          {error}
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-main">
          <div className="overview-panel settings-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">GENERAL</span>
                <h2>Workspace configuration</h2>
              </div>

              <Globe2 size={18} />
            </div>

            <div className="settings-form">
              <label className="settings-field">
                <span>Workspace name</span>

                <input
                  value={settings.workspaceName}
                  onChange={(event) =>
                    updateSetting("workspaceName", event.target.value)
                  }
                />
              </label>

              <label className="settings-field">
                <span>Timezone</span>

                <select
                  value={settings.timezone}
                  onChange={(event) =>
                    updateSetting("timezone", event.target.value)
                  }
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                </select>
              </label>
            </div>
          </div>

          <div className="overview-panel settings-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">NOTIFICATIONS</span>
                <h2>Signal delivery</h2>
              </div>

              <Bell size={18} />
            </div>

            <div className="settings-options">
              <SettingToggle
                title="Signal alerts"
                description="Receive an alert when a meaningful team-level signal is detected."
                value={settings.signalAlerts}
                onChange={(value) => updateSetting("signalAlerts", value)}
              />

              <SettingToggle
                title="Weekly intelligence reports"
                description="Generate a weekly summary of team-level changes, hypotheses, and experiments."
                value={settings.weeklyReports}
                onChange={(value) => updateSetting("weeklyReports", value)}
              />
            </div>
          </div>

          <div className="overview-panel settings-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">DATA GOVERNANCE</span>
                <h2>Analytics boundary</h2>
              </div>

              <LockKeyhole size={18} />
            </div>

            <div className="settings-options">
              <SettingToggle
                title="Team-level aggregation"
                description="Keep analysis focused on aggregated workplace conditions rather than individual employee profiles."
                value={settings.teamAggregation}
                onChange={(value) => updateSetting("teamAggregation", value)}
              />

              <SettingToggle
                title="Synthetic demonstration mode"
                description="Keep the current demo environment isolated from real workplace communication sources."
                value={settings.syntheticMode}
                onChange={(value) => updateSetting("syntheticMode", value)}
              />
            </div>
          </div>
        </div>

        <aside className="settings-sidebar">
          <div className="overview-panel settings-summary">
            <div className="settings-summary-icon">
              <ShieldCheck size={21} />
            </div>

            <span className="panel-kicker">PRIVACY</span>
            <h2>Protected by design</h2>

            <p>
              LUMEN keeps the analytical layer focused on team-level
              intelligence.
            </p>

            <div className="settings-check">
              <Check size={14} />
              No raw messages
            </div>

            <div className="settings-check">
              <Check size={14} />
              No individual burnout scores
            </div>

            <div className="settings-check">
              <Check size={14} />
              No employee ranking
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SettingToggle({ title, description, value, onChange }) {
  return (
    <div className="settings-option">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`toggle ${value ? "is-on" : ""}`}
        onClick={() => onChange(!value)}
        aria-label={`Toggle ${title}`}
        aria-pressed={value}
      >
        <span />
      </button>
    </div>
  );
}


