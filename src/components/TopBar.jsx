import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  Search,
  ShieldCheck,
  User,
  RotateCcw,
  Settings,
  CircleHelp,
} from "lucide-react";
import { useLumen } from "../context/LumenContext";

const sectionNames = {
  "/": { section: "Workspace", page: "Overview" },
  "/teams": { section: "Workspace", page: "Teams" },
  "/signals": { section: "Workspace", page: "Signals" },
  "/causal-lab": { section: "Intelligence", page: "Causal Lab" },
  "/what-if": { section: "Intelligence", page: "What-If" },
  "/experiments": { section: "Intelligence", page: "Experiments" },
  "/privacy": { section: "Insights", page: "Privacy" },
  "/reports": { section: "Insights", page: "Reports" },
  "/settings": { section: "System", page: "Settings" },
  "/help": { section: "System", page: "Help" },
};

function openCommandPalette() {
  window.dispatchEvent(new Event("lumen:open-command-palette"));
}

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTeam, notifications, markAllNotificationsRead, apiStatus } = useLumen();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const meta = sectionNames[location.pathname] || { section: "Workspace", page: "Overview" };
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleOutsideClick(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleReplayIntro = () => {
    setProfileOpen(false);
    window.dispatchEvent(new Event("lumen:replay-intro"));
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb">
          <span className="breadcrumb-muted">{meta.section}</span>
          <span className="breadcrumb-separator">/</span>
          <strong>{meta.page}</strong>
          {(location.pathname === "/causal-lab" || location.pathname === "/what-if") && selectedTeam && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-tag">{selectedTeam.toUpperCase()}</span>
            </>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Global Search Button */}
        <button
          type="button"
          className="topbar-search"
          onClick={openCommandPalette}
          aria-label="Search LUMEN"
        >
          <Search size={15} />
          <span>Search LUMEN</span>
          <kbd>Ctrl K</kbd>
        </button>

        {/* Notifications Popover */}
        <div className="topbar-popover-anchor" ref={notificationsRef}>
          <button
            type="button"
            className="topbar-icon-button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setProfileOpen(false);
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>

          {notificationsOpen && (
            <div className="topbar-popover notification-popover">
              <div className="popover-header">
                <div>
                  <span>ACTIVITY</span>
                  <strong>Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}</strong>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="popover-mark-read"
                    onClick={markAllNotificationsRead}
                  >
                    <Check size={13} />
                    Mark read
                  </button>
                )}
              </div>

              <div className="popover-items-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notification-item ${n.unread ? "is-unread" : ""}`}>
                    <div className="notification-item-icon">
                      <Bell size={14} />
                    </div>
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="popover-footer">
                All activity is scoped to the LUMEN workspace.
              </div>
            </div>
          )}
        </div>

        {/* Command shortcut button */}
        <button
          type="button"
          className="topbar-command"
          aria-label="Open command palette"
          onClick={openCommandPalette}
        >
          <Command size={15} />
        </button>

        {/* Profile Popover */}
        <div className="topbar-popover-anchor" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile"
            aria-label="Open account menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((current) => !current);
              setNotificationsOpen(false);
            }}
          >
            <span className="topbar-avatar">H</span>
            <span className="topbar-profile-text">
              <strong>Himesh</strong>
              <small>Admin</small>
            </span>
            <ChevronDown size={14} />
          </button>

          {profileOpen && (
            <div className="topbar-popover profile-popover">
              <div className="profile-popover-user">
                <div className="profile-large-avatar">H</div>
                <div>
                  <strong>Himesh</strong>
                  <span>Administrator</span>
                </div>
              </div>

              <div className="popover-divider" />

              <button
                type="button"
                className="popover-action"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings size={15} />
                Workspace Settings
              </button>

              <button
                type="button"
                className="popover-action"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/help");
                }}
              >
                <CircleHelp size={15} />
                Documentation & Help
              </button>

              <button
                type="button"
                className="popover-action"
                onClick={handleReplayIntro}
              >
                <RotateCcw size={15} />
                Replay Product Intro
              </button>

              <button
                type="button"
                className="popover-action"
                onClick={() => {
                  setProfileOpen(false);
                  openCommandPalette();
                }}
              >
                <Command size={15} />
                Command Palette
              </button>

              <div className="popover-divider" />

              <div className="profile-workspace-state">
                <span className={`status-dot ${apiStatus === "live" ? "is-live" : "is-offline"}`} />
                <div>
                  <strong>{apiStatus === "live" ? "API Online" : "API Offline"}</strong>
                  <small>{apiStatus === "live" ? "Backend connected" : "Check server status"}</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}