#ENV FILES
from dotenv import load_dotenv
import os

load_dotenv(override=True)

passwd = os.getenv("passwd")
username = os.getenv("username")
db = os.getenv("db")
hostplace = os.getenv("host_local")

HOSTWEB = os.getenv("host_web")

BUCKET_NAME = os.getenv("bucket")
AMAZON_USERNAME = os.getenv("AMAZON_USERNAME")
BUCKET_PREFIX = os.getenv("BUCKET_PREFIX")
PUBLIC_BUCKET = os.getenv("PUBLIC_BUCKET")

PERSONAL_IP = os.getenv("PERSONAL_IP")

API_KEY_TAGS = os.getenv("API_KEY_TAGS")
BASE_URL = os.getenv("BASE_URL")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")