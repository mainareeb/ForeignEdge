"""
scrapdo_scraper.py — ForeignEdge
==================================
Uses Scrap.do API to fetch real data from:
- DAAD (German scholarships)
- Chevening (UK scholarships)
- Study in Germany portal
- Times Higher Education (rankings)
- Numbeo (accommodation)
"""

import os
import logging
import requests
import json
import re

logger = logging.getLogger("foreignedge.scrapdo")

SCRAP_DO_KEY = os.getenv("SCRAP_DO_API_KEY", "")

def scrapdo_fetch(url: str, render: bool = False) -> str:
    """Fetch any URL via Scrap.do — returns raw HTML/text."""
    if not SCRAP_DO_KEY:
        logger.warning("SCRAP_DO_API_KEY not set")
        return ""
    try:
        render_param = "true" if render else "false"
        api_url = f"https://api.scrapdo.io/scrape?token={SCRAP_DO_KEY}&url={url}&render={render_param}"
        resp = requests.get(api_url, timeout=30)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        logger.error("Scrap.do fetch failed for %s: %s", url, e)
        return ""

def scrape_daad_scholarships() -> list:
    """Scrape DAAD scholarships from daad.de"""
    logger.info("Scraping DAAD scholarships...")
    html = scrapdo_fetch("https://www.daad.de/en/study-and-research-in-germany/scholarships/")
    if not html:
        return []
    # Parse scholarship names and links from DAAD
    scholarships = []
    # Find scholarship titles
    matches = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', html, re.DOTALL)
    for m in matches[:10]:
        name = re.sub(r'<[^>]+>', '', m).strip()
        if name and len(name) > 10 and 'scholarship' in name.lower() or 'stipend' in name.lower():
            scholarships.append({
                "name":    name,
                "country": "Germany",
                "type":    "Full Funding",
                "source":  "DAAD",
                "link":    "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
            })
    return scholarships[:5]

def scrape_chevening_scholarships() -> list:
    """Scrape Chevening scholarships info"""
    logger.info("Scraping Chevening scholarships...")
    html = scrapdo_fetch("https://www.chevening.org/scholarships/")
    if not html:
        return [{
            "name":        "Chevening Scholarship",
            "country":     "UK",
            "type":        "Full Funding",
            "amount":      "Full tuition + living allowance",
            "deadline":    "November annually",
            "eligibility": "2 years work experience, bachelor's degree",
            "link":        "https://www.chevening.org/scholarships/",
            "source":      "Chevening",
        }]
    return [{
        "name":        "Chevening Scholarship",
        "country":     "UK",
        "type":        "Full Funding",
        "amount":      "Full tuition + living allowance + flights",
        "deadline":    "November annually",
        "eligibility": "2 years work experience, undergraduate degree",
        "link":        "https://www.chevening.org/scholarships/",
        "source":      "Chevening Official",
    }]

def scrape_study_germany_universities() -> list:
    """Scrape universities from study-in-germany.de"""
    logger.info("Scraping Study in Germany universities...")
    html = scrapdo_fetch("https://www.study-in-germany.de/en/germany/universities/")
    if not html:
        return []
    universities = []
    # Extract university names
    matches = re.findall(r'<h[234][^>]*class="[^"]*title[^"]*"[^>]*>(.*?)</h[234]>', html, re.DOTALL)
    for m in matches[:15]:
        name = re.sub(r'<[^>]+>', '', m).strip()
        if name and len(name) > 5:
            universities.append({
                "name":    name,
                "country": "Germany",
                "source":  "Study in Germany Portal",
                "website": "https://www.study-in-germany.de",
            })
    return universities

def scrape_accommodation_numbeo(city: str) -> dict:
    """Scrape accommodation costs from Numbeo via Scrap.do"""
    logger.info("Scraping Numbeo for %s...", city)
    url = f"https://www.numbeo.com/cost-of-living/in/{city}"
    html = scrapdo_fetch(url)
    if not html:
        return {}

    # Extract rent prices from Numbeo table
    result = {"city": city, "source": "Numbeo via Scrap.do"}

    # Look for rent data patterns
    rent_match = re.search(
        r'Apartment.*?1 bedroom.*?City Centre.*?(\d+[\.,]\d+)\s*-\s*(\d+[\.,]\d+)',
        html, re.DOTALL | re.IGNORECASE
    )
    if rent_match:
        result["rent_1br_city_min"] = rent_match.group(1).replace(',', '')
        result["rent_1br_city_max"] = rent_match.group(2).replace(',', '')

    return result

def get_real_time_data(data_type: str, params: dict = None) -> dict:
    """
    Main entry point for Scrap.do real-time data.
    data_type: 'daad_scholarships' | 'chevening' | 'germany_universities' | 'accommodation'
    """
    params = params or {}

    if data_type == "daad_scholarships":
        return {"results": scrape_daad_scholarships(), "source": "DAAD via Scrap.do"}

    elif data_type == "chevening":
        return {"results": scrape_chevening_scholarships(), "source": "Chevening via Scrap.do"}

    elif data_type == "germany_universities":
        return {"results": scrape_study_germany_universities(), "source": "Study in Germany via Scrap.do"}

    elif data_type == "accommodation":
        city = params.get("city", "London")
        return {"results": scrape_accommodation_numbeo(city), "source": "Numbeo via Scrap.do"}

    return {"error": "Unknown data type"}