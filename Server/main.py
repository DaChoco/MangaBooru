#MYSQL - RELATIONAL DB
import mysql.connector

from itertools import batched, chain
import datetime
from datetime import timedelta


#SECURITY
import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError, InvalidKeyError
from fastapi.security import OAuth2PasswordBearer
import uuid

#FASTAPI

import uvicorn
from fastapi import FastAPI, HTTPException, status, Query, File, UploadFile, responses, Form, Depends, Request
from fastapi.responses import JSONResponse
from mangum import Mangum



from fastapi.middleware.cors import CORSMiddleware

#splitting it up cause it was getting too long
from models import LoginRequest, RegisterRequest 
from models import CreateSeries, CreateTag, SearchRequest, FavoritesRequest
from models import UpdateProfileRequest

#AWS
from aws import mass_presignedurls, uploadImage, deleteImage, insert_user_comment, retrieve_user_comments_list

#Getting ENV files
from vars import hostplace, db, passwd, username, PERSONAL_IP, BUCKET_PREFIX, PUBLIC_BUCKET, HOSTWEB, JWT_SECRET_KEY



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
    except mysql.connector.Error as e:
        print(f"This connection was refused: {e}")
#END OF CONNECTIONS - Further MYSQL shall be handled within the APIs

#Security

ALGORITHM = "HS256"
TOKEN_EXPIRES_IN_MINUTES = 60

oauth2_scheme_login = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme_login)):
    if not token:
        return {"reply": "Apologies, youre not signed in"}
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    if not payload:
        return {"reply": False}
    return {"userID": payload.get("sub"), "userName": payload.get("username"), "role": payload.get("role")}


def hashPassword(passwd:str):
    password_bytes = passwd.encode('utf-8')
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def verifyPassword(normalpasswd: str, hashedpasswd: str):
    return bcrypt.checkpw(normalpasswd.encode("utf-8"), hashedpasswd.encode("utf-8"))



def create_access_token(data: dict, expiring_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.datetime.now(tz=datetime.timezone.utc) + (expiring_delta or datetime.timedelta(minutes=TOKEN_EXPIRES_IN_MINUTES))
    print(expire)
    to_encode.update({"expire": int(expire.timestamp())})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)

#Will be used in a register and login function



#MY API ROUTES - SETUP

app = FastAPI()


ORIGINS = ["http://localhost:80",
           "https://localhost:443", 
           "http://localhost:5173",
           "http://127.0.0.1:5173",
           "http://localhost:3306",
           PERSONAL_IP, "http://172.20.10.6:5173", 'http://172.24.32.1:5173'
           ] 

app.add_middleware(CORSMiddleware,
                   allow_origins=ORIGINS,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"]
                   )

#MY API ROUTES - THE ROUTES THEMSELVES :

@app.exception_handler(Exception)
async def all_exception_handler(request: Request, exc: Exception):
    return responses.JSONResponse(
        status_code=500,
        content={"message": f"An internal error occurred: {str(exc)}"},
    )

#------------WHEN LOGGED IN / PROFILE PAGE
@app.get("/returnUserInfo/{userID}")
def extractuserdetails(userID):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    SQL_STRING = """
    SELECT tblusers.userID, userName, seriesUploaded, DateCreated, role, userabout, userIcon, userBanner, signature FROM tblusers 
    INNER JOIN tbluserinfo ON 
    tblusers.userID = tbluserinfo.userID
    WHERE tblusers.userID = %s;"""

    cursor.execute(SQL_STRING, (userID,))
    result = cursor.fetchone()
    conn.close()

    return result

