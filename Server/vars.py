#ENV FILES
from dotenv import load_dotenv
import os

load_dotenv()

passwd = os.getenv("passwd")
username = os.getenv("username")
db = os.getenv("db")
hostplace = os.getenv("host")

BUCKET_NAME = os.getenv("bucket")
AMAZON_USERNAME = os.getenv("AMAZON_USERNAME")
BUCKET_PREFIX = os.getenv("BUCKET_PREFIX")

PERSONAL_IP = os.getenv("PERSONAL_IP")