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

    try:
        print("Uploading...")
        with open(image_file, "rb"):
            s3.Bucket("publicboorufiles-01").upload_fileobj(image_file, f"userIcons/{item_name}")
        print("Upload complete!")
    
    except Exception as e:
        print(str(e))
       

#END OF AWS