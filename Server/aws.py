#AWS
import boto3 as aws
from mypy_boto3_s3 import S3Client
from mypy_boto3_dynamodb import DynamoDBClient
import botocore.exceptions
from botocore.client import Config
from boto3.dynamodb.types import TypeDeserializer
from datetime import datetime
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



def uploadImage(image_file, item_name, bucket_name: str, directory: str):
#uploads images to S3. Will be profile pictures for the site
    try:
        print("Uploading...")
        s3.upload_fileobj(image_file, bucket_name, f"{directory}/{item_name}")
        print("Upload complete!")
    
    except Exception as e:
        print(str(e))
       
def deleteImage(url:str, bucket_txt:str):
    parsed_url = urlparse(url)
    object_key = parsed_url.path.lstrip("/")

    try:
        print("Deleting...")
        s3.delete_object(Bucket=bucket_txt, Key=object_key)
        print(f"Deletion complete! Object: {object_key}")
    except botocore.exceptions as e:
        print("Deletion failed")

#---------END OF S3 START OF DYNAMO

dynamoDB: DynamoDBClient = session.client("dynamodb",
                    region_name="af-south-1",
                    endpoint_url="https://dynamodb.af-south-1.amazonaws.com")

def insert_user_comment(user_id: str, comment: str, table_name: str, page_id: str, userIcon: str):
    #Page ID references a specific series aka series ID
    try:
        print("Inserting comment...")
        response = dynamoDB.put_item(
            TableName=table_name,
            Item={
                'user_id': {'S': user_id},
                'comment_text': {'S': comment},
                'timestamp': {'S': str(datetime.now())},
                "commented_on_page": {'S': page_id},
                "usericon": {'S', userIcon}
            }
        )
        print("Success!", response)
        return True
    except botocore.exceptions.ClientError as e:
        print(f"An error occurred: {e.response['Error']['Message']}")
        return False
    
def retrieve_user_comments_list(table_name: str, page_id: str):
    try:
        response = dynamoDB.query(
            TableName=table_name,
            KeyConditionExpression='page_id = :pid',
            ExpressionAttributeValues={
                ':pid': {'S': page_id}
            }
        )
        #We will output this as an array of dict

        list_comments = []
        for item in response['Items']:
            comment = {
                "userID": item["user_id"]['S'],
                "comment_text": item['comment_text']['S'],
                "timestamp": item['timestamp']['S'],
                "seriesID": item['commented_on_page']['S']
            }
            list_comments.append(comment)

        return list_comments
    except botocore.exceptions.ClientError as e:
        print(f"An error occurred: {e.response['Error']['Message']}")
        return {"error_message": "Something has gone wrong, please try again later"}

#END OF AWS