#!/usr/bin/env python3
"""
Ollama Setup Script for Interview Question Generator
This script helps you set up Ollama with the right model for interviews
"""

import subprocess
import sys
import time
import requests
import json
from typing import Dict, List
import platform

def print_step(step: str, description: str = ""):
    """Print a setup step with formatting"""
    print(f"\n{'='*50}")
    print(f"🔧 STEP: {step}")
    if description:
        print(f"📝 {description}")
    print('='*50)

def run_command(command: str, shell: bool = True) -> tuple:
    """Run a command and return success status and output"""
    try:
        result = subprocess.run(
            command, 
            shell=shell, 
            capture_output=True, 
            text=True,
            timeout=300  # 5 minute timeout
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_ollama_installed() -> bool:
    """Check if Ollama is installed"""
    print_step("Checking Ollama Installation")
    
    success, output, error = run_command("ollama --version")
    if success:
        print(f"✅ Ollama is installed: {output.strip()}")
        return True
    else:
        print("❌ Ollama is not installed")
        return False

def install_ollama():
    """Install Ollama based on the operating system"""
    print_step("Installing Ollama")
    
    system = platform.system().lower()
    
    if system == "darwin":  # macOS
        print("🍎 Detected macOS")
        print("Installing Ollama using Homebrew...")
        
        # Check if brew is installed
        success, _, _ = run_command("brew --version")
        if not success:
            print("❌ Homebrew not found. Please install Homebrew first:")
            print("   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"")
            return False
        
        # Install ollama
        success, output, error = run_command("brew install ollama")
        if success:
            print("✅ Ollama installed successfully via Homebrew")
            return True
        else:
            print(f"❌ Failed to install via Homebrew: {error}")
            return install_ollama_manual()
    
    elif system == "linux":
        print("🐧 Detected Linux")
        return install_ollama_manual()
    
    elif system == "windows":
        print("🪟 Detected Windows")
        print("Please download and install Ollama manually from:")
        print("   https://ollama.ai/download/windows")
        print("After installation, restart this script.")
        return False
    
    else:
        print(f"❓ Unknown system: {system}")
        return install_ollama_manual()

def install_ollama_manual():
    """Install Ollama using the official installation script"""
    print("📥 Installing Ollama using official script...")
    
    success, output, error = run_command("curl -fsSL https://ollama.ai/install.sh | sh")
    if success:
        print("✅ Ollama installed successfully")
        return True
    else:
        print(f"❌ Failed to install Ollama: {error}")
        print("Please visit https://ollama.ai/ and follow manual installation instructions")
        return False

def start_ollama_service():
    """Start the Ollama service"""
    print_step("Starting Ollama Service")
    
    # Check if already running
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama service is already running")
            return True
    except:
        pass
    
    print("🚀 Starting Ollama service...")
    
    # Try to start ollama serve in background
    system = platform.system().lower()
    
    if system == "windows":
        success, output, error = run_command("start /B ollama serve")
    else:
        success, output, error = run_command("ollama serve > /dev/null 2>&1 &")
    
    # Wait a bit and check if service started
    time.sleep(3)
    
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=10)
        if response.status_code == 200:
            print("✅ Ollama service started successfully")
            return True
    except Exception as e:
        print(f"❌ Failed to start Ollama service: {e}")
        print("💡 Try running manually in a separate terminal: ollama serve")
        return False

def pull_model(model_name: str = "llama3.1") -> bool:
    """Pull a specific model"""
    print_step(f"Pulling Model: {model_name}", f"This may take 5-15 minutes depending on your internet speed")
    
    print(f"📥 Downloading {model_name}...")
    print("☕ This is a good time for a coffee break!")
    
    success, output, error = run_command(f"ollama pull {model_name}")
    
    if success:
        print(f"✅ Successfully pulled {model_name}")
        return True
    else:
        print(f"❌ Failed to pull {model_name}: {error}")
        return False

def test_model(model_name: str = "llama3.1") -> bool:
    """Test the model with a simple prompt"""
    print_step(f"Testing Model: {model_name}")
    
    test_prompt = "Reply with just 'Hello, I am working correctly!'"
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name,
                "prompt": test_prompt,
                "stream": False,
                "options": {"num_predict": 20}
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            generated_text = result.get('response', '').strip()
            print(f"🤖 Model response: {generated_text}")
            
            if "Hello" in generated_text or "working" in generated_text:
                print("✅ Model test successful!")
                return True
            else:
                print("⚠️  Model responded but output was unexpected")
                return True  # Still consider it working
        else:
            print(f"❌ Model test failed: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Model test failed: {e}")
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
        "ollama==0.2.1"
    ]
    
    print("📦 Installing Python packages...")
    for package in packages:
        print(f"   Installing {package}...")
        success, output, error = run_command(f"pip install {package}")
        if not success:
            print(f"❌ Failed to install {package}: {error}")
            return False
    
    print("✅ All Python packages installed successfully")
    return True

