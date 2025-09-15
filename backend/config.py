from pydantic import BaseSettings, Field
from typing import List, Dict, Any

class Settings(BaseSettings):
    # --- Klucze API ---
    OPENAI_API_KEY: str = "Your_OpenAI_API_Key"
    VAPID_PRIVATE_KEY: str = "Your_VAPID_Private_Key"
    VAPID_PUBLIC_KEY: str = "Your_VAPID_Public_Key"
    VAPID_EMAIL: str = "mailto:your-email@example.com"

    # --- Ustawienia aplikacji ---
    CACHE_TTL_SECONDS: int = 300
    SCHEDULER_INTERVAL_MINUTES: int = 10

    # --- Źródła danych ---
    SOURCES: Dict[str, Dict[str, Any]] = Field(default={
        "rcb": {"url": "https://www.gov.pl/web/rcb/ostrzezenia-rcb-rss", "type": "rss", "location": "Polska"},
        "warszawa": {"url": "https://warszawa19115.pl/szukasz-informacji/porzadek-i-bezpieczenstwo/komunikaty-i-awarie", "type": "web_warszawa", "location": "Warszawa"},
        "krakow": {"url": "https://www.krakow.pl/informacje/20026,48,komunikat,bezpieczenstwo.html", "type": "rss", "location": "Kraków"},
        # "lublin": {"url": "https://lublin.eu/mieszkancy/bezpieczenstwo/komunikaty-i-ostrzezenia/", "type": "web_lublin", "location": "Lublin"},
        "bialystok": {"url": "https://www.bialystok.pl/pl/dla_mieszkancow/bezpieczenstwo/miejskie_centrum_zarzadzania_kryzysowego/komunikaty.html", "type": "web_bialystok", "location": "Białystok"}
    })

    # --- Słowa kluczowe do klasyfikacji ---
    WARNING_KEYWORDS: List[str] = [
        "ostrzeżenie hydrologiczne", "ostrzeżenie meteorologiczne", "alarm", 
        "ewakuacja", "zagrożenie życia", "niebezpieczeństwo", "pożar", 
        "wezbranie", "wichura", "grad"
    ]
    CAUTION_KEYWORDS: List[str] = [
        "utrudnienia", "uwaga", "intensywne opady", "burze", 
        "prognozuje się", "możliwe oblodzenie", "silny wiatr"
    ]
    ALL_CLEAR_KEYWORDS: List[str] = [
        "odwołanie", "odwołano", "zakończono", "przywrócono ruch"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
