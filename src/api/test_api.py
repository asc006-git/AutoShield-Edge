"""AutoShield Edge — Smoke Tests

Verifies that all critical API endpoints respond correctly.
Run with: python -m pytest src/api/test_api.py -v  (from project root)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"
    assert data["version"] == "2.0.0"
    assert "timestamp" in data


def test_stats_endpoint():
    resp = client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "ensemble_f1" in data
    assert "edge_latency_ms" in data
    assert "data_reduction" in data
    assert "can_rate" in data
    assert isinstance(data["ensemble_f1"], (int, float))
    assert isinstance(data["edge_latency_ms"], (int, float))


def test_telemetry_endpoint():
    resp = client.get("/api/telemetry")
    assert resp.status_code == 200
    data = resp.json()
    assert "can_rate" in data
    assert "cpu_load" in data
    assert "inference_latency" in data
    assert isinstance(data["inference_latency"], (int, float))


def test_performance_metrics_endpoint():
    resp = client.get("/api/performance/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "disclaimer" in data
    assert "models" in data
    assert "ocsvm" in data["models"]
    ocsvm = data["models"]["ocsvm"]
    assert ocsvm["source"] == "dynamic_from_loaded_model"
    assert isinstance(ocsvm["f1"], (int, float))


def test_detection_models_endpoint():
    resp = client.get("/api/detection/models")
    assert resp.status_code in (200, 503)  # 503 if no data loaded


def test_attack_type_validation():
    resp = client.post("/api/pipeline/run", json={"attack_type": "invalid"})
    assert resp.status_code == 400


def test_system_architecture_endpoint():
    resp = client.get("/api/system/architecture")
    assert resp.status_code == 200
    data = resp.json()
    assert "pipeline" in data
    assert len(data["pipeline"]) == 9


def test_cors_headers():
    resp = client.options(
        "/api/health",
        headers={"Origin": "http://localhost:3000"},
    )
    assert "access-control-allow-origin" in resp.headers


def test_detection_features_endpoint():
    resp = client.get("/api/detection/features")
    assert resp.status_code in (200, 503)
    if resp.status_code == 200:
        data = resp.json()
        assert "features" in data
        assert len(data["features"]) > 0
