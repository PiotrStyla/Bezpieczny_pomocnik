import feedparser
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import datetime
import hashlib
import logging
import re
from urllib.parse import urljoin

from .config import settings

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def _generate_id(title: str, published_date: str) -> str:
    return hashlib.sha256(f"{title}{published_date}".encode()).hexdigest()

def _parse_rss(url: str, location: str) -> List[Dict[str, Any]]:
    logging.info(f"Pobieranie danych RSS z: {url}")
    alerts = []
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            published_time = entry.get("published_parsed")
            dt_object = datetime.datetime(*published_time[:6]) if published_time else datetime.datetime.now()
            alerts.append({"id": _generate_id(entry.title, entry.get("published", "")), "source": url, "title": entry.title, "content": entry.summary, "timestamp": dt_object, "location": location})
    except Exception as e:
        logging.error(f"Błąd podczas parsowania RSS z {url}: {e}")
    logging.info(f"Znaleziono {len(alerts)} alertów RSS z {location}.")
    return alerts

def _parse_web_warszawa(url: str, location: str) -> List[Dict[str, Any]]:
    logging.info(f"Pobieranie danych web z: {url}")
    alerts = []
    try:
        response = requests.get(url, timeout=10, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = soup.find_all('div', class_='article-item')
        for article in articles:
            title_tag = article.find('h3')
            content_tag = article.find('p')
            if title_tag and content_tag:
                title = title_tag.get_text(strip=True)
                content = content_tag.get_text(strip=True)
                now = datetime.datetime.now()
                alerts.append({"id": _generate_id(title, now.isoformat()), "source": url, "title": title, "content": content, "timestamp": now, "location": location})
    except requests.RequestException as e:
        logging.error(f"Błąd sieciowy podczas pobierania danych z {url}: {e}")
    except Exception as e:
        logging.error(f"Nieoczekiwany błąd podczas parsowania strony Warszawy: {e}")
    logging.info(f"Znaleziono {len(alerts)} alertów na stronie Warszawy.")
    return alerts

def _parse_web_lublin(url: str, location: str) -> List[Dict[str, Any]]:
    logging.info(f"Pobieranie danych web z: {url}")
    alerts = []
    try:
        response = requests.get(url, timeout=10, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        content_div = soup.find('div', class_='tresc-artykulu')
        if not content_div: return []
        for link in content_div.find_all('a', href=True):
            title = link.get_text(strip=True)
            article_url = urljoin(url, link['href'])
            date_match = re.search(r'(\d{2}\.\d{2}\.\d{4})', title)
            dt_object = datetime.datetime.strptime(date_match.group(1), '%d.%m.%Y') if date_match else datetime.datetime.now()
            try:
                article_res = requests.get(article_url, timeout=10, headers=HEADERS)
                article_res.raise_for_status()
                article_soup = BeautifulSoup(article_res.content, 'html.parser')
                article_content_div = article_soup.find('div', class_='tresc-artykulu')
                content = article_content_div.get_text(strip=True) if article_content_div else "Brak treści."
                alerts.append({"id": _generate_id(title, dt_object.isoformat()), "source": url, "title": title, "content": content, "timestamp": dt_object, "location": location})
            except requests.RequestException as e:
                logging.warning(f"Nie udało się pobrać artykułu {article_url}: {e}")
    except requests.RequestException as e:
        logging.error(f"Błąd sieciowy podczas pobierania danych z {url}: {e}")
    except Exception as e:
        logging.error(f"Nieoczekiwany błąd podczas parsowania strony Lublina: {e}")
    logging.info(f"Znaleziono {len(alerts)} alertów na stronie Lublina.")
    return alerts

def _parse_web_bialystok(url: str, location: str) -> List[Dict[str, Any]]:
    logging.info(f"Pobieranie danych web z: {url}")
    alerts = []
    try:
        response = requests.get(url, timeout=10, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        for item in soup.find_all('div', class_='news-item'):
            link_tag = item.find('a', class_='title')
            if not link_tag: continue
            article_url = urljoin(url, link_tag['href'])
            try:
                article_res = requests.get(article_url, timeout=10, headers=HEADERS)
                article_res.raise_for_status()
                article_soup = BeautifulSoup(article_res.content, 'html.parser')
                title = article_soup.find('h1').get_text(strip=True)
                date_str = article_soup.find('div', class_='date').get_text(strip=True).replace('Dodana: ', '')
                content = article_soup.find('div', class_='lead').get_text(strip=True)
                dt_object = datetime.datetime.strptime(date_str, '%d.%m.%Y %H:%M')
                alerts.append({"id": _generate_id(title, dt_object.isoformat()), "source": url, "title": title, "content": content, "timestamp": dt_object, "location": location})
            except Exception as e:
                logging.warning(f"Nie udało się przetworzyć artykułu {article_url}: {e}")
    except Exception as e:
        logging.error(f"Nieoczekiwany błąd podczas parsowania strony Białegostoku: {e}")
    logging.info(f"Znaleziono {len(alerts)} alertów na stronie Białegostoku.")
    return alerts

PARSER_MAP = {
    "rss": _parse_rss,
    "web_warszawa": _parse_web_warszawa,
    "web_lublin": _parse_web_lublin,
    "web_bialystok": _parse_web_bialystok,
}

def fetch_all_alerts() -> List[Dict[str, Any]]:
    """Fetch alerts from all configured sources"""
    all_alerts = []
    
    # Use current sources (may be location-specific or all-Poland)
    current_sources = settings.get_current_sources()
    
    for source_name, config in current_sources.items():
        parser_func = PARSER_MAP.get(config["type"])
        if parser_func:
            try:
                alerts = parser_func(config["url"], config["location"])
                
                # Add metadata to each alert
                for alert in alerts:
                    alert.update({
                        "source_name": source_name,
                        "source_level": config.get("level", "unknown"),
                        "source_priority": config.get("priority", "medium"),
                        "voivodeship_code": config.get("voivodeship_code", None)
                    })
                
                all_alerts.extend(alerts)
                logging.info(f"Pobrano {len(alerts)} alertów z {source_name} ({config['location']})")
                
            except Exception as e:
                logging.error(f"Błąd podczas przetwarzania źródła {source_name}: {e}")
    
    logging.info(f"Łączna liczba pobranych alertów: {len(all_alerts)}")
    return all_alerts

def fetch_alerts_for_location(lat: float, lon: float) -> List[Dict[str, Any]]:
    """Fetch alerts relevant to specific location"""
    # Update sources for this location
    settings.update_sources_for_location(lat, lon)
    
    # Fetch alerts using location-specific sources
    return fetch_all_alerts()

def get_location_coverage_info() -> Dict[str, Any]:
    """Get information about current alert coverage"""
    current_sources = settings.get_current_sources()
    
    coverage = {
        "total_sources": len(current_sources),
        "national_sources": 0,
        "voivodeship_sources": 0, 
        "city_sources": 0,
        "covered_locations": set(),
        "source_details": []
    }
    
    for source_name, config in current_sources.items():
        level = config.get("level", "unknown")
        location = config.get("location", "Unknown")
        
        coverage["covered_locations"].add(location)
        coverage["source_details"].append({
            "name": source_name,
            "location": location,
            "level": level,
            "priority": config.get("priority", "medium")
        })
        
        if level == "national":
            coverage["national_sources"] += 1
        elif level == "voivodeship":
            coverage["voivodeship_sources"] += 1
        elif level == "city":
            coverage["city_sources"] += 1
    
    coverage["covered_locations"] = sorted(list(coverage["covered_locations"]))
    
    return coverage
