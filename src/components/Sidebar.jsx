import React from "react";
import {
  Activity,
  Beaker,
  ChartNoAxesCombined,
  CircleHelp,
  FlaskConical,
  Gauge,
  LockKeyhole,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLumen } from "../context/LumenContext";

const primaryNavigation = [
  { to: "/", label: "Overview", icon: Gauge, end: true },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/signals", label: "Signals", icon: Activity, badgeKey: "signals" },
];

const intelligenceNavigation = [
  { to: "/causal-lab", label: "Causal Lab", icon: ChartNoAxesCombined },
  { to: "/what-if", label: "What-If", icon: FlaskConical },
  { to: "/experiments", label: "Experiments", icon: Beaker, badgeKey: "experiments" },
];

const secondaryNavigation = [
  { to: "/privacy", label: "Privacy", icon: LockKeyhole },
  { to: "/reports", label: "Reports", icon: Sparkles },
];

export default function Sidebar() {
  const { experiments, settings } = useLumen();

  const runningCount = experiments?.filter((e) => e.status === "Running").length || 1;

  return (
    <aside className="sidebar" aria-label="Main sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">L</div>
        <div className="brand-copy">
          <strong>LUMEN</strong>
          <span>Causal Intelligence</span>
        </div>
      </div>

      <div className="sidebar-workspace">
        <span className="sidebar-workspace-label">WORKSPACE</span>
        <nav className="sidebar-nav">
          {primaryNavigation.map(({ to, label, icon: Icon, end, badgeKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.7} />
              <span>{label}</span>
              {badgeKey === "signals" && <span className="sidebar-badge">4</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">INTELLIGENCE</span>
        <nav className="sidebar-nav">
          {intelligenceNavigation.map(({ to, label, icon: Icon, badgeKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.7} />
              <span>{label}</span>
              {badgeKey === "experiments" && runningCount > 0 && (
                <span className="sidebar-badge running">{runningCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">INSIGHTS</span>
        <nav className="sidebar-nav">
          {secondaryNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.7} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer-links">
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
        >
          <Settings size={16} strokeWidth={1.7} />
          <span>Settings</span>
        </NavLink>

        <NavLink
          to="/help"
          className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
        >
          <CircleHelp size={16} strokeWidth={1.7} />
          <span>Help</span>
        </NavLink>
      </div>

      <NavLink to="/settings" className="sidebar-user" title="Open workspace profile">
        <div className="sidebar-user-avatar">H</div>
        <div className="sidebar-user-copy">
          <strong>Himesh</strong>
          <span>Administrator</span>
        </div>
        <span className="sidebar-user-status" />
      </NavLink>
    </aside>
  );
}