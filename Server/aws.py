#AWS
import boto3 as aws
from mypy_boto3_s3 import S3Client
import botocore.exceptions
from botocore.client import Config
from urllib.parse import urlparse
import uuid

#Getting ENV files
from vars import AMAZON_USERNAME, BUCKET_NAME, BUCKET_PREFIX
session = aws.Session(profile_name=AMAZON_USERNAME)

s3: S3Client = session.client("s3",
                    config=Config(signature_version='s3v4'),
                    region_name="af-south-1",
                    endpoint_url="https://s3.af-south-1.amazonaws.com")

def mass_presignedurls(key: str, expiration: int ):
#generates presigned urls
    try:
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

def get_public_s3(object_key):
     return f"https://{BUCKET_NAME}.s3.af-south-1.amazonaws.com/{object_key}"



def uploadImage(image_file, item_name):
#uploads images to S3. Will be profile pictures for the site
    try:
        print("Uploading...")
        s3.upload_fileobj(image_file, "publicboorufiles-01", f"userIcons/{item_name}")
        print("Upload complete!")
    
    except Exception as e:
        print(str(e))
       
def deleteImage(url:str):
    parsed_url = urlparse(url)
    object_key = parsed_url.path.lstrip("/")

    try:
        print("Deleting...")
        s3.delete_object(Bucket="publicboorufiles-01", Key=object_key)
        print(f"Deletion complete! Object: {object_key}")
    except botocore.exceptions as e:
        print("Deletion failed")

#END OF AWS