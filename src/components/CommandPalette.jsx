import React, { useEffect, useMemo, useState } from "react";
import { Command, Search, ArrowRight, X, Users, Activity, Sparkles, Beaker, RotateCcw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLumen } from "../context/LumenContext";

const baseCommands = [
  {
    label: "Go to Overview",
    description: "Workspace command center and time series",
    shortcut: "G O",
    path: "/",
    category: "Navigation",
  },
  {
    label: "Go to Teams",
    description: "Team-level directory and condition metrics",
    shortcut: "G T",
    path: "/teams",
    category: "Navigation",
  },
  {
    label: "Go to Signals",
    description: "Observed team patterns and anomalies",
    shortcut: "G S",
    path: "/signals",
    category: "Navigation",
  },
  {
    label: "Open Causal Lab",
    description: "Scientific DAG and OLS regression adjustment",
    shortcut: "G C",
    path: "/causal-lab",
    category: "Intelligence",
  },
  {
    label: "Open What-If",
    description: "Counterfactual simulation engine",
    shortcut: "G W",
    path: "/what-if",
    category: "Intelligence",
  },
  {
    label: "Open Experiments",
    description: "Manage controlled team interventions",
    shortcut: "G E",
    path: "/experiments",
    category: "Intelligence",
  },
  {
    label: "Open Privacy",
    description: "Privacy boundary and threshold rules",
    shortcut: "G P",
    path: "/privacy",
    category: "Governance",
  },
  {
    label: "Open Reports",
    description: "Generate decision briefs & export JSON/CSV",
    shortcut: "G R",
    path: "/reports",
    category: "Governance",
  },
  {
    label: "Open Settings",
    description: "Workspace & privacy threshold configuration",
    shortcut: "G ,",
    path: "/settings",
    category: "System",
  },
  {
    label: "Open Help",
    description: "Documentation, causal primer, and FAQ",
    shortcut: "G H",
    path: "/help",
    category: "System",
  },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedTeam, openTeam } = useLumen();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const teamCommands = useMemo(
    () => [
      {
        label: "Team: Atlas",
        description: "Focus analysis on Atlas (18 members, Product Eng)",
        shortcut: "Atlas",
        action: () => {
          setSelectedTeam("atlas");
          openTeam("atlas");
        },
        category: "Teams",
      },
      {
        label: "Team: Northstar",
        description: "Focus analysis on Northstar (14 members, Data & Intel)",
        shortcut: "North",
        action: () => {
          setSelectedTeam("northstar");
          openTeam("northstar");
        },
        category: "Teams",
      },
      {
        label: "Team: Vector",
        description: "Focus analysis on Vector (22 members, Platform)",
        shortcut: "Vector",
        action: () => {
          setSelectedTeam("vector");
          openTeam("vector");
        },
        category: "Teams",
      },
      {
        label: "Action: Replay Product Intro",
        description: "Trigger the continuous 9s LUMEN transformation sequence",
        shortcut: "Intro",
        action: () => {
          window.dispatchEvent(new Event("lumen:replay-intro"));
        },
        category: "Actions",
      },
    ],
    [setSelectedTeam, openTeam]
  );

  const allCommands = useMemo(() => [...baseCommands, ...teamCommands], [teamCommands]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allCommands;

    return allCommands.filter((command) => {
      return (
        command.label.toLowerCase().includes(normalized) ||
        command.description.toLowerCase().includes(normalized) ||
        command.shortcut.toLowerCase().includes(normalized) ||
        command.category.toLowerCase().includes(normalized)
      );
    });
  }, [query, allCommands]);

  useEffect(() => {
    function openPalette() {
      setOpen(true);
    }

    function handleKeyboard(event) {
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("lumen:open-command-palette", openPalette);
    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("lumen:open-command-palette", openPalette);
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedIndex(0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands, selectedIndex]);

  useEffect(() => {
    if (!open) return;

    function handleNavigationKeys(event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((cur) =>
          filteredCommands.length === 0 ? 0 : (cur + 1) % filteredCommands.length
        );
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((cur) =>
          filteredCommands.length === 0
            ? 0
            : (cur - 1 + filteredCommands.length) % filteredCommands.length
        );
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (!cmd) return;
        executeCommand(cmd);
      }
    }

    window.addEventListener("keydown", handleNavigationKeys);
    return () => window.removeEventListener("keydown", handleNavigationKeys);
  }, [open, filteredCommands, selectedIndex]);

  const executeCommand = (cmd) => {
    if (cmd.action) {
      cmd.action();
    } else if (cmd.path) {
      navigate(cmd.path);
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="command-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        className="command-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="LUMEN command palette"
      >
        <div className="command-search">
          <Search size={18} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search workspace teams..."
            aria-label="Search LUMEN"
          />
          <button
            type="button"
            className="command-close"
            onClick={() => setOpen(false)}
            aria-label="Close command palette"
          >
            <X size={16} />
          </button>
        </div>

        <div className="command-results">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => {
              const isSelected = index === selectedIndex;
              const isCurrent = location.pathname === command.path;

              return (
                <button
                  type="button"
                  key={command.label}
                  className={`command-item ${isSelected ? "is-selected" : ""}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => executeCommand(command)}
                >
                  <span className="command-item-icon">
                    <Command size={15} />
                  </span>

                  <span className="command-item-copy">
                    <strong>{command.label}</strong>
                    <small>{command.description}</small>
                  </span>

                  <span className="command-item-meta">
                    {isCurrent ? (
                      <span className="command-current">Current</span>
                    ) : (
                      <>
                        <kbd>{command.shortcut}</kbd>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="command-empty">No LUMEN commands match “{query}”</div>
          )}
        </div>

        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Navigate
          </span>
          <span>
            <kbd>Enter</kbd> Select
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}