import json
import os
from server.models import SettingsModel

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "data", "settings.json")

DEFAULT_SETTINGS = {
    "workspace_name": "LUMEN Workspace",
    "timezone": "Asia/Kolkata",
    "minimum_team_size": 5,
    "auto_refresh_interval": 10,
    "causal_confidence_display": True,
    "signal_alerts": True,
    "weekly_reports": True,
    "synthetic_demo_mode": True,
    "team_aggregation": True,
}


def load_settings() -> SettingsModel:
    if not os.path.exists(SETTINGS_FILE):
        save_settings(SettingsModel(**DEFAULT_SETTINGS))
        return SettingsModel(**DEFAULT_SETTINGS)

    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return SettingsModel(**data)
    except Exception:
        return SettingsModel(**DEFAULT_SETTINGS)


def save_settings(settings: SettingsModel) -> SettingsModel:
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings.model_dump(), f, indent=2)
    return settings
