"""
Bielik AI Integration for Child Safety App
Polish AI model for age-appropriate safety responses
"""

import asyncio
import aiohttp
import logging
import json
from typing import Optional

# Bielik AI Configuration
BIELIK_API_URL = "https://api-inference.huggingface.co/models/bielik-ai/bielik-7b-instruct"

async def call_bielik_ai(prompt: str, api_key: str) -> Optional[str]:
    """
    Call Bielik AI (Polish model) via HuggingFace API
    """
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 150,
            "temperature": 0.7,
            "top_p": 0.9,
            "return_full_text": False,
            "do_sample": True
        }
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                BIELIK_API_URL,
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    
                    if isinstance(result, list) and len(result) > 0:
                        return result[0].get("generated_text", "").strip()
                    elif isinstance(result, dict):
                        return result.get("generated_text", "").strip()
                
                logging.warning(f"Bielik API returned status {response.status}")
                return None
                
    except Exception as e:
        logging.error(f"Bielik AI call failed: {e}")
        return None

def create_safety_prompt(action: str, child_age: int, context: dict) -> str:
    """
    Create age-appropriate safety prompts for Bielik AI
    """
    
    # Określ poziom językowy
    if child_age <= 6:
        language_level = "bardzo prosty język dla maluchów, używaj 'maluszku', krótkie zdania"
        complexity = "podstawowy"
    elif child_age <= 9:
        language_level = "prosty język dla dzieci, przyjazny ton"
        complexity = "średni"
    else:
        language_level = "normalny język dla dzieci i nastolatków"
        complexity = "zaawansowany"
    
    # Kontekst czasowy
    time_context = ""
    if context.get('timeOfDay') == 'wieczór':
        time_context = "Jest wieczór, więc pamiętaj o dodatkowym bezpieczeństwie. "
    
    # Prompts dla różnych akcji
    prompts = {
        "find_safety": f"""
Jesteś polskim asystentem bezpieczeństwa dla {child_age}-letniego dziecka.
Zadanie: Wyjaśnij gdzie znaleźć bezpieczne miejsca gdy się zgubi.

Wymagania:
- {language_level}
- {complexity} poziom szczegółów
- Maksymalnie 2-3 zdania
- Rozpocznij od emoji 🏃
- {time_context}Bądź ciepły ale konkretny

Odpowiedz:""",

        "safe_route": f"""
Jesteś polskim asystentem bezpieczeństwa dla {child_age}-letniego dziecka.
Zadanie: Wyjaśnij jak bezpiecznie poruszać się po mieście.

Wymagania:
- {language_level}
- {complexity} poziom szczegółów
- Maksymalnie 2-3 zdania  
- Rozpocznij od emoji 🚶
- {time_context}Podaj praktyczne wskazówki

Odpowiedz:""",

        "emergency_help": f"""
Jesteś polskim asystentem bezpieczeństwa dla {child_age}-letniego dziecka.
Zadanie: Wyjaśnij co robić w sytuacji awaryjnej.

Wymagania:
- {language_level}
- {complexity} poziom szczegółów
- Maksymalnie 2-3 zdania
- Rozpocznij od emoji 🚨
- {time_context}Podkreśl znaczenie pomocy dorosłych

Odpowiedz:""",

        "where_am_i": f"""
Jesteś polskim asystentem bezpieczeństwa dla {child_age}-letniego dziecka.
Zadanie: Wyjaśnij jak się orientować w przestrzeni i pamiętać lokalizację.

Wymagania:
- {language_level}
- {complexity} poziom szczegółów
- Maksymalnie 2-3 zdania
- Rozpocznij od emoji 🧭
- {time_context}Naucz orientacji przestrzennej

Odpowiedz:""",

        "welcome": f"""
Jesteś polskim asystentem bezpieczeństwa dla {child_age}-letniego dziecka.
Zadanie: {'Przywitaj się po raz pierwszy' if context.get('isFirstVisit') else 'Przywitaj się ponownie'}.

Wymagania:
- {language_level}
- {complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Rozpocznij od odpowiedniego emoji
- {time_context}Bądź ciepły i zachęcający

Odpowiedz:"""
    }
    
    return prompts.get(action, prompts["find_safety"])

async def generate_bielik_response(action: str, context: dict, api_key: str) -> Optional[str]:
    """
    Generate safety response using Bielik AI
    """
    
    child_age = context.get('childAge', 8)
    if isinstance(child_age, str):
        try:
            child_age = int(child_age)
        except:
            child_age = 8
    
    # Create appropriate prompt
    prompt = create_safety_prompt(action, child_age, context)
    
    # Call Bielik AI
    response = await call_bielik_ai(prompt, api_key)
    
    if response and len(response) > 10:
        # Clean up response
        response = response.strip()
        
        # Ensure it's appropriate length
        if len(response) > 200:
            response = response[:197] + "..."
            
        return response
    
    return None
