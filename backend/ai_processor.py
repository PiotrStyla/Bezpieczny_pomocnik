import openai
import logging
from typing import List, Optional

from .config import settings

openai.api_key = settings.OPENAI_API_KEY

PROMPTS = {
    "pl": {
        "simplify_system": "Jesteś 'Bezpiecznym Pomocnikiem'. Twoim zadaniem jest przetłumaczenie i uproszczenie oficjalnego komunikatu bezpieczeństwa na język zrozumiały dla 10-letniego dziecka. Skup się na kluczowych informacjach: co się dzieje, gdzie i co należy robić. Unikaj skomplikowanych terminów. Odpowiadaj tylko przetłumaczonym tekstem, bez dodatkowych komentarzy.",
        "tips_system": "Jesteś 'Bezpiecznym Pomocnikiem'. Na podstawie uproszczonego komunikatu, podaj 3-4 krótkie, praktyczne porady dla rodziny z dziećmi. Porady muszą być w formie listy z myślnikami. Odpowiadaj tylko listą porad."
    },
    "en": {
        "simplify_system": "You are 'Safe Helper'. Your task is to translate and simplify an official safety alert into language understandable by a 10-year-old child. Focus on key information: what is happening, where, and what to do. Avoid complex terms. Respond only with the translated text, without additional comments.",
        "tips_system": "You are 'Safe Helper'. Based on the simplified message, provide 3-4 short, practical tips for a family with children. The tips must be in the form of a bulleted list. Respond only with the list of tips."
    },
    "ua": {
        "simplify_system": "Ти 'Безпечний Помічник'. Твоє завдання — перекласти та спростити офіційне повідомлення про безпеку на мову, зрозумілу 10-річній дитині. Зосередься на ключовій інформації: що відбувається, де і що робити. Уникай складних термінів. Відповідай тільки перекладеним текстом, без додаткових коментарів.",
        "tips_system": "Ти 'Безпечний Помічник'. На основі спрощеного повідомлення, надай 3-4 короткі, практичні поради для сім'ї з дітьми. Поради повинні бути у формі списку з маркерами. Відповідай тільки списком порад."
    }
}

def _get_prompt(lang: str, prompt_type: str) -> str:
    return PROMPTS.get(lang, PROMPTS["pl"])[prompt_type]

def simplify_text(title: str, content: str, lang: str = "pl") -> Optional[str]:
    if not openai.api_key or "Your_OpenAI" in openai.api_key:
        logging.warning("Brak klucza OPENAI_API_KEY. Upraszczanie tekstu jest niemożliwe.")
        return None
    system_prompt = _get_prompt(lang, "simplify_system")
    user_prompt = f"Tytuł: {title}\n\nTreść: {content}"
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3, max_tokens=250
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        logging.error(f"Błąd API OpenAI przy upraszczaniu: {e}")
        return None

def generate_tips(simplified_content: str, lang: str = "pl") -> Optional[List[str]]:
    if not openai.api_key or "Your_OpenAI" in openai.api_key or not simplified_content:
        return None
    system_prompt = _get_prompt(lang, "tips_system")
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": simplified_content}
            ],
            temperature=0.5, max_tokens=150
        )
        tips_raw = response.choices[0].message['content'].strip()
        return [tip.strip() for tip in tips_raw.split('-') if tip.strip()]
    except Exception as e:
        logging.error(f"Błąd API OpenAI przy generowaniu porad: {e}")
        return None
