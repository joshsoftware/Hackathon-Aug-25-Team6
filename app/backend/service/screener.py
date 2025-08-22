import json
import os
import re
from typing import Dict

import requests
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate

from app.backend.prompt.prompt import get_prompt

load_dotenv()

API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")
# Prefer a dedicated screening model; fall back to alternative names, then to generic LLM_MODEL
SCREEN_LLM_MODEL = (
    os.getenv("SCREEN_LLM_MODEL")
    or os.getenv("LLM_MODEL_SCREEN")
    or os.getenv("LLM_MODEL")
)


def screen_candidate_with_ai(jd: Dict, resume: Dict) -> Dict:
    """Prescreen a candidate against a JD using the LLM.

    Parameters:
    - jd: Parsed JD JSON dict.
    - resume: Parsed Resume JSON dict.

    Returns a structured JSON dict as defined by the SCREEN_CANDIDATE_PROMPT.
    The model used can be configured via .env using SCREEN_LLM_MODEL (preferred),
    or LLM_MODEL_SCREEN, or it will fall back to LLM_MODEL.
    """
    try:
        jd_json = json.dumps(jd, ensure_ascii=False)
        resume_json = json.dumps(resume, ensure_ascii=False)
    except Exception:
        return {"error": "Invalid input JSON for screening"}

    if not (API_URL and API_KEY):
        return {"error": "Remote AI API not configured"}

    prompt_template = get_prompt("screen_candidate")
    effective_prompt = ChatPromptTemplate.from_template(prompt_template)

    user_content = effective_prompt.format(jd=jd_json, resume=resume_json)

    payload = {
        "model": SCREEN_LLM_MODEL,
        "messages": [
            {"role": "user", "content": user_content}
        ],
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code != 200:
        return {"error": f"API call failed {response.status_code}: {response.text}"}

    try:
        response_json = response.json()
        response_text = response_json["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return {"error": f"Bad response format: {str(e)}"}

    # Extract JSON from potential code fences
    fenced = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", response_text)
    if fenced:
        data = fenced.group(1)
    else:
        match = re.search(r"\{[\s\S]*\}", response_text)
        if not match:
            return {"error": "No JSON found in AI response"}
        data = match.group(0)

    # Cleanup common issues
    data = data.replace("\\_", "_")
    data = re.sub(r",\s*([}\]])", r"\1", data)

    try:
        raw_json = json.loads(data)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response as JSON"}

    return raw_json
