import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import datetime

# Importuj 'app' z głównego modułu backendu
from backend.main import app 

client = TestClient(app)

# Przykładowe dane do mockowania
mock_raw_alerts = [
    {
        "id": "test-warning-123",
        "source": "Mock-RCB",
        "title": "Ostrzeżenie o burzach",
        "content": "Nadchodzą silne burze z gradem.",
        "timestamp": datetime.datetime.now(),
        "location": "Polska"
    },
    {
        "id": "test-info-456",
        "source": "Mock-Krakow",
        "title": "Piknik rodzinny",
        "content": "Zapraszamy na piknik w parku.",
        "timestamp": datetime.datetime.now() - datetime.timedelta(hours=1),
        "location": "Kraków"
    }
]

@pytest.mark.asyncio
@patch('backend.main.fetch_all_alerts', return_value=mock_raw_alerts)
@patch('backend.main.simplify_text', return_value="Uważaj, idzie burza!")
@patch('backend.main.generate_tips', return_value=["- Zostań w domu.", "- Zamknij okna."])
async def test_get_alerts_success(mock_fetch, mock_simplify, mock_tips):
    """Testuje pomyślne pobranie i przetworzenie alertów."""
    response = client.get("/api/alerts?lang=pl")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 2
    
    warning_alert = data[0]
    assert warning_alert['severity'] == 'warning'
    assert warning_alert['simplified_content'] == "Uważaj, idzie burza!"
    assert warning_alert['tips'] == ["- Zostań w domu.", "- Zamknij okna."]
    
    info_alert = data[1]
    assert info_alert['severity'] == 'info'
    assert info_alert['simplified_content'] is None
    assert info_alert['tips'] is None

@pytest.mark.asyncio
@patch('backend.main.fetch_all_alerts', side_effect=Exception("Błąd sieci"))
async def test_get_alerts_fetch_error(mock_fetch):
    """Testuje obsługę błędu podczas pobierania danych."""
    response = client.get("/api/alerts")
    
    assert response.status_code == 500
    assert "Wystąpił błąd" in response.json()['detail']

@patch('backend.push_notifications.get_vapid_public_key', return_value="test_public_key")
def test_get_vapid_public_key(mock_get_key):
    """Testuje endpoint zwracający klucz VAPID."""
    response = client.get("/api/vapid_public_key")
    
    assert response.status_code == 200
    assert response.json() == {"public_key": "test_public_key"}

@patch('backend.push_notifications.add_subscription')
def test_subscribe(mock_add):
    """Testuje endpoint do subskrypcji powiadomień."""
    subscription_data = {"endpoint": "https://example.com", "keys": {"p256dh": "123", "auth": "456"}}
    response = client.post("/api/subscribe", json=subscription_data)
    
    assert response.status_code == 410
    
    mock_add.assert_not_called()