@app.put("/updatemypage/{userID}")
def updatingprofile(data: UpdateProfileRequest, userID: str):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    SELECT_UNAME = " userName = %s"
    SELECT_UBANNER = " userBanner = %s"
    SELECT_SIG = " signature = %s" 
    SELECT_UABOUT = " userabout = %s"

    list_of_vals = []
    set_clauses = []

    #example output with the join process [apple, urlyap, i like water, users yap] -> "apple, urlyap, i like water, users yap" (z,z,z,z)
    if data.uname:
        set_clauses.append(SELECT_UNAME) 
        list_of_vals.append(data.uname)

    if data.ubanner:
        set_clauses.append(SELECT_UBANNER)
        list_of_vals.append(data.ubanner)

    if data.sig:
        set_clauses.append(SELECT_SIG)
        list_of_vals.append(data.sig)

    if data.aboutthem:
        set_clauses.append(SELECT_UABOUT)
        list_of_vals.append(data.aboutthem)
    
    if set_clauses == []:
        return {"message": False, "elaborate": f"The update has failed due to no data being sent"}
    
    list_of_vals.append(userID)
    print(set_clauses)
    print(f"UPDATE tbluserinfo JOIN tblusers ON tbluserinfo.userID = tblusers.userID SET {", ".join(set_clauses)} WHERE tbluserinfo.userID = %s")


    try:
        cursor.execute(f"UPDATE tbluserinfo JOIN tblusers ON tbluserinfo.userID = tblusers.userID SET {", ".join(set_clauses)} WHERE tbluserinfo.userID = %s", tuple(list_of_vals))
        conn.commit()
        print("Success confirmation. Server side")
        return {"message": True, "elaborate": "The update went through, thank you for your time"}
    except mysql.connector.DatabaseError as e:
        print(f"Something has gone wrong with MySQL: {e}")
        conn.rollback()
        return {"message": False, "elaborate": f"The update has failed for the followiing reason: {e}"}
    finally:
        conn.close()

    

@app.post("/updatemypage/{userID}/uploads")
#updates the user icon on S3. We dont accept beyond 3MB
async def uploadImageIcons(userID: str, file: UploadFile = File(...)):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    if file.size > 3000000:
        #3mb is the limit because of how lambda functions work
        return JSONResponse(status_code=400, content={"message": False, "reply": "Apologies, but your file is too big"})

    cursor.execute("SELECT userIcon from tbluserinfo where userID = %s", (userID,))
    old_response = cursor.fetchone()
    old_icon = str(old_response["userIcon"])
    deleteImage(old_icon, "publicboorufiles-01")
    print(file.size)

    if file.size > 3000000:
        return {"message": "Apologies, but your file is too big", "status_code": 400}

    aws_url_base = f"https://{PUBLIC_BUCKET}/userIcons/"
    aws_item_name = f"{datetime.datetime.now().strftime("%Y-%m-%d")}-{uuid.uuid4().hex[:12]}-{file.filename}"
    #Ensuring that the name will always be unique

    final_url = aws_url_base  + aws_item_name

    try:
        uploadImage(file.file, aws_item_name, "publicboorufiles-01", "userIcons")
        cursor.execute("UPDATE tbluserinfo set userIcon = %s WHERE userID = %s", (final_url, userID))
        conn.commit()
        
        cursor.execute("SELECT userIcon FROM tbluserinfo WHERE userID = %s ", (userID,))
        output = cursor.fetchone()

        return {"publicurl": output["userIcon"], "message": True}
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        return {"message": f"An error has occurred for the following reason: {e}"}
    except Exception:
        conn.rollback()
        return {"message": "No"}
    finally:
        conn.close()


#------------------------------------------------ CRITICAL! IMPLEMENT JWT!
@app.post("/login")
def login(data: LoginRequest):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    SQLParams = (data.email, data.email)

    try:
        cursor.execute("SELECT userID, userName, password, role FROM tblusers WHERE email = %s or userName = %s;", SQLParams)
        output = cursor.fetchone()
        if output:
            if verifyPassword(data.passwd, output["password"]) == True:

                if data.ticked == True: #if they tick remember me
                    token_data = {"sub": str(output["userID"]),
                                "username": output["userName"],
                                "role": output["role"]
                                }
                    access_token = create_access_token(token_data)
                else:
                    token_data = None
                    access_token = None

                return {"message": True, 
                        "username": output["userName"], 
                        "token_type": "bearer",
                        "access_token": access_token,
                        "elaborate": "Success, you are successfully logged in!",
                        "userID": output["userID"]
                        }
            else:
                return {"message": False, "elaborate": "Incorrect Password, Please try again"}

        else:
            return {"message": False, "elaborate": "Incorrect username or password"}
          
    except mysql.connector.Error as e:
        return {"message": f"Apologies, an new error has occured. Please try again later: {e}"}
    except TypeError as e:
        return {"message": f"Please type something for the email or the password {e}"}
    finally: 
        cursor.close()
        conn.close()
    
