from pydantic import BaseModel
from fastapi import File
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
    userID: str
    tags: list[str]

class CreateTag(BaseModel):
    tagname: str
    tagdesc: str

class SearchRequest(BaseModel):
    inputtxt: list | None

class FavoritesRequest(BaseModel):
    arrFavorites: list

class UpdateProfileRequest(BaseModel):
    uname: str
    sig: str
    ubanner: str
    aboutthem: str
