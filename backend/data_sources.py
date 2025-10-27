import feedparser
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import datetime
import hashlib
import logging
import re
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

from .config import settings

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, text/html;q=0.7, */*;q=0.5'
}

def _generate_id(title: str, published_date: str) -> str:
    return hashlib.sha256(f"{title}{published_date}".encode()).hexdigest()

def _parse_rss(url: str, location: str) -> List[Dict[str, Any]]:
    logging.info(f"Pobieranie danych RSS z: {url}")
    alerts = []
    try:
        feed = feedparser.parse(url, request_headers=HEADERS)
        entries = getattr(feed, "entries", [])
        status = getattr(feed, "status", None)
        bozo = getattr(feed, "bozo", None)
        if not entries or (isinstance(status, int) and status >= 400):
            try:
                resp = requests.get(url, timeout=10, headers=HEADERS)
                ct = resp.headers.get('Content-Type', '')
                logging.info(f"RSS fetch status={resp.status_code} ct={ct} url={url}")
                resp.raise_for_status()
                content = resp.content
                feed2 = feedparser.parse(content)
                entries = getattr(feed2, "entries", [])
                if not entries and 'html' in ct.lower():
                    soup = BeautifulSoup(content, 'html.parser')
                    rss_url = None
                    for link in soup.find_all('link', href=True):
                        t = (link.get('type') or '').lower()
                        rel = link.get('rel') or []
                        rel_str = ','.join(rel).lower() if isinstance(rel, list) else str(rel).lower()
                        if 'rss' in t or 'atom' in t or 'rss' in rel_str or 'application/xml' in t:
                            rss_url = urljoin(url, link['href'])
                            break
                    if rss_url:
                        logging.info(f"RSS autodiscovery: {rss_url}")
                        feed3 = feedparser.parse(rss_url, request_headers=HEADERS)
                        entries = getattr(feed3, "entries", [])
                        if entries:
                            url = rss_url
            except Exception as e:
                logging.warning(f"Fallback requests dla {url} nieudany: {e}")
        for entry in entries:
            published_time = entry.get("published_parsed") if hasattr(entry, "get") else getattr(entry, "published_parsed", None)
            dt_object = datetime.datetime(*published_time[:6]) if published_time else datetime.datetime.now()
            title = entry.get("title", getattr(entry, "title", "Bez tytułu")) if hasattr(entry, "get") else getattr(entry, "title", "Bez tytułu")
            summary = entry.get("summary", getattr(entry, "summary", "")) if hasattr(entry, "get") else getattr(entry, "summary", "")
            published = entry.get("published", getattr(entry, "published", "")) if hasattr(entry, "get") else getattr(entry, "published", "")
            alerts.append({
                "id": _generate_id(title, published),
                "source": url,
                "title": title,
                "content": summary,
                "timestamp": dt_object,
                "location": location
            })
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

def _parse_rso_xml(url: str, location: str) -> List[Dict[str, Any]]:
    logging.info(f"Pobieranie danych RSO XML z: {url}")
    alerts: List[Dict[str, Any]] = []
    try:
        resp = requests.get(url, timeout=10, headers=HEADERS)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        for news in root.findall('.//news'):
            nid = (news.findtext('id') or '').strip()
            title = (news.findtext('title') or '').strip() or 'Bez tytułu'
            shortcut = (news.findtext('shortcut') or '').strip()
            content = (news.findtext('content') or '').strip()
            rso_alarm = (news.findtext('rso_alarm') or '').strip()
            valid_from = (news.findtext('valid_from') or '').strip()
            valid_to = (news.findtext('valid_to') or '').strip()

            ts = None
            for candidate in (valid_from, valid_to):
                if candidate:
                    try:
                        # Expecting format like 'YYYY-MM-DD HH:MM:SS'
                        ts = datetime.datetime.strptime(candidate, '%Y-%m-%d %H:%M:%S')
                        break
                    except Exception:
                        pass
            if ts is None:
                ts = datetime.datetime.now()

            body = content or shortcut
            provinces = []
            provs = news.find('provinces')
            if provs is not None:
                for p in provs.findall('province'):
                    txt = (p.text or '').strip()
                    if txt:
                        provinces.append(txt)

            alerts.append({
                "id": _generate_id(nid or title, valid_from or valid_to or ''),
                "source": url,
                "title": title,
                "content": body,
                "timestamp": ts,
                "location": ', '.join(provinces) if provinces else location,
                "rso_alarm": rso_alarm,
            })
    except Exception as e:
        logging.error(f"Błąd podczas parsowania RSO XML z {url}: {e}")
    logging.info(f"Znaleziono {len(alerts)} alertów RSO.")
    return alerts

PARSER_MAP = {
    "rss": _parse_rss,
    "web_warszawa": _parse_web_warszawa,
    "web_lublin": _parse_web_lublin,
    "web_bialystok": _parse_web_bialystok,
    "rso_xml": _parse_rso_xml,
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