@app.post("/register")
def register(data: RegisterRequest):
        if not data:
            return {"message": False, "elaborate": "You did not submit any information. Sorry"}
        
        conn = createConnection()
        conn.autocommit = False
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT userName FROM tblusers where email = %s or userName = %s", (data.email, data.username))
        exist_user = cursor.fetchone()
        if exist_user:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username or email already taken, please take another one")

        new_uuid = str(uuid.uuid4())
        
        hashed_password = hashPassword(data.passwd)
        SQL_Params = (new_uuid, data.username, 0, data.email, hashed_password)

        try:
            #SQL TRANSACTION
            cursor.execute("""INSERT INTO tblusers 
                           (userID, userName, seriesUploaded, email, password) VALUES
                           (%s, %s, %s, %s, %s)""", SQL_Params)

            cursor.execute("INSERT INTO tbluserinfo (userID) VALUES (%s)", (new_uuid,))
            conn.commit()

            cursor.execute("SELECT userID, userName, role FROM tblusers WHERE userID = %s", (new_uuid,))
            output = cursor.fetchone()
            if data.ticked == True: #if they tick remember me
                    token_data = {"sub": str(output["userID"]),
                                "username": output["userName"],
                                "role": output["role"]
                                }
                    access_token = create_access_token(token_data)
            else:
                token_data = None
                access_token = None

            return {"message": True, "elaborate": "Congrats, you've been registered. Thank you!", "userID": new_uuid, "access_token": access_token, "token_type": "bearer"}
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
def getUser(user: dict = Depends(get_current_user)):
    if not user:
        {"reply": False, "instruction": "The user will sign in normally"}
    return {"reply": True, "userID": user["userID"], "userName": user["userName"], "role": user["role"]} #is used on reload if signed in
 

@app.get("/returnBooruPics/{Page}")
def getUrls(Page: int):
    Page = Page - 1
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

#Extracts the image whether it has tags or not, but also gets tags - Cant use outer joins since this is not Post gres. Came up with an alternative
    SQL_PARAM_NO_TAG_INCLUDED = """ 
SELECT tblseries.seriesID as series, url, thumbnail, group_concat(DISTINCT tagName order by tagName) as tagName
FROM tblseries 
LEFT JOIN tbltagseries ON tbltagseries.seriesID = tblseries.seriesID
LEFT JOIN tbltags ON tbltagseries.tagID = tbltags.tagID
WHERE thumbnail IS NOT NULL GROUP BY url, thumbnail, tblseries.seriesID
UNION
SELECT tblseries.seriesID as series, url, thumbnail, GROUP_CONCAT(DISTINCT tagName order by tagName) as tagName
FROM tblseries 
RIGHT JOIN tbltagseries ON tbltagseries.seriesID = tblseries.seriesID
RIGHT JOIN tbltags ON tbltagseries.tagID = tbltags.tagID
WHERE thumbnail IS NOT NULL GROUP BY url, thumbnail, tblseries.seriesID ORDER BY url DESC
"""

    cursor.execute(SQL_PARAM_NO_TAG_INCLUDED) #returns the urls/keys
    data = cursor.fetchall()
    
    if not data:
        raise HTTPException(status.HTTP_404_INTERNAL_SERVER_ERROR, detail="Unable to retrieve images due to a lack of urls")
    else:
        listtags = []
        listseriesID = []

        listkeys = [rows["thumbnail"] for rows in data]
        listseriesID = [rows["series"] for rows in data]
        for rows in data:
            tag = rows["tagName"]
            if tag != None:
                cleaned_tag = tag.split(",")
                listtags.append(cleaned_tag)    
        
        keysdata: list[int] = listkeys
        batch: batched = batched(keysdata, n=9)
        paginated_list = list(batch)

        seriesdata: list[int] = listseriesID
        batchseries: batched = batched(seriesdata, n=9)
        seriespaginate = list(batchseries)
        
    
        flattened = list(chain(*listtags))

        cursor.close()
        conn.close()

        return {"urls": paginated_list[Page],
                 "numpages": len(paginated_list), 
                 "tags": set(flattened), 
                 "series": seriespaginate[Page]} #Functional will be used for general browsing
    
@app.get("/returnMangaInfo") #general info #for internal use only
def extractInfo():
    conn = createConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("""SELECT tblseries.seriesID, seriesName, url FROM tblseries WHERE url is not null""") 
        output = cursor.fetchall()

        if not output:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Not found within the database")
        else:
            return {"results": output}
    except mysql.connector.DatabaseError as e:
        return {"message": f"An error has occured {e}"}
    finally:
            cursor.close()
            conn.close()

