import sys, os

APP_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, APP_DIR)
os.chdir(APP_DIR)

# Load .env BEFORE importing app
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(APP_DIR, ".env"))
except Exception as e:
    print(f"[passenger_wsgi] dotenv load skipped: {e}")

from app import app as application   # noqa: E402