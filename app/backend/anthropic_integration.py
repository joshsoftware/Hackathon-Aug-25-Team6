"""
Anthropic Claude API Integration for Interview Question Generator
This module provides optimized integration with Claude for AI-powered interviews
"""

import anthropic
import json
import re
import os
from typing import List, Optional, Dict
from app.backend.schema import ResumeData, JobDescriptionData, InterviewSession

class AnthropicInterviewGenerator:
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-5-sonnet-20241022"):
        """
        Initialize Anthropic Claude integration
        
        Available models:
        - claude-3-5-sonnet-20241022 (best quality, recommended)
        - claude-3-5-haiku-20241022 (fastest, good quality)
        - claude-3-opus-20240229 (highest quality, slower)
        """
        self.model = model
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")
        
        # Initialize Anthropic client
        self.client = anthropic.Anthropic(api_key=self.api_key)
        
        # Test connection
        self._test_connection()
    
    def _test_connection(self):
        """Test the Claude API connection"""
        try:
            # Simple test message
            response = self.client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Reply with just 'OK'"}]
            )
            
            if 'OK' in response.content[0].text:
                print("✅ Claude API connection successful!")
            else:
                print("⚠️  Claude API connected but response was unexpected")
                
        except Exception as e:
            print(f"❌ Error connecting to Claude API: {e}")
            print("Make sure your ANTHROPIC_API_KEY is valid and has sufficient credits")
            raise
    
    def generate_initial_questions(self, resume_data: ResumeData, jd_data: JobDescriptionData) -> List[str]:
        """Generate initial interview questions using Claude"""
        
        # Create a focused prompt for better results
        prompt = self._create_initial_questions_prompt(resume_data, jd_data)
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=800,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Extract questions from response
            questions = self._extract_questions_from_response(response.content[0].text)
            
            # Ensure we have at least 3 questions
            if len(questions) < 3:
                questions.extend(self._get_fallback_questions(jd_data))
            
            return questions[:4]  # Return max 4 questions
            
        except Exception as e:
            print(f"Error generating questions with Claude: {e}")
            return self._get_fallback_questions(jd_data)
    
    def _create_initial_questions_prompt(self, resume_data: ResumeData, jd_data: JobDescriptionData) -> str:
        """Create optimized prompt for initial questions"""
        
        # Analyze skill gaps
        candidate_skills = set(skill.lower().strip() for skill in resume_data.primary_skills + resume_data.secondary_skills)
        required_skills = set(skill.lower().strip() for skill in jd_data.skills.must_have)
        
        matching_skills = candidate_skills.intersection(required_skills)
        missing_skills = required_skills - candidate_skills
        
        prompt = f"""You are an experienced technical interviewer. Generate exactly 3 relevant interview questions.

CANDIDATE PROFILE:
Name: {resume_data.candidate_first_name} {resume_data.candidate_last_name}
Primary Skills: {', '.join(resume_data.primary_skills)}
Domain Experience: {', '.join(resume_data.domain_expertise)}

JOB REQUIREMENTS:
Company: {jd_data.company}
Required Skills: {', '.join(jd_data.skills.must_have)}
Experience: {jd_data.experience_required.min_years}+ years
Key Responsibility: {jd_data.responsibilities[0] if jd_data.responsibilities else 'Technical development'}

ANALYSIS:
Matching Skills: {', '.join(matching_skills) if matching_skills else 'None directly'}
Skills to Assess: {', '.join(list(missing_skills)[:3]) if missing_skills else 'General technical ability'}

Generate 3 questions that:
1. Start with skills the candidate HAS (if any match)
2. Assess learning ability for new required skills
3. Test problem-solving and experience level

Format each question on a new line starting with "Q:" 
Example:
Q: Tell me about your experience with [matching skill] and how you've applied it in projects.
Q: This role requires [new skill]. How would you approach learning this technology?
Q: Describe a challenging technical problem you solved and your approach.

Generate the questions now:"""

        return prompt
    
    def generate_followup_question(self, session: InterviewSession, current_question: str, candidate_answer: str) -> Optional[str]:
        """Generate follow-up question based on candidate's answer"""
        
        # Get recent conversation context
        context = self._build_conversation_context(session)
        
        prompt = f"""You are conducting a technical interview. Based on the candidate's answer, decide if you need a follow-up question.

JOB REQUIREMENTS: {', '.join(session.jd_data.skills.must_have[:3])}

CONVERSATION SO FAR:
{context}

CURRENT QUESTION: {current_question}

CANDIDATE'S ANSWER: {candidate_answer}

INSTRUCTIONS:
- If the answer is too brief or vague, ask for more details or examples
- If the answer shows good knowledge, probe deeper into technical details
- If the answer reveals gaps, ask about related fundamentals
- If you've asked enough questions (5+), say "END_INTERVIEW"
- Keep questions relevant to the job requirements

Decision: Generate ONE follow-up question OR write "END_INTERVIEW"

Follow-up question:"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=300,
                temperature=0.8,
                messages=[{"role": "user", "content": prompt}]
            )
            
            followup = response.content[0].text.strip()
            
            # Clean up the response
            if "END_INTERVIEW" in followup.upper():
                return None
            
            # Extract just the question part
            followup = self._clean_followup_response(followup)
            
            return followup if followup else None
            
        except Exception as e:
            print(f"Error generating follow-up with Claude: {e}")
            return None
    
    def _extract_questions_from_response(self, response: str) -> List[str]:
        """Extract questions from Claude response"""
        questions = []
        
        # Look for questions marked with "Q:" or starting with question words
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Remove "Q:" prefix if present
            if line.startswith('Q:'):
                line = line[2:].strip()
            
            # Check if this looks like a question
            if (line and 
                ('?' in line or 
                 line.lower().startswith(('what', 'how', 'can you', 'tell me', 'describe', 'explain', 'why')) or
                 'experience' in line.lower() or
                 'would you' in line.lower())):
                
                # Ensure it ends with a question mark
                if not line.endswith('?'):
                    line += '?'
                
                questions.append(line)
        
        # If no structured questions found, try to extract any question-like content
        if not questions:
            # Look for sentences with question words
            sentences = re.split(r'[.!]', response)
            for sentence in sentences:
                sentence = sentence.strip()
                if (sentence and 
                    any(word in sentence.lower() for word in ['what', 'how', 'can you', 'tell me', 'describe']) and
                    len(sentence.split()) > 4):  # Reasonable length
                    
                    if not sentence.endswith('?'):
                        sentence += '?'
                    questions.append(sentence)
        
        return questions[:4]  # Limit to 4 questions
    
    def _clean_followup_response(self, response: str) -> Optional[str]:
        """Clean and extract follow-up question from response"""
        
        # Remove common prefixes
        prefixes_to_remove = [
            "Follow-up question:",
            "Question:",
            "Next question:",
            "I would ask:",
            "My follow-up would be:"
        ]
        
        cleaned = response
        for prefix in prefixes_to_remove:
            if cleaned.lower().startswith(prefix.lower()):
                cleaned = cleaned[len(prefix):].strip()
        
        # Take only the first sentence if multiple sentences
        sentences = re.split(r'[.!]', cleaned)
        if sentences:
            question = sentences[0].strip()
            
            # Ensure it's a reasonable question
            if (len(question.split()) > 4 and 
                (question.endswith('?') or 
                 any(word in question.lower() for word in ['what', 'how', 'can', 'tell', 'describe', 'explain']))):
                
                if not question.endswith('?'):
                    question += '?'
                
                return question
        
        return None
    
    def _build_conversation_context(self, session: InterviewSession) -> str:
        """Build conversation context for follow-up questions"""
        
        if not session.question_responses:
            return "This is the first question."
        
        # Get last 2-3 Q&A pairs for context
        recent_qa = session.question_responses[-2:] if len(session.question_responses) >= 2 else session.question_responses
        
        context_parts = []
        for i, qa in enumerate(recent_qa, 1):
            context_parts.append(f"Q{i}: {qa.question}")
            context_parts.append(f"A{i}: {qa.answer[:200]}...")  # Limit answer length for context
        
        return '\n'.join(context_parts)
    
    def _get_fallback_questions(self, jd_data: JobDescriptionData) -> List[str]:
        """Fallback questions when Claude fails"""
        
        required_skills = jd_data.skills.must_have
        first_skill = required_skills[0] if required_skills else "the required technologies"
        
        return [
            f"Tell me about your experience with {first_skill} and how you've used it in your projects.",
            f"How do you typically approach learning new technologies like {first_skill}?",
            "Describe a challenging technical problem you've solved recently and walk me through your solution.",
            "What interests you most about this role and how do you see yourself contributing to our team?"
        ]
    
    def get_model_info(self) -> Dict:
        """Get information about the current Claude model"""
        try:
            return {
                "model_name": self.model,
                "status": "connected",
                "type": "anthropic_claude",
                "api_key_configured": bool(self.api_key),
                "recommended_models": [
                    "claude-3-5-sonnet-20241022",
                    "claude-3-5-haiku-20241022",
                    "claude-3-opus-20240229"
                ]
            }
        except Exception as e:
            return {
                "model_name": self.model,
                "status": "error",
                "error": str(e),
                "type": "anthropic_claude"
            }

# Utility functions for easy setup
def check_anthropic_status(api_key: Optional[str] = None) -> Dict:
    """Check if Claude API is accessible"""
    try:
        api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            return {
                "status": "no_api_key",
                "message": "ANTHROPIC_API_KEY environment variable is not set"
            }
        
        client = anthropic.Anthropic(api_key=api_key)
        # Test with a minimal request
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=5,
            messages=[{"role": "user", "content": "Hi"}]
        )
        
        return {
            "status": "connected",
            "message": "Claude API is accessible and working",
            "model_tested": "claude-3-5-haiku-20241022"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to connect to Claude API"
        }

def get_recommended_models() -> List[Dict]:
    """Get list of recommended Claude models for interviews"""
    return [
        {
            "name": "claude-3-5-sonnet-20241022",
            "description": "Best quality for interviews, excellent reasoning",
            "recommended": True,
            "cost_per_1k_tokens": "$0.003"
        },
        {
            "name": "claude-3-5-haiku-20241022",
            "description": "Fastest and most cost-effective, good quality",
            "recommended": True,
            "cost_per_1k_tokens": "$0.00025"
        },
        {
            "name": "claude-3-opus-20240229",
            "description": "Highest quality, best for complex reasoning",
            "recommended": False,
            "cost_per_1k_tokens": "$0.015"
        }
    ]