#MYSQL
import mysql.connector

#SECURITY
import bcrypt
import jwt

#FASTAPI
import uvicorn
from fastapi import FastAPI, HTTPException, Body, Request, Response, status, Query
from fastapi.middleware.cors import CORSMiddleware
from models import LoginRequest, RegisterRequest, CreateSeries, CreateTag, SearchRequest

#Getting ENV files
from vars import hostplace, db, passwd, username, PERSONAL_IP

#MYSQL CONNECTING FUNCTION
def createConnection():
    try:
        conn = mysql.connector.connect(host=hostplace,
                               port=3306,
                               database=db,
                               password=passwd,
                               user=username,
                               auth_plugin='mysql_native_password')
        return conn
    except mysql.ConnectionRefusedError as e:
        print(f"This connection was refused: {e}")
#END OF CONNECTIONS - Further MYSQL shall be handled within the APIs

#Security - Hashing password function
def hashPassword(passwd:str):
    password_bytes = passwd.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def verifyPassword(normalpasswd: str, hashedpasswd: str):
    return bcrypt.checkpw(normalpasswd.encode("utf-8"), hashedpasswd.encode("utf-8"))
#Will be used in a register and login function



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

#MY API ROUTES - THE ROUTES THEMSELVES :


#------------------------------------------------ CRITICAL! IMPLEMENT JWT!
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
                return {"message": "Success, you are successfully logged in!", "username": output["userName"]}
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")

        else:
            return {"message": "Incorrect username or password."}
          
    except mysql.connector.Error:
        return {"message": "Apologies, an new error has occured. Please try again later"}
    except TypeError:
        return {"message": "Please type something for the email or the password"}
    finally: 
        cursor.close()
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
            
            return {"message": "User successfully registered."}
        except TypeError as e:
            conn.rollback()
            return {"message": f"Apologies, you have entered an invalid input: {e}"}
          
        except mysql.connector.DatabaseError as e:
            conn.rollback()
            return {"message": f"Apologies, a new database error has occured: {e}"}
        finally:
            cursor.close()
            conn.close()

#---------------------------------------------------------------------------END OF CRITICAL
@app.get("/")
def index():
    return {"message": "Welcome to Mangabooru, hope you enjoy your stay"}

@app.get("/getuser")
def getUser():
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT userID, userName FROM tblUsers WHERE userID = %s")
        output = cursor.fetchone()

        return {"message": "Success, you are successfully registered!", 
                "userID": output["userID"],
                "userName": output["userName"]} #is used on reload if signed in
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        return {"message": "Apologies, but you do not appear to be logged in to do this action"}
    finally:
        cursor.close()
        conn.close()

@app.get("/returnBooruPics")
def getUrls():
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM tblseries")
    data = cursor.fetchall()
    print(data)
    if not data:
        raise HTTPException(status.HTTP_404_INTERNAL_SERVER_ERROR, detail="Unable to retrieve images due to a lack of urls")
    else:
        cursor.close()
        conn.close()
        return data #Functional will be used for general browswing
    
@app.get("/returnMangaInfo") #general info
def extractInfo():
    conn = createConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("""SELECT tblSeries.seriesID, seriesName, url FROM tblSeries""") 
        output = cursor.fetchall()

        if not output:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Not found within the database")
        else:
            return output
    #This is used so that when you click on an image, it can be matched to the appropriate info with the below route. 
    # This will be used on load?
    except mysql.connector.DatabaseError as e:
        return {"message": f"An error has occured {e}"}
    finally:
            cursor.close()
            conn.close()

@app.get("/returnMangaInfo/{seriesname}") #is added to a tag div
def seriesExtract(seriesname):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """SELECT tagName FROM tbltags INNER JOIN 
        tblSeries ON tbltags.tagID = tbltagseries.tagID 
        WHERE tblSeries.seriesName = %s""", (seriesname))
    
    output_tags = cursor.fetchall()
    return output_tags

#uploads ------------------------------------------------------

@app.post("/uploadTag")
def tagInsert(data: CreateTag):
    SQL_Params = (data.tagname, data.tagdesc)

    conn = createConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO tbltags (tagName, tagDesc) VALUES (%s, %s)", SQL_Params)
        conn.commit()
        return {"message": "Successfully added. Thank you!"}
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        return {"message": f"The server has experienced an error: {e}"}
    except TypeError:
        return {"message": "The server has experienced an error, please try again later"}
    finally:
        conn.close()

@app.post("/uploadSeries")
def seriesInsert(data: CreateSeries):
    SQL_Params = (data.seriesname, data.seriesdesc)

    conn = createConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO tblSeries (seriesName, seriesDesc) VALUES (%s, %s)", SQL_Params)
        conn.commit()
        return {"message": "Series successfully added. Thank you!"}
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        return {"message": f"The server has experienced an error: {e}"}
    except TypeError:
        return {"message": "The server has experienced an error, please try again later"}
    finally:
        conn.close()

#Search -----------------------------------

@app.get("/search")
def Search(query: str = Query(..., min_length=4)):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    try:
        SQL_QUERY = """
        SELECT seriesName, tagName FROM tblseries INNER JOIN tbltags ON tbltags.tagID = tbltagseries.tagID
        INNER JOIN tbltagseries ON tblSeries.seriesID = tbltagseries.seriesID
        WHERE MATCH(seriesName) AGAINST (%s IN NATURAL LANGUAGE MODE) OR tagName Like %s LIMIT 10 """ 
 
        cursor.execute(SQL_QUERY, ({query}, f"{query}%" ))
        rows = cursor.fetchall()
        return {"results": rows}
    except mysql.connector.DatabaseError:
        return {"message": "The server has experienced an error, please try again later"}
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

#MY JS app, will be commnicating from port 5173 specifically

