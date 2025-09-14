import pytest
from backend.main import classify_severity, detect_all_clear
from backend.schema import SeverityLevel

# Testy dla funkcji classify_severity
@pytest.mark.parametrize("title, content, expected", [
    ("Ostrzeżenie meteorologiczne", "Silne burze i grad", SeverityLevel.WARNING),
    ("Pożar w centrum miasta", "Unikaj rejonu", SeverityLevel.WARNING),
    ("Utrudnienia w ruchu", "Korek na moście", SeverityLevel.CAUTION),
    ("Prognozuje się możliwe oblodzenie", "Zachowaj ostrożność", SeverityLevel.CAUTION),
    ("Dzień otwarty straży pożarnej", "Zapraszamy!", SeverityLevel.INFO),
    ("Piknik rodzinny w parku", "Wiele atrakcji", SeverityLevel.INFO),
])
def test_classify_severity(title, content, expected):
    """Testuje, czy funkcja poprawnie klasyfikuje poziom zagrożenia."""
    assert classify_severity(title, content) == expected

# Testy dla funkcji detect_all_clear
@pytest.mark.parametrize("title, content, expected", [
    ("Odwołanie alarmu", "Zagrożenie minęło", True),
    ("Przywrócono ruch na moście", "Koniec utrudnień", True),
    ("Ostrzeżenie o burzach", "Nadchodzi front", False),
    ("Nowy alert pogodowy", "Spodziewane opady", False),
])
def test_detect_all_clear(title, content, expected):
    """Testuje, czy funkcja poprawnie wykrywa komunikaty odwołujące."""
    assert detect_all_clear(title, content) == expected
