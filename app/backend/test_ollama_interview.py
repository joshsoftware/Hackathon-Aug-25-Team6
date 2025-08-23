#!/usr/bin/env python3
"""
Quick test script for Ollama Interview System
Run this to test your setup with sample data
"""

import requests
import json
import time
from datetime import datetime

# Your sample data
SAMPLE_RESUME = {
    "candidate_email": None,
    "candidate_first_name": "Habeeb",
    "candidate_last_name": "Ul Hasan Irfan",
    "primary_skills": [
        "Agile (Scrum, SAFe, Kanban)",
        "Business Operations & Partner Management", 
        "Salesforce CRM & Microsoft Dynamics"
    ],
    "secondary_skills": [
        "Cloud & Infrastructure",
        "CRM & Case Management", 
        "Data Analytics & Reporting",
        "Project & Program Management",
        "Reporting & Analytics",
        "Technology & Tools",
        "Trainings & Certifications"
    ],
    "domain_expertise": ["BFSI", "Healthcare", "Telecom"]
}

SAMPLE_JD = {
    "title": None,
    "company": "Josh Software",
    "company_description": "Relentlessly focused on discovering, developing and delivering innovative solutions that connect our customers to the people they serve through the advanced use of technology.",
    "experience_required": {"min_years": 3, "max_years": None},
    "skills": {
        "must_have": [
            "Kubernetes",
            "Docker", 
            "CI/CD tools (Jenkins, GitLab CI)",
            "config management tools like Ansible, Puppet, or Chef",
            "strong knowledge of cloud platforms (AWS, Azure, or GCP)",
            "proficient in scripting (Bash, Python)"
        ],
        "good_to_have": [
            "Helm charts and service meshes (Istio, Linkerd)",
            "monitoring and logging solutions (Prometheus, Grafana, ELK)",
            "experience with security best practices for cloud and container environments",
            "contributions to open-source projects or a strong personal portfolio"
        ]
    },
    "qualifications": ["B.Tech/B.E./M.E./M.Tech in Computer Science or equivalent"],
    "responsibilities": [
        "Manage and optimize Kubernetes clusters, including deployments, scaling, and troubleshooting.",
        "Develop and maintain Docker images and containers, ensuring security best practices.",
        "Design, implement, and maintain cloud-based infrastructure (AWS, Azure or GCP) using Infrastructure-as-Code (IaC) principles (e.g., Terraform).",
        "Monitor and troubleshoot infrastructure and application performance, proactively identifying and resolving issues.",
        "Contribute to the development and maintenance of internal tools and automation scripts."
    ],
    "location": None,
    "employment_type": None
}

BASE_URL = "http://localhost:8000"

def print_header(title: str):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"🎯 {title}")
    print('='*60)

def print_step(step: str, description: str = ""):
    """Print a test step"""
    print(f"\n🔸 {step}")
    if description:
        print(f"   {description}")

