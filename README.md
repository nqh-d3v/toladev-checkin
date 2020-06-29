# toladev-checkin
Checkin activities by QR code.
Framework: ExpressJS
Backend:   NodeJS
Database:  Mongodb

## SETTING BEFORE START APPLICATION
### 1/ Setting nodemailer to send email in "services/admin.js" at line 37, 38:
 ...

  user: '<your_username_gmail_account>',
  pass: '<your_password_gmail_account>'
 
 ...
 
Create an gmail account, turn off access from less security application for your account.
### 2/ Access to https://info.io, create new account, get token access and setup token in "views/home.ejs" at line 65.
 ...
 
 $.getJSON("https://ipinfo.io/json?token=<your_token>", function(r){
 
 ...
### 3/ Now, type "npm install --save" in your command, after, type "npm start" or "nodemon start" to run application.
Default, application will run on port 3000, you can edit it in bin/www at line 15.

----------------

About me, access https://www.toladev.info to learn more. Thanks!

----------------
Create by Toladev with ♥
