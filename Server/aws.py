#AWS
import boto3 as aws
from mypy_boto3_s3 import S3Client
from mypy_boto3_dynamodb import DynamoDBClient
import botocore.exceptions
from botocore.client import Config
from datetime import datetime, timezone
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

def insert_user_comment(user_id: str, comment: str, table_name: str, page_id: str, userIcon: str, userName: str):
    #Page ID references a specific series aka series ID
    try:
        my_uuid = str(uuid.uuid4())
        print("Inserting comment...")
        response = dynamoDB.put_item(
            TableName=table_name,
            Item={
                "page_id": {'S': page_id},
                'user_id': {'S': user_id},
                'comment_text': {'S': comment},
                'timestamp': {'S': str(datetime.now(timezone.utc))},
                "usericon": {'S': userIcon},
                "userName": {'S': userName},
                "upvotes": {'N': str(0)},
                "downvotes": {'N': str(0)},
                "comment_id": {'S': my_uuid}
            }
        )
        print("Success!")

        return {"userID": user_id,
                "commentText": comment,
                "timestamp": str(datetime.now()),
                "seriesID": page_id,
                "usericon": userIcon,
                "username": userName,
                "upvotes": 0,
                "downvotes": 0,
                "commentID": my_uuid}
    except botocore.exceptions.ClientError as e:
        print(f"An error occurred: {e.response['Error']['Message']}")
        return False
    
def retrieve_user_comments_list(table_name: str, page_id: str):
    print("Page ID: ", page_id)
    try:
        response = dynamoDB.query(
            TableName=table_name,
            KeyConditionExpression='page_id = :pid',
            ExpressionAttributeValues={
                ':pid': {'S': page_id},
   
            }
        )
        #We will output this as an array of dict

        

        list_comments = []
        for item in response['Items']:
            comment = {
                "userID": item["user_id"]['S'],
                "commentText": item['comment_text']['S'],
                "timestamp": item['timestamp']['S'],
                "seriesID": item['page_id']['S'],
                "upvotes": item['upvotes']['N'],
                "userName": item['userName']['S'],
                "downvotes": item['downvotes']['N'],
                "usericon": item["usericon"]['S'],
                "commentID": item["comment_id"]['S']
            }
            list_comments.append(comment)
     
        if list_comments == []:
            return {"message": "No comments on this page"}

        return list_comments
    except botocore.exceptions.ClientError as e:
        print(f"An error occurred: {e.response['Error']['Message']}")
        return {"error_message": "Something has gone wrong, please try again later"}
    except botocore.exceptions.ParamValidationError as e:
        print(print(f"An error has occured: {e.response['Error']['Message']}. Full details: {e.response['ResponseMetadata']}"))
        return {"error_message": "Something has gone wrong, please try again later. Params"}
    except Exception as e:
        print("Error: ", e)
    
def incrementPostVotes(table_name: str, timestamp: str, seriesID: str, userID: str, category: str):
    try:

        voteID = f"{timestamp}-{seriesID}-{userID}"
        #check if already voted
        check = dynamoDB.get_item(TableName="Mangabooru-Votes", Key={
            "vote_id": {'S': str(voteID)}
        })

        if "Item" in check:
        
            if check['Item']['vote_type']['S'] == category:
            #prevents repeat votes
                return {"message": "This user has voted the same way before", "reply": False}
            else: 
                opposite_vote_type = check["Item"]['vote_type']['S']

                response = dynamoDB.update_item(TableName=table_name, Key={
                'page_id': {'S': seriesID},
                'timestamp': {'S': timestamp}}, 
                UpdateExpression=f"SET {opposite_vote_type} = {opposite_vote_type} - :incval",
                ExpressionAttributeValues={":incval": {"N": str(1)}},
                ReturnValues="UPDATED_NEW"
                )

        
        response = dynamoDB.update_item(TableName=table_name, Key={
            'page_id': {'S': seriesID},
            'timestamp': {'S': timestamp}}, 
            UpdateExpression=f"SET {category} = {category} + :incval",
            ExpressionAttributeValues={":incval": {"N": str(1)}},
            ReturnValues="UPDATED_NEW"
            )
    
        dynamoDB.put_item(TableName="Mangabooru-Votes", 
        Item={
            'vote_id': {'S': str(voteID)},
            'timestamp': {'S': str(datetime.now())},
            "user_id": {'S': str(userID)},
            "vote_type": {'S': category}
        })
        
        return {"new_votes": response["Attributes"][category]['N'], "reply": True}
        
    except botocore.exceptions.ClientError as e:
        print(f"An error has occured: {e.response['Error']['Message']}. Full details: {e.response['ResponseMetadata']}")
    except botocore.exceptions.ParamValidationError as e:
        print(print(f"An error has occured: {e.response['Error']['Message']}. Full details: {e.response['ResponseMetadata']}"))
    except Exception as e:
        print("Error: ", e)
        


#END OF AWS