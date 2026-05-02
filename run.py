import subprocess
import time
import webbrowser
import os
import sys
import socket
from concurrent.futures import ThreadPoolExecutor

# ── Configuration ─────────────────────────────────────────────
BACKEND_URL = "http://localhost:8000/api/v1/health/ready"
FRONTEND_URL = "http://localhost:5173/chat"
REQUIRED_ENV_VARS = ["GROQ_API_KEY", "DATABASE_URL", "REDIS_URL"]

def print_banner():
    print("=" * 60)
    print("      🚀 DocuMind — Master Controller Script 🚀")
    print("=" * 60)

def check_env():
    """Verify that .env exists and contains required variables."""
    print("[1/5] Validating environment...")
    if not os.path.exists(".env"):
        print("❌ ERROR: .env file not found in root directory!")
        sys.exit(1)
    
    with open(".env", "r") as f:
        content = f.read()
        for var in REQUIRED_ENV_VARS:
            if var not in content or f"{var}=" not in content:
                print(f"⚠️  WARNING: {var} might be missing from .env")
    print("✅ Environment check complete.")

def start_docker():
    """Start the infrastructure using Docker Compose."""
    print("[2/5] Starting backend infrastructure (Postgres, Redis, API)...")
    try:
        # detached mode so it doesn't block
        subprocess.run(["docker", "compose", "up", "-d"], check=True)
        print("✅ Docker containers are scaling up.")
    except Exception as e:
        print(f"❌ ERROR: Failed to start Docker Compose: {e}")
        sys.exit(1)

def start_frontend():
    """Start the Vite frontend in a new terminal window (Windows)."""
    print("[3/5] Launching frontend development server...")
    try:
        # Use 'start cmd' on Windows to open a new window for the frontend logs
        frontend_dir = os.path.join(os.getcwd(), "frontend")
        command = f'start cmd /k "cd /d {frontend_dir} && npm run dev"'
        subprocess.run(command, shell=True, check=True)
        print("✅ Frontend logs opened in a separate window.")
    except Exception as e:
        print(f"❌ ERROR: Failed to launch frontend: {e}")
        # Logic to fallback to same window if start cmd fails
        pass

def wait_for_backend():
    """Wait until the backend health check returns 200."""
    print("[4/5] Waiting for Backend API to become healthy...")
    max_retries = 30
    for i in range(max_retries):
        try:
            # We use a simple socket check or curl-like logic
            import urllib.request
            with urllib.request.urlopen(BACKEND_URL, timeout=2) as response:
                if response.status == 200:
                    print("\n✅ Backend is healthy and ready!")
                    return True
        except:
            print(".", end="", flush=True)
            time.sleep(2)
    
    print("\n❌ ERROR: Backend failed to start within time limit.")
    return False

def launch_browser():
    """Open the application in the default web browser."""
    print("[5/5] Launching DocuMind in your browser...")
    time.sleep(1) # Final buffer
    webbrowser.open(FRONTEND_URL)
    print("\n" + "=" * 60)
    print("🎉 DocuMind is LIVE! Good luck with your demo!")
    print("=" * 60)
    print("\nPress Ctrl+C to stop services (Docker will keep running in background).")

def main():
    print_banner()
    check_env()
    start_docker()
    start_frontend()
    
    if wait_for_backend():
        launch_browser()
        
        # Keep the main thread alive so the script doesn't just exit
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down controller...")
            # Note: We don't 'docker compose down' by default to keep DB state warm
            # but you can add it if requested.
            sys.exit(0)

if __name__ == "__main__":
    main()
