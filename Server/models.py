from pydantic import BaseModel
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

class CreateTag(BaseModel):
    tagname: str
    tagdesc: str

class SearchRequest(BaseModel):
    inputtxt: list | None