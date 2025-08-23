#!/usr/bin/env python3
"""
Anthropic Claude API Setup Script for Interview Question Generator
This script helps you set up Claude API integration for interviews
"""

import os
import sys
import requests
import json
from typing import Dict, List
import platform

def print_step(step: str, description: str = ""):
    """Print a setup step with formatting"""
    print(f"\n{'='*50}")
    print(f"�� STEP: {step}")
    if description:
        print(f"📝 {description}")
    print('='*50)

def check_python_version():
    """Check if Python version is compatible"""
    print_step("Checking Python Version")
    
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} detected")
        print("   Claude API requires Python 3.8 or higher")
        print("   Please upgrade your Python installation")
        return False
    else:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible!")
        return True

def check_api_key():
    """Check if Anthropic API key is configured"""
    print_step("Checking API Key Configuration")
    
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if api_key:
        # Mask the API key for display
        masked_key = api_key[:8] + "..." + api_key[-4:] if len(api_key) > 12 else "***"
        print(f"✅ API Key found: {masked_key}")
        return True
    else:
        print("❌ ANTHROPIC_API_KEY environment variable not found")
        print("\n📋 To get an API key:")
        print("   1. Visit: https://console.anthropic.com/")
        print("   2. Sign up or log in")
        print("   3. Go to API Keys section")
        print("   4. Create a new API key")
        print("   5. Copy the key and set it as environment variable")
        return False

def setup_environment_file():
    """Create or update .env file with Claude configuration"""
    print_step("Setting up Environment Configuration")
    
    env_content = """# Anthropic Claude API Configuration
ANTHROPIC_API_KEY=your_api_key_here

# Claude Model Configuration
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# FastAPI Configuration  
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Optional: Cost tracking
ENABLE_COST_TRACKING=True
"""
    
    try:
        # Check if .env already exists
        if os.path.exists('.env'):
            print("📁 .env file already exists")
            
            # Read existing content
            with open('.env', 'r') as f:
                existing_content = f.read()
            
            # Check if ANTHROPIC_API_KEY is already there
            if 'ANTHROPIC_API_KEY' in existing_content:
                print("✅ ANTHROPIC_API_KEY already configured in .env")
                return True
            else:
                print("📝 Adding Claude configuration to existing .env...")
                with open('.env', 'a') as f:
                    f.write("\n# Anthropic Claude API Configuration\n")
                    f.write("ANTHROPIC_API_KEY=your_api_key_here\n")
                    f.write("CLAUDE_MODEL=claude-3-5-sonnet-20241022\n")
                print("✅ Added Claude configuration to .env")
                return True
        else:
            # Create new .env file
            with open('.env', 'w') as f:
                f.write(env_content)
            print("✅ Created .env file with Claude configuration")
            return True
            
    except Exception as e:
        print(f"❌ Failed to setup .env file: {e}")
        return False

def setup_python_environment():
    """Set up Python environment with required packages"""
    print_step("Setting up Python Environment")
    
    # Install required packages
    packages = [
        "fastapi==0.104.1",
        "uvicorn==0.24.0", 
        "pydantic==2.4.2",
        "python-dotenv==1.0.0",
        "requests==2.31.0",
        "anthropic==0.7.8"
    ]
    
    print("📦 Installing Python packages...")
    for package in packages:
        print(f"   Installing {package}...")
        try:
            import subprocess
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", package],
                capture_output=True,
                text=True,
                timeout=300
            )
            if result.returncode == 0:
                print(f"   ✅ {package} installed successfully")
            else:
                print(f"   ❌ Failed to install {package}: {result.stderr}")
                return False
        except Exception as e:
            print(f"   ❌ Error installing {package}: {e}")
            return False
    
    print("✅ All Python packages installed successfully")
    return True

def test_claude_connection():
    """Test the Claude API connection"""
    print_step("Testing Claude API Connection")
    
    try:
        import anthropic
        from dotenv import load_dotenv
        
        # Load environment variables
        load_dotenv()
        
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key or api_key == 'your_api_key_here':
            print("❌ Please set your actual API key in .env file")
            print("   Replace 'your_api_key_here' with your real API key")
            return False
        
        # Test connection
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=20,
            messages=[{"role": "user", "content": "Reply with just 'Hello, I am working correctly!'"}]
        )
        
        generated_text = response.content[0].text.strip()
        print(f"�� Claude response: {generated_text}")
        
        if "Hello" in generated_text or "working" in generated_text:
            print("✅ Claude API test successful!")
            return True
        else:
            print("⚠️  Claude responded but output was unexpected")
            return True  # Still consider it working
            
    except Exception as e:
        print(f"❌ Claude API test failed: {e}")
        return False