@app.get("/returnMangaInfo/{seriesID}") #is added to a tag div
def seriesExtract(seriesID: str):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT tblseries.seriesID, thumbnail, url, seriesName, tagName FROM tbltags INNER JOIN 
        tbltagseries ON tbltags.tagID = tbltagseries.tagID 
        INNER JOIN tblseries ON tbltagseries.seriesID = tblseries.seriesID
        WHERE tblseries.seriesID = %s""", (seriesID,))
    
    output_tags = cursor.fetchall()
    if not output_tags:
        #In the event the series has no tags
        cursor.execute("SELECT seriesID, thumbnail, url, seriesName FROM tblseries WHERE seriesID = %s", (seriesID,))
        output_tags = cursor.fetchall()
    s3_key = output_tags[0]["url"]
    output_tags[0]["url"] = mass_presignedurls(s3_key, 360)

    cursor.close()
    conn.close()
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
def seriesInsert(seriesname: str = Form(...), seriesdesc: str = Form(...), userID: str  = Form(...), tags: list[str] = Form(...), file: UploadFile = File(...)):
    if not seriesname:
        print("something is wrong")
        return {"message": "no_input"}
    conn = createConnection()
    cursor = conn.cursor()
    conn.autocommit = False

    cursor.execute("SELECT seriesName FROM tblseries where seriesName = %s", (seriesname,))
    if cursor.fetchone():
        return {"message": "This series already exists, it does not need to be added. Thank you"} 
    

    SQL_STRING_JUNCTION_TABLE = """
INSERT INTO tbltagseries (tagID, seriesID)
    SELECT t.tagID, s.seriesID
    FROM tbltags t, tblseries s
WHERE t.tagName = %s
AND s.seriesName = %s
AND NOT EXISTS (
    SELECT 1 FROM tbltagseries ts WHERE ts.tagID = t.tagID AND ts.seriesID = s.seriesID
)
"""
    set_of_params = []

    for i in tags:
        set_of_params.append((i, seriesname))
    
    try:
        print("Creating series...")
        item_name_aws = f"{datetime.datetime.now().strftime("%Y-%m-%d")}-{uuid.uuid4().hex[:12]}-{file.filename}"

        aws_url_base = f"https://{PUBLIC_BUCKET}/"
        final_aws_url = aws_url_base + "downscaledFiles/resized/" + item_name_aws

        uploadImage(file.file, item_name_aws, "publicboorufiles-01", "downscaledFiles/resized")

        SQL_Params = (seriesname, seriesdesc, final_aws_url, f"downscaledFiles/resized/{item_name_aws}")
        #SQL - TRANSACTION BEGINS
        cursor.execute("INSERT INTO tblseries (seriesName, seriesDesc, thumbnail, url) VALUES (%s, %s, %s, %s)", SQL_Params)
        cursor.execute("UPDATE tblusers SET seriesUploaded = seriesUploaded + 1 WHERE userID = %s", (userID,))
        
        cursor.executemany(SQL_STRING_JUNCTION_TABLE, set_of_params)

        cursor.execute("SELECT seriesName FROM tblseries where seriesName = %s", (seriesname,))

        find_name = cursor.fetchone()
        if find_name:
            print("Success!")
    
        conn.commit()
        #SQL - END TRANSACTION
        return {"message": "Series successfully added. Thank you!"}
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        return {"message": f"The server has experienced an error: {e}"}
    except TypeError:
        conn.rollback()
        return {"message": "The server has experienced an error, please try again later"}
    finally:
        conn.close()

@app.put("/tagseriesrelations")
def updateTagSeries(taginput: str = Query(...), seriesinput: str = Query(...)):
    #when someone adds a tag to an existing series, we need to create the junction table link. Since the tag already exists and the series already exists
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)
    conn.autocommit = False

    SQL_STRING = """
INSERT INTO tbltagseries (tagID, seriesID)
SELECT t.tagID, s.seriesID
FROM tbltags t, tblseries s
WHERE t.tagName = %s
AND s.seriesName = %s
AND NOT EXISTS (
    SELECT 1 FROM tbltagseries ts WHERE ts.tagID = t.tagID AND ts.seriesID = s.seriesID
)
"""
    SQL_STRING_VERIFICATION = """SELECT tblseries.seriesName, tbltags.tagName FROM tbltagseries 
