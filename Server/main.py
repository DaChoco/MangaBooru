#AWS
import boto3 as aws
import botocore.exceptions

#MYSQL
import mysql.connector

#SECURITY
import bcrypt
import uuid
import jwt

#ENV FILES
from dotenv import load_dotenv
import os

#FASTAPI
import uvicorn
from fastapi import FastAPI, HTTPException, Body, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

#Getting ENV files
load_dotenv()

passwd = os.getenv("passwd")
username = os.getenv("username")
db = os.getenv("db")
hostplace = os.getenv("host")

BUCKET_NAME = os.getenv("bucket")
AMAZON_USERNAME = os.getenv("AMAZON_USERNAME")

PERSONAL_IP = os.getenv("PERSONAL_IP")


#MYSQL CONNECTING FUNCTION
def createConnection():
    try:
        conn = mysql.connector.connect(host=hostplace,
                               port=3306,
                               database=db,
                               password=passwd,
                               user=username,
                               auth_plugin='mysql_native_password')
        print("CONNECTED!")
        return conn
    except mysql.ConnectionRefusedError as e:
        print(f"This connection was refused: {e}")
#END OF CONNECTIONS - Further MYSQL shall be handled within the APIs

#AWS
session = aws.Session(profile_name=AMAZON_USERNAME)

s3 = session.client("s3")

def presignedurls( object, expiration= 3600 ):
    try:
        print("haha")
        url = s3.generate_presigned_url("get_object",
                                  Params={"Bucket": BUCKET_NAME, "Key": object},
                                  expiresin=expiration)
        if url:
            print("Transaction complete")
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

#Security - Hashing password function
def hashPassword(passwd:str):
    password_bytes = passwd.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def verifyPassword(normalpasswd: str, hashedpasswd: str):
    return bcrypt.checkpw(normalpasswd.encode("utf-8"), hashedpasswd.encode("utf-8"))
#Will be used in a register and login function

#Models used to extract jsons

class LoginRequest(BaseModel):
    email: str
    passwd: str

class RegisterRequest(BaseModel):
    email: str
    passwd: str
    username: str

class CreateSeries(BaseModel): #will use the upload series function
    seriesname: str
    seriesdesc: str

#MY API ROUTES - SETUP

app = FastAPI()

ORIGINS = ["http://127.0.0.1:80",
           "https://127.0.0.1:443", 
           "http://127.0.0.1:3000", 
           "http://127.0.0.1:3306",
           PERSONAL_IP] 

app.add_middleware(CORSMiddleware,
                   allow_origins=ORIGINS,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"]
                   )

#MY API ROUTES - THE ROUTES THEMSELVES (Login and Register will be POST later. Just testing.):

@app.post("/login")
def login(data: LoginRequest):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    hashed_password = hashPassword(data.passwd)

    SQLParams = (data.email,)

    try:
        cursor.execute("SELECT userID, userName, password FROM tblUsers WHERE email = %s", SQLParams)
        output = cursor.fetchone()
        if output:
            if verifyPassword(data.passwd, hashed_password) == True:
                return {"Message": "Success, you are successfully logged in!", "username": output["userName"]}
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")

        else:
            return {"Message": "Incorrect username or password."}
          
    except mysql.connector.Error:
        return {"Message": "Apologies, an new error has occured. Please try again later"}
    except TypeError:
        return {"Message": "Please type something for the email or the password"}
    finally: 
        conn.close()
    
    

@app.post("/register")
def register(data: RegisterRequest):
        
        conn = createConnection()
        cursor = conn.cursor(dictionary=True)

        exist_user = cursor.execute("SELECT userName FROM tblUsers where email = %s or userName = %s", (data.email, data.username))

        if exist_user:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username or email already taken, please take another one")

        hashed_password = hashPassword(data.passwd)

        SQL_Params = (data.username, 0, data.username, hashed_password)

        try:
            cursor.execute("""INSERT INTO tblUsers 
                           (userName, seriesUploaded, email, password) VALUES
                           (%s, %s, %s, %s)""", SQL_Params)
            
            return {"Message": "User successfully registered."}
        except TypeError as e:
            conn.rollback()
            return {"Message": f"Apologies, you have entered an invalid input: {e}"}
          
        except mysql.connector.DatabaseError as e:
            conn.rollback()
            return {"Message": f"Apologies, a new database error has occured: {e}"}
        finally:
            conn.close()

@app.get("/getuser")
def getUser():
    return {"Message": "Success, you are successfully registered!"}

@app.get("/returnBooruPics")
def getUrls():
    listURLS = []
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM tblseries")
    data = cursor.fetchall()

    for row in data:
        listURLS.append(row["url"])
    
    if not data:
        raise HTTPException(status.HTTP_404_INTERNAL_SERVER_ERROR, detail="Unable to retrieve images due to a lack of urls")
    else:
        cursor.close()
        conn.close()
        return {"urls": listURLS} #Functional

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

#MY JS app, will be commnicating from port 3000 specifically

