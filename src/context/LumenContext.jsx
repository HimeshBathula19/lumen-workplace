import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getHealth, getSettings, updateSettings as apiUpdateSettings, getExperiments } from "../lib/api";

const LumenContext = createContext(null);

export function LumenProvider({ children }) {
  const [selectedTeam, setSelectedTeam] = useState("atlas");
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null); // null | "team" | "signal"

  const [settings, setSettings] = useState({
    workspace_name: "LUMEN Workspace",
    timezone: "Asia/Kolkata",
    minimum_team_size: 5,
    auto_refresh_interval: 10,
    causal_confidence_display: true,
    signal_alerts: true,
    weekly_reports: true,
    synthetic_demo_mode: true,
    team_aggregation: true,
  });

  const [experiments, setExperiments] = useState([]);
  const [apiStatus, setApiStatus] = useState("connecting");
  const [prefilledExperiment, setPrefilledExperiment] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Atlas recovery disruption",
      message: "Recovery dropped -14% following synchronous meeting expansion.",
      time: "12 min ago",
      type: "signal",
      unread: true,
    },
    {
      id: "notif-2",
      title: "EXP-001 progress update",
      message: "Meeting load reduction trial is 68% complete.",
      time: "2 hours ago",
      type: "experiment",
      unread: true,
    },
    {
      id: "notif-3",
      title: "Privacy boundary active",
      message: "Team-level aggregation enforced; small groups (< 5 members) suppressed.",
      time: "Today",
      type: "privacy",
      unread: false,
    },
  ]);

  const addToast = useCallback((title, message = "", type = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check health and load initial settings
  const refreshGlobalState = useCallback(async () => {
    try {
      await getHealth();
      setApiStatus("live");

      const [loadedSettings, loadedExperiments] = await Promise.all([
        getSettings().catch(() => null),
        getExperiments().catch(() => ({ experiments: [] })),
      ]);

      if (loadedSettings) {
        setSettings(loadedSettings);
      }
      if (loadedExperiments?.experiments) {
        setExperiments(loadedExperiments.experiments);
      }
    } catch (err) {
      console.warn("Backend connectivity issue:", err);
      setApiStatus("offline");
    }
  }, []);

  useEffect(() => {
    refreshGlobalState();
    const interval = setInterval(refreshGlobalState, 15000);
    return () => clearInterval(interval);
  }, [refreshGlobalState]);

  const handleUpdateSettings = async (newSettings) => {
    try {
      const saved = await apiUpdateSettings(newSettings);
      setSettings(saved);
      addToast("Settings Saved", "Workspace parameters updated successfully.", "success");

      // Add a notification if privacy threshold changed
      if (newSettings.minimum_team_size !== settings.minimum_team_size) {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: "Privacy threshold updated",
            message: `Minimum team size changed to ${newSettings.minimum_team_size} members.`,
            time: "Just now",
            type: "privacy",
            unread: true,
          },
          ...prev,
        ]);
      }
      return saved;
    } catch (err) {
      addToast("Failed to Save Settings", err.message, "danger");
      throw err;
    }
  };

  const openTeam = (teamId) => {
    setSelectedTeam(teamId.toLowerCase());
    setActiveDrawer("team");
  };

  const openSignal = (signalObj) => {
    setSelectedSignal(signalObj);
    setActiveDrawer("signal");
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <LumenContext.Provider
      value={{
        selectedTeam,
        setSelectedTeam,
        selectedSignal,
        setSelectedSignal,
        activeDrawer,
        openTeam,
        openSignal,
        closeDrawer,
        settings,
        updateSettings: handleUpdateSettings,
        experiments,
        reloadExperiments: refreshGlobalState,
        notifications,
        markAllNotificationsRead,
        toasts,
        addToast,
        removeToast,
        apiStatus,
        prefilledExperiment,
        setPrefilledExperiment,
      }}
    >
      {children}
    </LumenContext.Provider>
  );
}

export function useLumen() {
  const ctx = useContext(LumenContext);
  if (!ctx) {
    throw new Error("useLumen must be used within a LumenProvider");
  }
  return ctx;
}
