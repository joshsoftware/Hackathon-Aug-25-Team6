PARSE_JD_PROMPT = """
You are an expert job description parser. 
Your task is to analyze the given Job Description (JD) text and extract key information in a structured JSON format.  

JD Text:
{text}

### Instructions:
1. Read the JD carefully and extract only the requested fields.  
2. Always return valid JSON (no explanations, no extra text).  
3. If a field is missing or not explicitly mentioned, set its value to null (or an empty list for arrays).  
4. For `experience_required`, infer minimum and maximum years if possible, otherwise use null.  
5. For `skills`, separate into `must_have` (explicitly required) and `good_to_have` (preferred/optional).  
6. Keep all strings concise (avoid long sentences, use keywords only).  
7. Ensure the JSON keys and structure match exactly what is specified below.  

### Output JSON format:
{{
  "title": string | null,
  "company": string | null,
  "company_description": string | null,
  "experience_required": {{
    "min_years": int | null,
    "max_years": int | null
  }},
  "skills": {{
    "must_have": [string, string, ...],
    "good_to_have": [string, string, ...]
  }},
  "qualifications": [string, string, ...],
  "responsibilities": [string, string, ...],
  "location": string | null,
  "employment_type": string | null
}}

### Now return ONLY the JSON object.
"""

PARSE_RESUME_PROMPT = """
You are an expert resume parser. Extract structured data from the resume text.

IMPORTANT RULES:
- Do NOT guess or fabricate information.
- candidate_email: Only include if explicitly present in the text, else set null.
- candidate_first_name / candidate_last_name: Only extract if clearly mentioned. If uncertain, set null.
- primary_skills: Core technical/functional skills explicitly highlighted by the candidate.
- secondary_skills: Additional skills or tools mentioned that are supportive, not core.
- domain_expertise: Industries or domains where the candidate has experience (e.g., Finance, Healthcare, Retail).
- All lists must contain unique values, no duplicates.
- Output must be STRICTLY valid JSON, with no explanations or extra text.

Resume text:
{text}

Return JSON in this format:
{{
  "candidate_email": null,
  "candidate_first_name": null,
  "candidate_last_name": null,
  "primary_skills": ["skill1", "skill2"],
  "secondary_skills": ["skill1", "skill2"],
  "domain_expertise": ["domain1", "domain2"]
}}
"""


SCREEN_CANDIDATE_PROMPT = """
You are an experienced technical recruiter. You will receive TWO JSON objects separately:

JD JSON:
{jd}

Resume JSON:
{resume}

Task: Perform a prescreening evaluation of candidate fit for the job. Compare must-have vs. candidate skills, good-to-have skills, location, and experience. Be strict with must-have skills: any critical missing must-have should significantly lower the score.

Rules:
- Treat candidate skills as primary_skills ∪ secondary_skills.
- Location: If either side is null/unspecified, mark status as "unspecified".
- Experience: Compare jd.experience_required.min_years to candidate years if available; if either is null, status is "unknown".
- Good-to-have skills can improve score but cannot compensate for multiple missing must-haves.
- Only return STRICT JSON, no extra commentary, no markdown.

Output JSON format (use these exact keys):
{{
  "overall_fit": "strong_fit" | "possible_fit" | "not_fit",
  "score": 0,
  "must_have": {{
    "matched": ["skill", "skill"],
    "missing": ["skill", "skill"]
  }},
  "good_to_have": {{
    "matched": ["skill", "skill"],
    "missing": ["skill", "skill"]
  }},
  "experience_match": {{
    "required_min_years": null,
    "candidate_years": null,
    "status": "meets" | "below" | "exceeds" | "unknown"
  }},
  "location_match": {{
    "jd_location": null,
    "candidate_location": null,
    "status": "match" | "mismatch" | "unspecified"
  }},
  "domain_alignment": {{
    "matched": ["domain"],
    "missing": ["domain"]
  }},
  "risks": ["short bullet reasons of concerns"],
  "summary": "one-line recruiter rationale",
  "verdict": "advance" | "hold" | "reject"
}}

Now analyze the provided JD and Resume and return ONLY the JSON object above.
"""

# Registry of available prompts keyed by simple strings for model/task selection
PROMPT_REGISTRY = {
    "parse_jd": PARSE_JD_PROMPT,
    "parse_resume": PARSE_RESUME_PROMPT,
    "screen_candidate": SCREEN_CANDIDATE_PROMPT,
}


def get_prompt(key: str) -> str:
    """Return a prompt template string based on a key.

    The key is case-insensitive and trimmed. Unknown keys fall back to the
    default JD parsing prompt to keep behavior robust.
    """
    k = str(key).strip().lower()
    return PROMPT_REGISTRY.get(k)
