import json
import os
import re
from typing import Dict, Union
from langchain_core.prompts import ChatPromptTemplate
# Optional PDF backends: PyMuPDF ('fitz') and fallback 'pypdf'
try:
    import fitz  # type: ignore  # PyMuPDF for PDF
    _HAVE_PYMUPDF = True
except Exception:
    fitz = None  # type: ignore
    _HAVE_PYMUPDF = False

try:
    from pypdf import PdfReader  # fallback pure-Python backend
    _HAVE_PYPDF = True
except Exception:
    PdfReader = None  # type: ignore
    _HAVE_PYPDF = False

import docx2txt  # For DOCX
from dotenv import load_dotenv

import docx2txt  # For DOCX
import fitz  # PyMuPDF for PDF
import requests
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate

from app.backend.prompts.prompt import get_prompt

load_dotenv()
API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL")


def parse_with_ai(text: str, prompt: Union[str, ChatPromptTemplate]) -> Dict:
    """Send text to a remote AI API and return the parsed JSON.

    Parameters:
    - text: The input text to parse (e.g., job description, resume, etc.).
    - prompt: Prompt to control the LLM behavior. Can be a raw string template
      with {text} placeholder or a ChatPromptTemplate. This argument is required.
    """

    # Resolve the effective prompt template
    if isinstance(prompt, ChatPromptTemplate):
        effective_prompt = prompt
    else:
        effective_prompt = ChatPromptTemplate.from_template(prompt)

    if not (API_URL and API_KEY):
        return {"error": "Remote AI API not configured"}

    print("⚡ Using remote AI API")
    payload = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": effective_prompt.format(text=text)}],
    }

    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        return {"error": f"API call failed {response.status_code}: {response.text}"}

    try:
        response_json = response.json()
        response_text = response_json["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return {"error": f"Bad response format: {str(e)}"}

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
        print("AI JSON decode failed after cleanup", data[:500], flush=True)
        return {"error": "Failed to parse AI response as JSON"}

    return raw_json


def read_pdf(file_path: str) -> str:
    """Read text from a PDF using the best available backend.

    Order of preference:
    1) PyMuPDF (fitz) — fast and robust
    2) pypdf — pure-Python fallback

    Raises:
        ImportError: if no PDF backend is available
        ValueError: if extraction yields empty text (likely a scanned PDF) or both backends failed
    """
    errors: list[str] = []

    # Try PyMuPDF first if available
    if _HAVE_PYMUPDF:
        try:
            text = ""
            with fitz.open(file_path) as pdf:
                for page in pdf:
                    # 'text' mode gives layout-aware text; fallback to default if needed
                    page_text = page.get_text("text") or page.get_text() or ""
                    if page_text:
                        text += page_text + "\n"
            if text.strip():
                return text.strip()
        except Exception as e:
            errors.append(f"PyMuPDF failed: {e}")

    # Fallback to pypdf if available
    if _HAVE_PYPDF:
        try:
            parts: list[str] = []
            reader = PdfReader(file_path)  # type: ignore[name-defined]
            for page in reader.pages:
                try:
                    t = page.extract_text() or ""
                except Exception as e2:
                    t = ""
                    errors.append(f"pypdf page extract error: {e2}")
                if t:
                    parts.append(t)
            combined = "\n".join(parts).strip()
            if combined:
                return combined
        except Exception as e:
            errors.append(f"pypdf failed: {e}")

    # No backends? Instruct how to install
    if not _HAVE_PYMUPDF and not _HAVE_PYPDF:
        raise ImportError(
            "No PDF backend installed. Install one of: 'PyMuPDF' (pip install PyMuPDF) or 'pypdf' (pip install pypdf)."
        )

    # Backends present but no text extracted: likely scanned PDF
    error_note = "; ".join(errors) if errors else ""
    raise ValueError(
        "Unable to extract text from PDF. The file may be scanned or image-based. "
        "Consider OCR (e.g., pytesseract) if needed. " + error_note
    )


def read_docx(file_path: str) -> str:
    return docx2txt.process(file_path).strip()


def read_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read().strip()


def get_text_from_file(path_str: str) -> str:

    extension = os.path.splitext(path_str)[-1].lower()

    if extension == ".pdf":
        return read_pdf(path_str)
    elif extension == ".docx":
        return read_docx(path_str)
    elif extension == ".txt":
        return read_txt(path_str)
    else:
        raise ValueError(f"Unsupported file type: {extension}")


def parse_file_with_ai(path_str: str, prompt: Union[str, ChatPromptTemplate]) -> Dict:
    """Convenience helper: read a file and parse its contents with the AI.
    Supports PDF, DOCX, and TXT via get_text_from_file.
    """
    text = get_text_from_file(path_str)
    return parse_with_ai(text, prompt)