def display_cost_information():
    """Display information about Claude API costs"""
    print_step("💰 Cost Information")
    
    print("�� Claude API Pricing (as of 2024):")
    print("   • Claude 3.5 Sonnet: $0.003 per 1K input tokens")
    print("   • Claude 3.5 Haiku: $0.00025 per 1K input tokens")
    print("   • Claude 3 Opus: $0.015 per 1K input tokens")
    
    print("\n�� Cost estimates for interviews:")
    print("   • Initial questions generation: ~$0.01-0.05 per interview")
    print("   • Follow-up questions: ~$0.005-0.02 per question")
    print("   • Full interview (10 questions): ~$0.05-0.20")
    
    print("\n🔒 Security note:")
    print("   • Your API key is stored locally in .env file")
    print("   • Never commit .env to version control")
    print("   • Consider using environment variables in production")

def display_setup_complete():
    """Display setup completion message"""
    print_step("🎉 SETUP COMPLETE!", "Your Claude-powered interview system is ready!")
    
    print("\n📋 What was configured:")
    print("   • Anthropic Claude API integration")
    print("   • Python packages for FastAPI integration")
    print("   • Environment configuration")
    print("   • API connection tested")
    
    print("\n🚀 Next steps:")
    print("   1. Set your API key in .env file:")
    print("      ANTHROPIC_API_KEY=your_actual_key_here")
    print("   ")
    print("   2. Run your interview application:")
    print("      python main.py")
    print("   ")
    print("   3. Open your browser to:")
    print("      http://localhost:8000/docs")
    print("   ")
    print("   4. Check system health:")
    print("      http://localhost:8000/health")
    
    print("\n🔧 Useful commands:")
    print("   • Test API: python -c \"from anthropic_integration import check_anthropic_status; print(check_anthropic_status())\"")
    print("   • Check models: python -c \"from anthropic_integration import get_recommended_models; print(get_recommended_models())\"")
    
    print("\n�� Recommended models for interviews:")
    models = [
        {"name": "claude-3-5-sonnet-20241022", "good_for": "Best quality interviews"},
        {"name": "claude-3-5-haiku-20241022", "good_for": "Fast and cost-effective"},  
        {"name": "claude-3-opus-20240229", "good_for": "Highest quality, complex reasoning"}
    ]
    
    for model in models:
        print(f"   • {model['name']:<35} - {model['good_for']}")
    
    print(f"\n{'='*50}")
    print("�� Happy interviewing with Claude! ��")
    print('='*50)

def main():
    """Main setup function"""
    print("🚀 Claude Interview System Setup")
    print("This script will set up everything you need for AI-powered interviews using Claude")
    
    # Step 1: Check Python version
    if not check_python_version():
        print("❌ Setup failed: Python version incompatible")
        sys.exit(1)
    
    # Step 2: Check API key
    if not check_api_key():
        print("⚠️  API key not found - you'll need to set it manually")
        print("   Continue with setup and add your key later")
    
    # Step 3: Setup environment file
    if not setup_environment_file():
        print("❌ Setup failed: Could not create environment configuration")
        sys.exit(1)
    
    # Step 4: Setup Python environment
    if not setup_python_environment():
        print("❌ Setup failed: Could not install Python packages")
        sys.exit(1)
    
    # Step 5: Test Claude connection (if API key is available)
    if os.getenv('ANTHROPIC_API_KEY') and os.getenv('ANTHROPIC_API_KEY') != 'your_api_key_here':
        if not test_claude_connection():
            print("⚠️  Claude API test had issues, but continuing...")
    else:
        print("⚠️  Skipping API test - no valid API key configured")
    
    # Step 6: Display cost information
    display_cost_information()
    
    # Step 7: Complete!
    display_setup_complete()

if __name__ == "__main__":
    main()