INNER JOIN tbltags ON tbltagseries.tagID = tbltags.tagID
INNER JOIN tblseries ON tbltagseries.seriesID = tblseries.seriesID
WHERE tblseries.seriesName = %s"""

    try:
        list_of_tags = []
        
        cursor.execute(SQL_STRING, (taginput, seriesinput))
        cursor.execute(SQL_STRING_VERIFICATION, (seriesinput,))
        results = cursor.fetchall()
        
        if results:
            for rows in results:
                list_of_tags.append(rows["tagName"])

            if taginput in list_of_tags:
                conn.commit()
                return JSONResponse(content={"reply": True, "message": "Series has been updated, thank you", "tags": list_of_tags}, status_code=200)
            else:
                return JSONResponse(content={"reply": False, "message": "The tag was not added to the series"}, status_code=200)
        else:
            conn.rollback()
            return JSONResponse(content={"reply": False, "message": "No new relationships added"}, status_code=200)
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        print(f"Your error has occured. Very sorry: {e}")
        return JSONResponse(content={"reply": False,"message": "Something has gone wrong. Please try again later"}, status_code=500)
    except TypeError as e:
        conn.rollback()
        print(f"An error has occured: {e}")
        return JSONResponse(content={"reply": False, "message": "Something is wrong on the server side"}, status_code=502)
    except Exception as e:
        conn.rollback()
        return {"message": f"Something went wrong: {e}"}
    finally:
        conn.close()
   
 

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
        FROM tblseries 
        WHERE MATCH(seriesName) AGAINST ("%s*" IN BOOLEAN MODE))

UNION ALL

        (SELECT tagName AS result, 'tags' AS source  
        FROM tbltags 
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

    print(searchTerms)
    
    search_append = ""
    searchtuple = []

    for term in searchTerms:

        if search_append == "":
            search_append += " (seriesName LIKE %s OR GROUP_CONCAT(tagName) LIKE %s) "  
        else:
            search_append += " AND (seriesName LIKE %s OR GROUP_CONCAT(tagName) LIKE %s)" 
        searchtuple.extend([f"{term}%", f"%{term}%"]) 

    try:
        listkeys = []
        listtags = []
        listseriesID = []
        GROUP_BY_APPEND = "GROUP BY tblseries.seriesID, seriesName, url"
        SQL_Query_Base = """
        SELECT tblseries.seriesID, seriesName, url, GROUP_CONCAT(tagName SEPARATOR ',') AS tagName FROM tblseries 
        INNER JOIN tbltagseries ON tbltagseries.seriesID = tblseries.seriesID 
        INNER JOIN tbltags ON tbltags.tagID = tbltagseries.tagID 
        """
        FinalSQL_Query = f"{SQL_Query_Base} {GROUP_BY_APPEND} HAVING {search_append}"

        

        cursor.execute(FinalSQL_Query, tuple(searchtuple))

        datareq = cursor.fetchall()
        if not datareq or datareq == None:
            return {"message": "Nothing here except us chickens", "communication": False}
        else:
            for rows in datareq:
                s3_key = rows.get("url")
                if s3_key:
                    listseriesID.append(rows.get("seriesID"))
                    listkeys.append( mass_presignedurls(s3_key, 3600) )
                    listtags.append(rows.get("tagName"))
            
            keysdata: list[int] = listkeys
            batch: batched = batched(keysdata, n=9)
            paginated_list = list(batch)

     
            return {"result": datareq, 
                    "url": paginated_list[page], 
                    "tags": listtags, 
                    "numpages": len(paginated_list), 
                    "seriesID": listseriesID,
                    "Success": True}

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
        SELECT tblseries.seriesID, seriesName, thumbnail FROM tblseries 
        INNER JOIN tbltagseries ON tblseries.seriesID = tbltagseries.seriesID 
        INNER JOIN tbltags ON tbltags.tagID = tbltagseries.tagID 
        WHERE tagName = %s AND thumbnail IS NOT NULL""", (tag,))
    
    data = cursor.fetchall()

    if not data:
        print("something went wrong")
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Nothing found")
    else:
        listMALurls = [rows["thumbnail"] for rows in data]
        conn.close()

        return {"url": listMALurls}
    
