#MYSQL
import mysql.connector

from itertools import batched, chain

#SECURITY
import bcrypt
import jwt

#FASTAPI
import uvicorn
from fastapi import FastAPI, HTTPException, Body, Request, Response, status, Query
from fastapi.middleware.cors import CORSMiddleware
from models import LoginRequest, RegisterRequest, CreateSeries, CreateTag, SearchRequest

#AWS
from aws import mass_presignedurls

#Getting ENV files
from vars import hostplace, db, passwd, username, PERSONAL_IP, BUCKET_PREFIX

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

ORIGINS = ["http://localhost:80",
           "https://localhost:443", 
           "http://localhost:5173", 
           "http://localhost:3306",
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

#---------------------------------------------------------------------------END OF CRITICAL -BEGIN GENERAL
@app.get("/")
def index():
    return {"message": "Welcome to Mangabooru, hope you enjoy your stay"}

@app.get("/getuser") #Will be used to extract JWT Tokens later
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

@app.get("/returnBooruPics/{Page}")
def getUrls(Page: int):
    Page = Page - 1
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

#Extracts the image whether it has tags or not, but also gets tags - Cant use outer joins since this is not Post gres. Came up with an alternative
    SQL_PARAM_NO_TAG_INCLUDED = """ 
SELECT url, thumbnail, group_concat(DISTINCT tagName order by tagName) as tagName
FROM tblseries 
LEFT JOIN tbltagseries ON tbltagseries.seriesID = tblSeries.seriesID
LEFT JOIN tbltags ON tbltagseries.tagID = tbltags.tagID
WHERE thumbnail IS NOT NULL GROUP BY url, thumbnail
UNION
SELECT url, thumbnail, GROUP_CONCAT(DISTINCT tagName order by tagName) as tagName
FROM tblseries 
RIGHT JOIN tbltagseries ON tbltagseries.seriesID = tblSeries.seriesID
RIGHT JOIN tbltags ON tbltagseries.tagID = tbltags.tagID
WHERE thumbnail IS NOT NULL GROUP BY url, thumbnail ORDER BY url DESC
"""

    cursor.execute(SQL_PARAM_NO_TAG_INCLUDED) #returns the urls/keys
    data = cursor.fetchall()

    
    
    if not data:
        raise HTTPException(status.HTTP_404_INTERNAL_SERVER_ERROR, detail="Unable to retrieve images due to a lack of urls")
    else:
        listkeys = []
        listtags = []
   
        for rows in data:
            s3_key = rows["thumbnail"]
            listkeys.append(s3_key)
            tag = rows["tagName"]
            if tag != None:
                cleaned_tag = tag.split(",")
                listtags.append(cleaned_tag)    
        
        keysdata: list[int] = listkeys
        batch: batched = batched(keysdata, n=9)
        paginated_list = list(batch)

        flattened = list(chain(*listtags))
    

        cursor.close()
        conn.close()

        return {"urls": paginated_list[Page], "numpages": len(paginated_list), "tags": set(flattened)} #Functional will be used for general browsing
    
@app.get("/returnMangaInfo") #general info
def extractInfo():
    conn = createConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("""SELECT tblSeries.seriesID, seriesName, url FROM tblSeries WHERE url is not null""") 
        output = cursor.fetchall()

        if not output:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Not found within the database")
        else:
            return {"results": output}
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

@app.post("/uploadSeries") #Adds a new manga series. Will need JWT in future. For now just prototyping
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

@app.post("/tagnseriesrelations")
def updateTagSeries():
    conn = createConnection()
    cursor = conn.cursor()

    SQL_STRING = """
INSERT INTO tbltagseries (tagID, seriesID)
SELECT t.tagID, s.seriesID
FROM tbltags t, tblseries s
WHERE t.tagName = %s
AND s.seriesName IN %s
AND NOT EXISTS (
    SELECT 1 FROM tbltagseries ts WHERE ts.tagID = t.tagID AND ts.seriesID = s.seriesID
)
"""
    return {"result": "results"}

#Search -----------------------------------

@app.get("/autocomplete")
def autocomplete(query: str = Query(..., min_length=2)):
    if len(query) <= 1:
        return {"message": "Keep typing"}
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    try:
        SQL_QUERY = """
        (SELECT seriesName AS result, 'series' AS source 
        FROM tblSeries 
        WHERE MATCH(seriesName) AGAINST ("%s*" IN BOOLEAN MODE))

UNION ALL

        (SELECT tagName AS result, 'tags' AS source  
        FROM tblTags 
        WHERE MATCH(tagName) AGAINST ("%s*" IN BOOLEAN MODE))

LIMIT 10;""" 
 
        cursor.execute(SQL_QUERY, (query, query ))
        rows = cursor.fetchall()
    
  

        if rows:
            return rows
        else:
            return {"Message": "Apologies, but there was nothing returned"}
    except mysql.connector.DatabaseError as e:
        return {"message": f"The server has experienced an error, please try again later. Error: {e}"}
    finally:
        conn.close()

@app.post("/search/{page}")
def fullsearch(page: int, datareq: SearchRequest): 
    #This search only occurs when enter is clicked or when the button is clicked.
    #Separating this from auto complete
    page = page - 1
    if datareq == None:
        return {"Message": "The user inputted nothing", "Success": False}
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    searchTerms = datareq.inputtxt
    
    search_append = ""
    searchtuple = []

    for term in searchTerms:

        if search_append == "":
            search_append += "(seriesName LIKE %s OR tagName Like %s)"  
        else:
            search_append += "AND (seriesName LIKE %s OR tagName Like %s)" 
        searchtuple.extend([f"%{term}%", f"%{term}%"]) 

    try:
        listkeys = []
        listtags = []
        GROUP_BY_APPEND = "GROUP BY tblSeries.seriesID, seriesName, url"
        SQL_Query_Base = """
        SELECT tblSeries.seriesID, seriesName, url, GROUP_CONCAT(tagName SEPARATOR ', ') AS tags FROM tblSeries 
        INNER JOIN tbltagseries ON tblSeries.seriesID = tbltagseries.seriesID 
        INNER JOIN tbltags ON tbltags.tagID = tbltagseries.tagID 
        WHERE """
        FinalSQL_Query = f"{SQL_Query_Base} {search_append} {GROUP_BY_APPEND}"

        cursor.execute(FinalSQL_Query, tuple(searchtuple))

        datareq = cursor.fetchall()
        if not datareq or datareq == None:
            return {"message": "Nothing here except us chickens"}
        else:
            for rows in datareq:
                s3_key = rows.get("url")
                if s3_key:
                    listkeys.append( mass_presignedurls(s3_key, 3600) )
                    listtags.append(rows.get("tags"))
            
            keysdata: list[int] = listkeys
            batch: batched = batched(keysdata, n=9)
            paginated_list = list(batch)

     
            return {"result": datareq, "url": paginated_list[page], "tags": listtags, "numpages": len(paginated_list), "Success": True}

    except mysql.connector.DatabaseError as e:
          conn.rollback()
          return {"message": f"The server has experienced an error, please try again later: {e}"}
    finally:
        conn.close()

#Extract tag on linear search. This for on click
@app.get("/extracttag/")
def extractingTag(tag: str = ""):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT tblSeries.seriesID, seriesName, thumbnail FROM tblSeries 
        INNER JOIN tbltagseries ON tblSeries.seriesID = tbltagseries.seriesID 
        INNER JOIN tbltags ON tbltags.tagID = tbltagseries.tagID 
        WHERE tagName = %s AND thumbnail IS NOT NULL""", (tag,))
    
    data = cursor.fetchall()

    if not data:
        print("something went wrong")
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Nothing found")
    else:
        listMALurls = []
        for rows in data:
            MAL_key = rows.get("thumbnail")
            listMALurls.append( MAL_key)
        conn.close()

        return {"url": listMALurls}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000, reload=True)

#MY JS app, will be commnicating from port 5173 specifically

