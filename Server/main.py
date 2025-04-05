#MYSQL
import mysql.connector

from itertools import batched, chain

#SECURITY
import bcrypt
import jwt

#FASTAPI
import uvicorn
from fastapi import FastAPI, HTTPException, status, Query

from fastapi.middleware.cors import CORSMiddleware
from models import LoginRequest, RegisterRequest, CreateSeries, CreateTag, SearchRequest, FavoritesRequest, UpdateProfileRequest

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

#------------WHEN LOGGED IN / PROFILE PAGE
@app.get("/returnUserInfo/{userID}")
def login(userID):
    conn = createConnection()
    cursor = conn.cursor(dictionary=True)

    SQL_STRING = """
    SELECT tblusers.userID, userName, seriesUploaded, DateCreated, role, userabout, userIcon, userBanner, signature FROM tblusers 
    INNER JOIN tbluserinfo ON 
    tblusers.userID = tbluserinfo.userID
    WHERE tblusers.userID = %s"""

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
        set_clauses(SELECT_SIG)
        list_of_vals.append(data.sig)

    if data.aboutthem:
        set_clauses(SELECT_UABOUT)
        list_of_vals.append(data.aboutthem)
    
    if set_clauses == []:
        return {"message": False, "elaborate": f"The update has failed due to no data being sent"}
    
    list_of_vals.append(userID)


    try:
        cursor.execute(f"UPDATE tblusers SET {",".join(set_clauses)} WHERE userID = %s", tuple(list_of_vals))
        print("Success confirmation. Server side")
    except mysql.connector.DatabaseError as e:
        print("Something has gone wrong")
        conn.rollback()
        return {"message": False, "elaborate": f"The update has failed for the followiing reason: {e}"}
    finally:
        conn.close()

    return {"message": True, "elaborate": "The update went through, thank you for your time"}


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
SELECT tblseries.seriesID as series, url, thumbnail, group_concat(DISTINCT tagName order by tagName) as tagName
FROM tblseries 
LEFT JOIN tbltagseries ON tbltagseries.seriesID = tblSeries.seriesID
LEFT JOIN tbltags ON tbltagseries.tagID = tbltags.tagID
WHERE thumbnail IS NOT NULL GROUP BY url, thumbnail, tblSeries.seriesID
UNION
SELECT tblseries.seriesID as series, url, thumbnail, GROUP_CONCAT(DISTINCT tagName order by tagName) as tagName
FROM tblseries 
RIGHT JOIN tbltagseries ON tbltagseries.seriesID = tblSeries.seriesID
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
        cursor.execute("""SELECT tblSeries.seriesID, seriesName, url FROM tblSeries WHERE url is not null""") 
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
        INNER JOIN tblSeries ON tbltagseries.seriesID = tblseries.seriesID
        WHERE tblSeries.seriesID = %s""", (seriesID,))
    
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
        GROUP_BY_APPEND = "GROUP BY tblSeries.seriesID, seriesName, url"
        SQL_Query_Base = """
        SELECT tblSeries.seriesID, seriesName, url, GROUP_CONCAT(tagName SEPARATOR ',') AS tagName FROM tblSeries 
        INNER JOIN tbltagseries ON tbltagseries.seriesID = tblSeries.seriesID 
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
        SELECT tblSeries.seriesID, seriesName, thumbnail FROM tblSeries 
        INNER JOIN tbltagseries ON tblSeries.seriesID = tbltagseries.seriesID 
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

    print(list_favorites)
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

