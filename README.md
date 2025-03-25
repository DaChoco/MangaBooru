# MangaBooru
Welcome to the MangaBooru. Inspired by other Danbooru sites such as Sakugabooru, this site intends to be a hyper modern rendition of the niche website style. While incorporating popular technologies of today.\
The main function of the site will be assisting end users in discovering new manga series they may not have the opportunity to discover otherwise. Or just as a simple archive of series that a person may be reading/may want to read.\
The site will have a tag based searching system, user login, registration, the ability to upload

# Techstack
* **Python** with **FastAPI** in order to create restful apis, cookies and authentication
* **Javascript** with React to create a dynamic page layout that can easily adapt to the data recieved from my api everytime the page needs to reload
* Amazon Web services
  * **S3** will be used to host the images that are used on the site
  * **EC2** will be used to host my database. 
* **HTML** and **Plain CSS** will be used for all the design/styling
* **MySQL** will be used for the database

# Things already done
* Landing page
* Auto complete
* Searching
* Image extraction from S3
* Database Schema
* Style the footer 
* General site design planned
* Make return images route only return unique tag names - Done
# Things to do
* Make thumbnails column in database so that presigned urls can be called less often. Lets only call them for when the end user wants the high res version. - In Progress, mostly done besides an actual see full version btn
* Making an account page (and account menu)
* All tags page. Just a list of the tags, not complicated.
* -Further down the line:
	* Parameterized routing per page/image
	* Basic authentication and cookies with JWT
# Features
* Coming soon

