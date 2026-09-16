# reauth_gmail.py
import os
import sys
import pickle

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
sys.path.insert(0, script_dir)

from gmail_service import GmailService

# Delete the existing token file
token_file = 'token_pemnet26_gmail_com.pickle'
if os.path.exists(token_file):
    os.remove(token_file)
    print(f"✅ Deleted {token_file}")
else:
    print(f"⚠️ {token_file} not found")

# Re-authenticate
print("🔄 Re-authenticating Gmail...")
try:
    gmail = GmailService(target_email='pemnet26@gmail.com')
    print("✅ Gmail re-authentication successful!")
except Exception as e:
    print(f"❌ Error: {e}")