#AWS
import boto3 as aws
import botocore.exceptions
from botocore.client import Config
import uuid

#Getting ENV files
from vars import AMAZON_USERNAME, BUCKET_NAME, BUCKET_PREFIX
session = aws.Session(profile_name=AMAZON_USERNAME)

s3 = session.client("s3",
                    config=Config(signature_version='s3v4'),
                    region_name="af-south-1",
                    endpoint_url="https://s3.af-south-1.amazonaws.com")

def mass_presignedurls(key: str, expiration: int ):
    try:
        print(f"Producing presigned url for: {key}")
        url = s3.generate_presigned_url("get_object",
                                  Params={"Bucket": BUCKET_NAME, "Key": key},
                                  ExpiresIn=expiration)
    
        return url
    except botocore.exceptions.NoCredentialsError as e:
        print(f"You lack the credentials to follow through with this request: {e}")
    except botocore.exceptions.ClientError as e:
        print(f"An unforseen error has occured: {e}")

def extractObjectKey(url:str):
    return url.split(".com/")[-1]


def uploadImage():
    UUID_Name = str(uuid.uuid4())
    OBJECT_NAME = f"TestingFiles/{UUID_Name}.png"
    IMAGE_PATH = r""
    try:
        print("Uploading...")
        s3.upload_file(IMAGE_PATH, BUCKET_NAME, OBJECT_NAME)
        print("Upload complete!")
    
    except Exception as e:
        print(str(e))
       

#END OF AWS