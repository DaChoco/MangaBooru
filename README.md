# MangaBooru
Welcome to the MangaBooru. Inspired by other Booru sites such as Sakugabooru. For those who do not know what Boorus are, they are tag based image gallery sites where users can share content with others. This site intends to be a modern rendition of the niche website style. Full Stack and incorperating popular technologies of today.\
The main function of the site will be assisting end users in discovering new manga series they may not have the opportunity to discover otherwise. Or just as a simple archive of series that a person may be reading/may want to read.\
The site will have a tag based searching system, user login, registration, the ability to upload

# Techstack
* **Python** with **FastAPI** in order to create restful apis, cookies and authentication. 
  * Was chosen due to my current proficiency in Python in tandem with a desire to learn FastAPI. It also is a good framework for prototyping/getting something running off the ground.
* **Javascript** with React to create a dynamic page layout that can easily adapt to the data recieved from my api everytime the page needs to reload
* Amazon Web services
  * **S3** will be used to host the images that are used on the site. From banners, to user icons to the actual images desplayed in the posts section. Presigned urls will be used for high res images while low res ones will be in a public bucket
  * **EC2** will be used to host my database. 
* **HTML** and **Plain CSS** will be used for all the design/styling
* **MySQL** will be used for the database

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
# Things currently doing
* Styling of and customizing the profile and updating user info pages
* Creating user uploads for profile pictures
* Role based allocation of access to features. Such as certain banners being blocked from thise below Patreon rank. Aka regular members
* A page for users to make posts. Under the route /uploads
# Things to do
* Further down the line/End Goal:
	* Basic authentication and cookies with JWT
* BONUS - Only for after the rest of prodiction is done
  * Try implementing Google and Apple authentication with the service.
# Features
* Coming soon

