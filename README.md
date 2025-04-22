# MangaBooru
Welcome to the MangaBooru. Inspired by other Booru sites such as Sakugabooru. For those who do not know what Boorus are, they are tag based image gallery sites where users can share content with others. This site intends to be a modern rendition of the niche website style. Full Stack and incorperating popular technologies of today.\
The main function of the site will be assisting end users in discovering new manga series they may not have the opportunity to discover otherwise. Or just as a simple archive of series that a person may be reading/may want to read.\
The site will have a tag based searching system, user login, registration, the ability to upload. In addition, there will be a commenting system someone can use per manga series upload on the site

# Techstack
* **Python** with **FastAPI** in order to create restful apis, cookies and authentication. 
  * Was chosen due to my current proficiency in Python in tandem with a desire to learn FastAPI. It also is a good framework for prototyping/getting something running off the ground.
* **Javascript** with React to create a dynamic page layout that can easily adapt to the data recieved from my api everytime the page needs to reload
* Amazon Web services
  * **S3** will be used to host the images that are used on the site. From banners, to user icons to the actual images desplayed in the posts section. Presigned urls will be used for high res images while low res ones will be in a public bucket
  * **EC2** will be used to host my database. 
* **HTML** and **Plain CSS** will be used for all the design/styling
* **MySQL** will be used for the database
* **Amazon Dynamo DB** will be used to host and create my user comments, as well as creating a commenting system

# Short list of Things already done
* Landing page
* Auto complete
* Searching
* Image extraction from S3
* Database Schema
* Style the footer 
* General site design planned
* Notable components are all done
* Make return images route only return unique tag names
* Parameterized routing per page/image
  * Make thumbnails column in database so that presigned urls can be called less often. Lets only call them for when the end user wants the high res version.
* Tags correspond with the search results
* EC2 Database hosting with MySQL
* Styling of and customizing the profile and updating user info pages
* Creating user uploads for profile pictures
* Create the ability to flag for deletion
* Deletions page
# Things currently doing
* Creating a simple commenting system with Dynamo DB
* Making pages more responsive on mobile
# Things to do
* BONUS - Only for after the rest of prodiction is done
  * Try implementing Google or Apple authentication with the service.
# How to tinker with it yourself
Notes: You will need an aws account (with valid credentials) if you want to make use of how I handled the comment system with dynamo db. S3 is not neccessary, as I primarily stored links in my MySQL database. Meaning your own alternatives will work fine. You may be able to modify my comment code heavily with MongoDB though.
* Clone the main repository to your personal machine with the following:
  * Git Clone https://github.com/DaChoco/MangaBooru.git
* Create your .venv file with python -m venv .venv
* Input .venv\Scripts\activate (forwards slash if you are on Linux or Mac)
* pip install -r requirements.txt (A requirements.txt file has been left for you. You can also modify the docker file instead)
* Navigate to the frontend folder, then you can add a .env to direct the backend to your own server/machine. As currently VITE_LAMBDA_DOMAIN or VITE_PERSONAL_IP are env variables used in my api calls
  * I left many console.logs that are safe to delete, but you can keep them for debugging.
* Now navigate to your server folder (if you want to localhost test your server) then configure your database credentials. If you don't use MySQL or use a Postgres library equivalent to Mysql-connector-python, you will need to slightly modify my code. If you prefer to use ORMS though, there will be a substantial rewrite of all my database calls. But having the original SQL raw should help you formulate your ORM queries well.
* Now that you have done all that, the code is free to modify, have fun. If you use it for a project largely unchanged, credit would be heavily appreciated. Thank you for reading through all this.
# Screenshots:
* Coming soon

