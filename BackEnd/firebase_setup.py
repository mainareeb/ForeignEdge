import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import base64

load_dotenv()

# Firebase credentials from .env - use JSON file for now
cred = credentials.Certificate('./firebase_config.json')
firebase_admin.initialize_app(cred)

# Firestore database instance
db = firestore.client()

