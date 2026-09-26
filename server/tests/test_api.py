import unittest
from fastapi.testclient import TestClient
from server.main import app
from server.settings import load_settings, save_settings
from server.models import SettingsModel


class LumenApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        # Ensure default settings
        self.orig_settings = load_settings()
        save_settings(SettingsModel(
            workspace_name="LUMEN Test Workspace",
            timezone="Asia/Kolkata",
            minimum_team_size=5,
            auto_refresh_interval=10,
            causal_confidence_display=True,
            signal_alerts=True,
            weekly_reports=True,
            synthetic_demo_mode=True,
            team_aggregation=True,
        ))

    def tearDown(self):
        save_settings(self.orig_settings)

    def test_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "LUMEN API")

    def test_overview_ranges(self):
        for r in ["7d", "14d", "30d"]:
            res = self.client.get(f"/api/overview?range_days={r}")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("communication", data)
            self.assertIn("recovery", data)
            self.assertEqual(data["attention_team"], "Atlas")
            expected_len = 7 if r == "7d" else (14 if r == "14d" else 30)
            self.assertEqual(len(data["time_series"]), expected_len)

    def test_teams_and_detail(self):
        res = self.client.get("/api/teams")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["count"], 8)
        teams = {t["id"]: t for t in data["teams"]}
        self.assertIn("atlas", teams)
        self.assertEqual(teams["atlas"]["members"], 18)

        # Detail for Atlas
        res_atlas = self.client.get("/api/teams/atlas")
        self.assertEqual(res_atlas.status_code, 200)
        atlas_data = res_atlas.json()
        self.assertEqual(atlas_data["team"]["name"], "Atlas")
        self.assertGreater(len(atlas_data["time_series"]), 0)

        # 404 for unknown team
        res_unknown = self.client.get("/api/teams/unknown_team")
        self.assertEqual(res_unknown.status_code, 404)

    def test_privacy_threshold_suppression(self):
        # Vertex has 9 members. When threshold is 5, Vertex is NOT suppressed.
        res_v = self.client.get("/api/teams/vertex")
        self.assertEqual(res_v.status_code, 200)
        self.assertFalse(res_v.json()["team"]["is_suppressed"])

        # Update threshold to 10
        save_settings(SettingsModel(minimum_team_size=10))

        # Vertex (9 members) must now be suppressed server-side
        res_v2 = self.client.get("/api/teams/vertex")
        self.assertEqual(res_v2.status_code, 200)
        team_v2 = res_v2.json()["team"]
        self.assertTrue(team_v2["is_suppressed"])
        self.assertEqual(team_v2["signal"], "Metrics suppressed for privacy")
        self.assertEqual(team_v2["communication"], 0.0)

    def test_signals_and_detail(self):
        res = self.client.get("/api/signals")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["count"], 4)

        # Test single signal
        res_sig = self.client.get("/api/signals/SIG-104")
        self.assertEqual(res_sig.status_code, 200)
        sig = res_sig.json()
        self.assertEqual(sig["team"], "Atlas")
        self.assertEqual(sig["metric"], "Recovery")

        # 404 for nonexistent signal
        res_none = self.client.get("/api/signals/SIG-999")
        self.assertEqual(res_none.status_code, 404)

    def test_causal_analysis_and_simulation(self):
        res = self.client.get("/api/causal?team_id=atlas")
        self.assertEqual(res.status_code, 200)
        causal = res.json()
        self.assertEqual(causal["treatment"], "Meeting load")
        self.assertEqual(causal["outcome"], "Recovery")
        # Check that OLS estimate is negative (meetings harm recovery)
        self.assertLess(causal["estimated_effect"], 0.0)
        self.assertLess(causal["ci_lower"], causal["ci_upper"])
        self.assertGreater(causal["sample_size"], 100)

        # Test POST analyze with custom controls
        post_res = self.client.post("/api/causal/analyze", json={
            "team_id": "atlas",
            "treatment": "Meeting load",
            "outcome": "Recovery",
            "controls": ["Workload"],
        })
        self.assertEqual(post_res.status_code, 200)

    def test_what_if_simulation(self):
        # Default: 18.4h -> 14.0h should boost recovery by ~5.5 points (from 58 to ~63.5-64)
        res = self.client.post("/api/what-if/simulate", json={
            "team_id": "atlas",
            "proposed_treatment": 14.0,
        })
        self.assertEqual(res.status_code, 200)
        sim = res.json()
        self.assertEqual(sim["baseline_treatment"], 18.4)
        self.assertEqual(sim["scenario_treatment"], 14.0)
        self.assertEqual(sim["baseline_outcome"], 58.0)
        self.assertGreater(sim["estimated_outcome"], sim["baseline_outcome"])
        self.assertAlmostEqual(sim["estimated_outcome"], 63.5, delta=1.5)

    def test_experiments_crud(self):
        # 1. List
        res_list = self.client.get("/api/experiments")
        self.assertEqual(res_list.status_code, 200)
        init_count = res_list.json()["count"]

        # 2. Create
        payload = {
            "name": "Retrospective Cadence Test",
            "team": "Orbit",
            "hypothesis": "Bi-weekly retrospectives reduce calendar clutter.",
            "treatment": "Meeting frequency",
            "intervention": "Switch sprint retro to every 2 weeks.",
            "baseline": "43%",
            "target": "30%",
            "observation_window": "30 days",
            "primary_outcome": "Meetings",
            "notes": "Test creation",
        }
        res_create = self.client.post("/api/experiments", json=payload)
        self.assertEqual(res_create.status_code, 200)
        new_exp = res_create.json()
        exp_id = new_exp["id"]
        self.assertTrue(exp_id.startswith("EXP-"))

        # 3. Read
        res_get = self.client.get(f"/api/experiments/{exp_id}")
        self.assertEqual(res_get.status_code, 200)
        self.assertEqual(res_get.json()["name"], "Retrospective Cadence Test")

        # 4. Patch
        res_patch = self.client.patch(f"/api/experiments/{exp_id}", json={
            "status": "Running",
            "notes": "Updated note",
        })
        self.assertEqual(res_patch.status_code, 200)
        self.assertEqual(res_patch.json()["status"], "Running")

        # 5. Delete
        res_del = self.client.delete(f"/api/experiments/{exp_id}")
        self.assertEqual(res_del.status_code, 200)
        self.assertEqual(res_del.json()["status"], "deleted")

        # Verify deleted
        res_get_deleted = self.client.get(f"/api/experiments/{exp_id}")
        self.assertEqual(res_get_deleted.status_code, 404)

    def test_reports_and_exports(self):
        res_sum = self.client.get("/api/reports/summary")
        self.assertEqual(res_sum.status_code, 200)
        self.assertIn("teams_analyzed", res_sum.json())

        res_gen = self.client.post("/api/reports/generate")
        self.assertEqual(res_gen.status_code, 200)
        rep = res_gen.json()
        self.assertIn("causal_intelligence", rep)
        self.assertIn("executive_summary", rep)

        # JSON Export
        res_json = self.client.get("/api/reports/export/json")
        self.assertEqual(res_json.status_code, 200)
        self.assertEqual(res_json.headers["content-type"], "application/json")
        self.assertIn("attachment", res_json.headers["content-disposition"])

        # CSV Export
        res_csv = self.client.get("/api/reports/export/csv")
        self.assertEqual(res_csv.status_code, 200)
        self.assertEqual(res_csv.headers["content-type"], "text/csv; charset=utf-8")
        self.assertIn("Atlas", res_csv.text)


if __name__ == "__main__":
    unittest.main()
