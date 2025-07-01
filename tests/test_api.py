import json
from fastapi.testclient import TestClient  # type: ignore

from main import app

client = TestClient(app)


def test_run_endpoint_returns_trace():
    code = "for i in range(3):\n    x = i * 2\nprint(x)"
    response = client.post("/run", json={"code": code})
    assert response.status_code == 200
    payload = response.json()
    assert "trace" in payload
    # ensure we have multiple trace steps
    assert len(payload["trace"]) >= 2
    # last recorded locals should include 'x'
    last_locals = payload["trace"][-1]["locals"]
    assert "x" in last_locals
    assert last_locals["x"]["preview"] == "4"


def test_complexity_endpoint():
    code_linear = "for i in range(n):\n    pass"
    response = client.post("/complexity", json={"code": code_linear})
    assert response.status_code == 200
    data = response.json()
    assert data["big_o"].startswith("O(N)")
    assert isinstance(data["suggestions"], list)