@app.post("/returnFavorites")
def returnFavorites(data: FavoritesRequest):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)
    list_favorites = data.arrFavorites

    paraquery = ",".join(["%s"]*len(list_favorites))
    SQL_QUERY = f"""SELECT thumbnail, url, seriesName, tblseries.seriesID from tblseries where seriesID IN ({paraquery}) """
    
    cursor.execute(SQL_QUERY, tuple(list_favorites))

    output = cursor.fetchall()

    conn.close()

    return (output)

@app.post("/returnFavoriteTagList")
def returnFavoriteTags(data: FavoritesRequest):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)
    list_favorites = data.arrFavorites

    paraquery = ",".join(['%s']*len(list_favorites))

    SQL_QUERY = f"""
    SELECT Distinct(tagName) from tbltags 
        INNER JOIN tbltagseries ON tbltags.tagID = tbltagseries.tagID 
        INNER JOIN tblseries    ON tbltagseries.seriesID = tblseries.seriesID 
    WHERE tblseries.seriesID IN ({paraquery}) """

    cursor.execute(SQL_QUERY, tuple(list_favorites))

    output = cursor.fetchall()

    if not output:
        return {"Message": "No tags were returned"}
    
    conn.close()
    return output

@app.get("/everytag")
def AllTags(page: int = Query(1, ge=1)):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    SQL_QUERY = """SELECT DISTINCT(tagName), tagDesc from tbltags LIMIT 10 OFFSET %s"""
    offsetval = (page-1)*10
    cursor.execute(SQL_QUERY, (offsetval,))
    output = cursor.fetchall()
    
    conn.close()
    return output

@app.get("/flagfordelete/{seriesID}")
def flagfordelete(seriesID: str, userID: str | None = None):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT seriesID from tblseries where seriesID = %s", (seriesID,))
    print("User:", userID)
    print("SeriesID:", seriesID)
    output = cursor.fetchone()

    if not output:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": "This series does not exist"})
    try:
        cursor.execute("UPDATE tblseries SET flagged = flagged + 1 WHERE seriesID = %s", (seriesID,))
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": f"An error has occurred: {e}"})

    conn.commit()
    cursor.execute("SELECT flagged from tblseries where seriesID = %s", (seriesID,))
    output = cursor.fetchone()
    conn.close()

    return {"message": "Success", "flagged": output["flagged"]}

@app.delete("/deleteSeries")
def deleteSeries(seriesID: str = Query(...), seriesName: str = Query(...)):
    #This is to delete a series from the database. Will be used for admins only
    conn = createConnection()
    conn.autocommit = False
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT seriesID, seriesName from tblseries where seriesID = %s or seriesName = %s", (seriesID, seriesName))
    output = cursor.fetchone()

    if not output:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"message": "This series does not exist"})
    
    try:
        cursor.execute("DELETE FROM tblseries WHERE seriesID = %s or seriesName = %s", (seriesID, seriesName))
        conn.commit()
        return {"message": "Successfully Deleted. Thank you!", "reply": True}   
    except mysql.connector.DatabaseError as e:
        conn.rollback()
        return {"message": f"An error has occurred: {e}", "reply": False}
    except TypeError:
        conn.rollback()
        return {"message": "An error has occurred. Please try again later", "reply": False}
    except Exception as e:  
        conn.rollback()
        return {"message": f"An error has occurred: {e}", "reply": False}
    finally:
        conn.close()

#Comment Making

@app.get('/retrieveUserComments/{seriesID}')
async def get_comments(seriesID: str):
    if not seriesID:
        return {"error": "An error has occured, please try again later"}
    
    result = await retrieve_user_comments_list("Mangabooru-Comments", seriesID)

    return JSONResponse(content=result, status_code=200)

@app.get("/inputUserComments")
async def put_comments(user_id: str, comment: str, series_id: str, userIcon: str):

    if not series_id:
        return {"message": "Comment was unsuccessful"}
    result = await insert_user_comment(user_id, comment, "Mangabooru-Comments", series_id, userIcon)

    if result == True:
        return JSONResponse(content={"message": "Comment was successful!"}, status_code=200)
    else:
        return JSONResponse(content={"message": "Comment failed to be inserted"}, status_code=500)


    

    
    
    

    

handler = Mangum(app)
if __name__ == "__main__":
   uvicorn.run(app, host="localhost", port=8000, reload=True)

#MY JS app, will be commnicating from port 5173 specifically

