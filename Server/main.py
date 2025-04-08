#MYSQL - RELATIONAL DB
import mysql.connector

from itertools import batched, chain
import datetime

#SECURITY
import bcrypt
import jwt
import uuid

#FASTAPI
import uvicorn
from fastapi import FastAPI, HTTPException, status, Query, File, UploadFile, responses, Form

from fastapi.middleware.cors import CORSMiddleware

#splitting it up cause it was getting too long
from models import LoginRequest, RegisterRequest 
from models import CreateSeries, CreateTag, SearchRequest, FavoritesRequest
from models import UpdateProfileRequest

#AWS
from aws import mass_presignedurls, uploadImage, deleteImage

#Getting ENV files
from vars import hostplace, db, passwd, username, PERSONAL_IP, BUCKET_PREFIX, PUBLIC_BUCKET


#MYSQL CONNECTING FUNCTION
def createConnection():
    try:
        conn = mysql.connector.connect(host=hostplace,
                               port=3306,
                               database=db,
                               password=passwd,
                               user=username,
                               auth_plugin='mysql_native_password')
        print(hostplace)
        return conn
    except mysql.connector.Error as e:
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
           "http://127.0.0.1:5173",
           "http://localhost:3306",
           PERSONAL_IP] 

app.add_middleware(CORSMiddleware,
                   allow_origins=ORIGINS,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"]
                   )

#MY API ROUTES - THE ROUTES THEMSELVES :

#------------WHEN LOGGED IN / PROFILE PAGE
@app.get("/returnUserInfo/{userID}")
def login(userID):
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

@app.post("/updatemypage/{userID}")
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

    cursor.execute("SELECT userIcon from tbluserinfo where userID = %s", (userID,))
    old_response = cursor.fetchone()
    old_icon = str(old_response["userIcon"])
    deleteImage(old_icon, "publicboorufiles-01")

    if file.size > 3000000:
        return {"message": "Apologies, but your file is too big", "status_code": 400}

    aws_url_base = f"https://{PUBLIC_BUCKET}/"
    aws_item_name = f"{datetime.datetime.now().strftime("%Y-%m-%d")}-{uuid.uuid4().hex[:12]}-{file.filename}"
    #Ensuring that the name will always be unique

    final_url = aws_url_base + aws_item_name

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

    hashed_password = hashPassword(data.passwd)
    print(hashed_password, data.email, data.passwd)

    SQLParams = (data.email,)

    try:
        cursor.execute("SELECT userID, userName, password FROM tblusers WHERE email = %s;", SQLParams)
        output = cursor.fetchone()
        if output:
            if verifyPassword(data.passwd, output["password"]) == True:
                return {"message": True, "username": output["userName"], "elaborate": "Success, you are successfully logged in!", "userID": output["userID"]}
            else:
                return {"message": False, "elaborate": "Wrong Password"}

        else:
            return {"message": False, "elaborate": "Incorrect username or password"}
          
    except mysql.connector.Error as e:
        return {"message": f"Apologies, an new error has occured. Please try again later: {e}"}
    except TypeError:
        return {"message": "Please type something for the email or the password"}
    finally: 
        cursor.close()
        conn.close()
    
@app.post("/register")
def register(data: RegisterRequest):
        
        conn = createConnection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT userName FROM tblusers where email = %s or userName = %s", (data.email, data.username))
        exist_user = cursor.fetchone()
        if exist_user:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username or email already taken, please take another one")

        
        hashed_password = hashPassword(data.passwd)
        SQL_Params = (data.username, 0, data.username, hashed_password)

        try:
            cursor.execute("""INSERT INTO tblusers 
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
        cursor.execute("SELECT userID, userName FROM tblusers WHERE userID = %s")
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

        SQL_Params = (seriesname, seriesdesc, final_aws_url)
        #SQL - TRANSACTION BEGINS
        cursor.execute("INSERT INTO tblseries (seriesName, seriesDesc, thumbnail) VALUES (%s, %s, %s)", SQL_Params)
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
        FROM tblseries 
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
        GROUP_BY_APPEND = "GROUP BY tblseries.seriesID, seriesName, url"
        SQL_Query_Base = """
        SELECT tblseries.seriesID, seriesName, url, GROUP_CONCAT(tagName SEPARATOR ',') AS tagName FROM tblseries 
        INNER JOIN tbltagseries ON tbltagseries.seriesID = tblseries.seriesID 
        INNER JOIN tbltags ON tbltags.tagID = tbltagseries.tagID 
        """
        FinalSQL_Query = f"{SQL_Query_Base} {GROUP_BY_APPEND} HAVING {search_append}"

        print (FinalSQL_Query)
        print()

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

     
            return {"result": datareq, 
                    "url": paginated_list[page], 
                    "tags": listtags, 
                    "numpages": len(paginated_list), 
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
    offsetval = (page-1)*20
    cursor.execute(SQL_QUERY, (offsetval,))
    output = cursor.fetchall()
    
    conn.close()
    return output

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000, reload=True)

#MY JS app, will be commnicating from port 5173 specifically

