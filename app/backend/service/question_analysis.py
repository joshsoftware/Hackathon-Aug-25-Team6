import json
import os

import requests


class QuestionAnalysisService:
    """Service for analyzing and scoring candidate question responses"""

    def __init__(self):
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.model = "claude-3-7-sonnet-20250219"
        self.api_url = "https://api.anthropic.com/v1/messages"
        self.headers = {
            "x-api-key": self.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        # Load the question analysis prompt
        prompt_path = os.path.join(
            os.path.dirname(__file__), "../prompts/questionAnalysis.py"
        )
        with open(prompt_path, "r") as f:
            self.prompt_template = f.read()

    def _validate_api_key(self):
        """Validate that the Anthropic API key is set"""
        if not self.anthropic_api_key:
            raise ValueError("Anthropic API key not set")

    def analyze_questions(
        self, qa_pairs, role="Software Engineer", yoe=3, skill="Python"
    ):
        """
        Analyze and score candidate responses to questions

        Args:
            qa_pairs: List of dictionaries containing question_id, question, and answer
            role: The role the candidate is applying for
            yoe: Years of experience
            skill: Primary skill being evaluated

        Returns:
            List of dictionaries containing question_id and score details
        """
        self._validate_api_key()

        results = []

        # Process each QA pair
        for qa_pair in qa_pairs:
            question_id = qa_pair["question_id"]
            question = qa_pair["question"]
            answer = qa_pair["answer"]

            # Format the prompt with the current question and answer
            formatted_prompt = self.prompt_template.replace("{{role}}", role)
            formatted_prompt = formatted_prompt.replace("{{yoe}}", str(yoe))
            formatted_prompt = formatted_prompt.replace("{{skill}}", skill)
            formatted_prompt = formatted_prompt.replace("{{reference_notes}}", "")
            formatted_prompt = formatted_prompt.replace("{{question}}", question)
            formatted_prompt = formatted_prompt.replace("{{answer}}", answer)

            # Prepare payload for Claude API
            payload = {
                "model": self.model,
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": formatted_prompt}],
            }

            # Make API request
            response = requests.post(self.api_url, json=payload, headers=self.headers)

            if response.status_code != 200:
                raise ValueError(f"Anthropic Claude API error: {response.text}")

            result = response.json()
            content = result.get("content", [])

            # Extract the text content from Claude's response
            text_content = ""
            for block in content:
                if block.get("type") == "text":
                    text_content += block.get("text", "")

            # Extract JSON from the response
            try:
                # Try to find JSON in the response
                json_start = text_content.find("{")
                json_end = text_content.rfind("}") + 1

                if json_start >= 0 and json_end > json_start:
                    json_str = text_content[json_start:json_end]
                    analysis_result = json.loads(json_str)
                else:
                    raise ValueError("No valid JSON found in response")

                # Add question_id to the analysis result
                analysis_result["question_id"] = question_id
                results.append(analysis_result)

            except json.JSONDecodeError:
                raise ValueError(
                    f"Failed to parse JSON from Claude response: {text_content}"
                )

        return results