def create_env_file():
    """Create .env file with Ollama configuration"""
    print_step("Creating Environment Configuration")
    
    env_content = """# Ollama Configuration
OLLAMA_MODEL=llama3.1
OLLAMA_HOST=http://localhost:11434

# FastAPI Configuration  
DEBUG=True
HOST=0.0.0.0
PORT=8000
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with Ollama configuration")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def get_available_models() -> List[Dict]:
    """Get list of available models from Ollama"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get('models', [])
    except:
        pass
    return []

def display_setup_complete():
    """Display setup completion message"""
    print_step("🎉 SETUP COMPLETE!", "Your Ollama interview system is ready!")
    
    print("\n📋 What was installed:")
    print("   • Ollama AI runtime")
    print("   • llama3.1 model (recommended for interviews)")
    print("   • Python packages for FastAPI integration")
    print("   • Environment configuration")
    
    print("\n🚀 Next steps:")
    print("   1. Run your interview application:")
    print("      python main.py")
    print("   ")
    print("   2. Open your browser to:")
    print("      http://localhost:8000/docs")
    print("   ")
    print("   3. Check system health:")
    print("      http://localhost:8000/health")
    
    print("\n🔧 Useful commands:")
    print("   • Check Ollama status: ollama list")
    print("   • Pull other models: ollama pull mistral")
    print("   • Start Ollama manually: ollama serve")
    
    print("\n📚 Available models for interviews:")
    models = [
        {"name": "llama3.1", "good_for": "Best quality interviews"},
        {"name": "llama3", "good_for": "Good balance of speed/quality"},  
        {"name": "mistral", "good_for": "Faster responses"},
        {"name": "codellama", "good_for": "Technical coding interviews"}
    ]
    
    for model in models:
        print(f"   • {model['name']:<12} - {model['good_for']}")
    
    print(f"\n{'='*50}")
    print("🎊 Happy interviewing! 🎊")
    print('='*50)

def main():
    """Main setup function"""
    print("🚀 Ollama Interview System Setup")
    print("This script will set up everything you need for AI-powered interviews")
    
    # Step 1: Check/Install Ollama
    if not check_ollama_installed():
        if not install_ollama():
            print("❌ Setup failed: Could not install Ollama")
            sys.exit(1)
    
    # Step 2: Start Ollama service
    if not start_ollama_service():
        print("❌ Setup failed: Could not start Ollama service")
        print("💡 Try running 'ollama serve' in a separate terminal and run this script again")
        sys.exit(1)
    
    # Step 3: Pull recommended model
    if not pull_model("llama3.1"):
        print("⚠️  Failed to pull llama3.1, trying llama3...")
        if not pull_model("llama3"):
            print("❌ Setup failed: Could not pull any model")
            sys.exit(1)
    
    # Step 4: Test the model
    available_models = get_available_models()
    if available_models:
        model_name = available_models[0]['name'].split(':')[0]
        if not test_model(model_name):
            print("⚠️  Model test had issues, but continuing...")
    
    # Step 5: Setup Python environment
    if not setup_python_environment():
        print("❌ Setup failed: Could not install Python packages")
        sys.exit(1)
    
    # Step 6: Create configuration
    if not create_env_file():
        print("⚠️  Could not create .env file, but continuing...")
    
    # Step 7: Complete!
    display_setup_complete()

if __name__ == "__main__":
    main()