from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from api.vapid import app as vapid_app

client = TestClient(app)

def test_ai_config_never_exposes_secret(monkeypatch):
    secret = "sk-test-regression-not-a-real-key"
    monkeypatch.setenv("OPENAI_API_KEY", secret)
    response = client.get("/api/ai-config")
    assert response.status_code == 200
    assert secret not in response.text
    assert "key" not in response.json()["providers"]["openai"]

def test_public_broadcast_is_blocked():
    with patch("backend.push_notifications.send_notification_to_all") as send:
        response = client.post("/api/push/test", json={"title": "untrusted"})
    assert response.status_code == 403
    send.assert_not_called()

def test_legacy_subscription_rejected_in_both_entrypoints():
    for target in [client, TestClient(vapid_app)]:
        with patch("backend.push_notifications.add_subscription") as save:
            response = target.post("/api/subscribe", json={"endpoint": "http://127.0.0.1/private"})
        assert response.status_code == 410
        save.assert_not_called()

def test_untrusted_cors_origin_is_not_granted_access():
    response = client.get("/api/ai-config", headers={"Origin": "https://untrusted.example"})
    assert "access-control-allow-origin" not in response.headers
    assert "access-control-allow-credentials" not in response.headers

def test_consent_payload_is_not_logged():
    with patch("backend.main.logging.info") as log:
        response = client.post("/api/audit/parental-consent", json={"private": "do-not-log"})
    assert response.status_code == 201
    assert "do-not-log" not in str(log.call_args_list)
