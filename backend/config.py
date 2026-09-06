from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Dict, Any, Optional
import logging
from .poland_locations import get_all_poland_sources, get_relevant_sources_for_location

class Settings(BaseSettings):
    # --- Klucze API ---
    OPENAI_API_KEY: str = "Your_OpenAI_API_Key"
    VAPID_PRIVATE_KEY: str = "Your_VAPID_Private_Key"
    VAPID_PUBLIC_KEY: str = "Your_VAPID_Public_Key"
    VAPID_EMAIL: str = "mailto:your-email@example.com"

    # --- Ustawienia aplikacji ---
    CACHE_TTL_SECONDS: int = 300
    SCHEDULER_INTERVAL_MINUTES: int = 10

    # --- Dynamiczne źródła danych ---
    # Zostanie wypełnione przez get_sources_for_location()
    SOURCES: Dict[str, Dict[str, Any]] = Field(default_factory=dict)

    # --- Fallback źródła (stare, dla kompatybilności) ---
    FALLBACK_SOURCES: Dict[str, Dict[str, Any]] = Field(default={
        "rcb_fallback": {"url": "https://www.gov.pl/web/rcb/ostrzezenia-rcb-rss", "type": "rss", "location": "Polska"},
        "warszawa_fallback": {"url": "https://warszawa19115.pl/szukasz-informacji/porzadek-i-bezpieczenstwo/komunikaty-i-awarie", "type": "web_warszawa", "location": "Warszawa"},
        "krakow_fallback": {"url": "https://www.krakow.pl/informacje/20026,48,komunikat,bezpieczenstwo.html", "type": "rss", "location": "Kraków"},
        "bialystok_fallback": {"url": "https://www.bialystok.pl/pl/dla_mieszkancow/bezpieczenstwo/miejskie_centrum_zarzadzania_kryzysowego/komunikaty.html", "type": "web_bialystok", "location": "Białystok"}
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

    def get_sources_for_location(self, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Dict[str, Any]]:
        """
        Dynamically get alert sources based on user location
        If no location provided, returns all Poland sources
        """
        try:
            if lat is not None and lon is not None:
                # Get sources relevant to specific location
                sources = get_relevant_sources_for_location(lat, lon)
                if sources:
                    return sources
            
            # Fallback: get all Poland sources
            return get_all_poland_sources()
            
        except Exception as e:
            # Ultimate fallback: use hardcoded sources
            logging.error(f"Error getting dynamic sources: {e}")
            return self.FALLBACK_SOURCES
    
    def update_sources_for_location(self, lat: Optional[float] = None, lon: Optional[float] = None):
        """Update SOURCES with location-specific sources"""
        self.SOURCES = self.get_sources_for_location(lat, lon)
        
    def get_current_sources(self) -> Dict[str, Dict[str, Any]]:
        """Get currently configured sources (with fallback)"""
        return self.SOURCES if self.SOURCES else self.FALLBACK_SOURCES

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

# Initialize settings
settings = Settings()

# Default: load all Poland sources
settings.update_sources_for_location()