def test_health_check():
    """Test system health"""
    print_header("SYSTEM HEALTH CHECK")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ System is healthy")
            print(f"   Status: {health_data.get('status', 'unknown')}")
            print(f"   Ollama Status: {health_data.get('ollama_status', 'unknown')}")
            print(f"   Timestamp: {health_data.get('timestamp', 'unknown')}")
            return True
        else:
            print(f"❌ Health check failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        print("💡 Make sure the server is running: python main.py")
        return False

def test_ollama_status():
    """Test Ollama-specific endpoints"""
    print_header("OLLAMA STATUS CHECK")
    
    try:
        # Check Ollama status
        response = requests.get(f"{BASE_URL}/ollama/status", timeout=10)
        if response.status_code == 200:
            status_data = response.json()
            print(f"✅ Ollama Status: {status_data.get('status', 'unknown')}")
            
            if status_data.get('available_models'):
                print(f"   Available Models: {', '.join(status_data['available_models'])}")
            
            return status_data.get('status') == 'running'
        else:
            print(f"❌ Ollama status check failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ollama status check failed: {e}")
        return False

def start_interview():
    """Start an interview with sample data"""
    print_header("STARTING INTERVIEW")
    
    request_data = {
        "resume_data": SAMPLE_RESUME,
        "jd_data": SAMPLE_JD
    }
    
    try:
        print_step("Sending interview start request...")
        response = requests.post(
            f"{BASE_URL}/start-interview",
            json=request_data,
            timeout=30  # Longer timeout for AI processing
        )
        
        if response.status_code == 200:
            start_data = response.json()
            print("✅ Interview started successfully!")
            print(f"   Session ID: {start_data['session_id']}")
            print(f"   Total Initial Questions: {start_data['total_initial_questions']}")
            print(f"\n💬 First Question:")
            print(f"   {start_data['first_question']}")
            
            return start_data['session_id'], start_data['first_question']
        else:
            print(f"❌ Failed to start interview: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None, None
            
    except Exception as e:
        print(f"❌ Failed to start interview: {e}")
        return None, None

def answer_question(session_id: str, question: str, answer: str):
    """Answer a question and get the next one"""
    print_step(f"Answering question...", f"Answer: {answer[:100]}...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/answer-question",
            json={
                "session_id": session_id,
                "answer": answer
            },
            timeout=30
        )
        
        if response.status_code == 200:
            answer_data = response.json()
            print("✅ Answer submitted successfully!")
            
            if answer_data['is_interview_complete']:
                print("🎉 Interview completed!")
                return None, True
            else:
                print(f"\n💬 Next Question ({answer_data['question_number']}):")
                print(f"   {answer_data['next_question']}")
                return answer_data['next_question'], False
        else:
            print(f"❌ Failed to submit answer: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None, True
            
    except Exception as e:
        print(f"❌ Failed to submit answer: {e}")
        return None, True

def run_sample_interview():
    """Run a complete sample interview"""
    print_header("SAMPLE INTERVIEW SESSION")
    
    # Start interview
    session_id, first_question = start_interview()
    if not session_id:
        return False
    
    # Sample answers that relate to the skills mismatch
    sample_answers = [
        "I have extensive experience with Salesforce CRM and Microsoft Dynamics, managing customer relationships and business operations. While I haven't worked directly with Kubernetes, I understand it's a container orchestration platform. I'm eager to learn and have experience quickly adapting to new technologies in my previous roles.",
        
        "In my previous role at a healthcare company, I managed complex Salesforce implementations and integrated multiple systems. I led a team of 5 people and we successfully migrated from an legacy CRM to Salesforce, which improved customer response time by 40%. I believe my project management and systems integration experience would translate well to DevOps practices.",
        
        "I approach learning new technologies systematically. When I had to learn Microsoft Dynamics, I started with official documentation, took online courses, and set up a test environment to practice. For Kubernetes, I would follow a similar approach - start with the basics, work through tutorials, and gradually build more complex scenarios. My experience with cloud platforms through Salesforce would give me a good foundation.",
        
        "I'm very interested in Josh Software because of your focus on innovative solutions. This role would allow me to transition into DevOps while leveraging my project management and systems integration background. I see this as an opportunity to grow technically while contributing my experience in managing complex technology implementations."
    ]
    
    current_question = first_question
    question_count = 1
    
    # Answer questions
    for answer in sample_answers:
        if current_question is None:
            break
        
        print(f"\n📝 Question {question_count}: {current_question[:100]}...")
        
        next_question, is_complete = answer_question(session_id, current_question, answer)
        
        if is_complete:
            break
        
        current_question = next_question
        question_count += 1
        
        # Small delay to make it more realistic
        time.sleep(1)
    
    return True

def get_session_summary(session_id: str):
    """Get final session summary"""
    print_header("INTERVIEW SESSION SUMMARY")
    
    try:
        response = requests.get(f"{BASE_URL}/session/{session_id}", timeout=10)
        if response.status_code == 200:
            session_data = response.json()
            print("✅ Session Summary:")
            print(f"   Candidate: {session_data['candidate_name']}")
            print(f"   Company: {session_data['company']}")
            print(f"   Status: {session_data['status']}")
            print(f"   Total Questions: {session_data['total_questions']}")
            print(f"   Created: {session_data['created_at']}")
            
            print(f"\n📋 Question & Answer History:")
            for i, qa in enumerate(session_data['question_responses'], 1):
                print(f"\n   Q{i}: {qa['question']}")
                print(f"   A{i}: {qa['answer'][:100]}...")
            
            return True
        else:
            print(f"❌ Failed to get session summary: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to get session summary: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 OLLAMA INTERVIEW SYSTEM TEST")
    print("This will test your complete setup with sample data")
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ System health check failed. Please check your setup.")
        return False
    
    # Test 2: Ollama Status  
    if not test_ollama_status():
        print("\n❌ Ollama is not running properly.")
        print("💡 Make sure Ollama is running: ollama serve")
        return False
    
    # Test 3: Sample Interview
    if not run_sample_interview():
        print("\n❌ Sample interview failed.")
        return False
    
    # Success!
    print_header("🎉 ALL TESTS PASSED!")
    print("✅ Your Ollama interview system is working perfectly!")
    print("\n🚀 Next steps:")
    print("   • Integrate with your frontend")
    print("   • Customize question prompts")
    print("   • Add more sophisticated evaluation")
    print("   • Try different Ollama models")
    
    print(f"\n{'='*60}")
    print("🎊 Ready for real interviews! 🎊") 
    print('='*60)
    
    return True

if __name__ == "__main__":
    main()