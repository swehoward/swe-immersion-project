"use strict";

/* jshint node: true */

/*
 * To start the webserver run the command:
 *    node server.js
 */

var fs = require("fs");
// var mongoose = require('mongoose');
var async = require('async');
// var session = require('express-session');
// var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
// var MongoStore = require('connect-mongo')(session);
var express = require('express');
var app = express();


app.use(express.static(__dirname));
// app.use(bodyParser.json());

// app.use(bodyParser());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

// mongoose.connect('mongodb://localhost/SWE');

// app.use(session({
//     resave: false, 
//     saveUninitialized: false,
//     cookie: { maxAge: 1000*60*15 },
//     secret: "secretKey" ,
//     store:new MongoStore({
//         mongooseConnection: mongoose.connection
//     })
// }));

var PasswordMethods = require('./modelData/password.js');
var User = require('./schema/user.js');





/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if ((!request.session.user_id) || (!request.session.userObj.role > 3)) {
        // no logged user, unauthorized
        console.error('Not logged in, 401');
        response.status(401).send(JSON.stringify("Please login first."));
        return;
    }

    User.find(request.body, {'__v':0, 'password':0}, function (err, info) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (info === null || info.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(500).send('Missing SchemaInfo');
            return;
        }

        // We got the object - return it in JSON format.
        // console.log('User info - ', info);
        response.end(JSON.stringify(info));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    var id = request.params.id;
    var filter = {'_id': id};
    // console.log("searching for user with filter ", filter);
    User.findOne(filter, {'__v':0, 'password':0}, function (err, info) {
        if (err) {
            // Query returned an error.
            console.error('Doing /user/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if(info === null){
            console.error('Doing /user/:id error: No such user!');
            response.status(400).send(JSON.stringify("No such user!"));
            return;
        }
        // We got the object - return it in JSON format.
        // console.log('User found in mongo - ', info);
        response.end(JSON.stringify(info));
    });
});

// Deals with login
app.post('/admin/login', function (request, response){
    var filter = {'login_name': request.body.login_name, 'password': PasswordMethods.makePasswordEntry(request.body.password)};
    User.findOne(filter, {}, function (err, info) {
        if (err) {
            // Query returned an error.
            console.error('Doing lookup for login_name:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        else if (info === null){
            response.status(400).send(JSON.stringify("Please check your login details."));
            response.end(JSON.stringify(info));
            return;
        }
        request.session.user_id=info._id;   // Store the session
        request.session.userObj = info;        
        response.end(JSON.stringify(info));
    });
});

app.post('/admin/logout', function (request, response){
    // clear the info stored in session
    if(!request.session.user_id){
        response.status(400).send(JSON.stringify("Not even logged in."));
        return;
    }
    request.session.destroy(function (err) {
        if(err){
            console.error('Clearing session state:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.end(JSON.stringify("successfully logged out"));
    });
});

/*
    Creates a new user account.
*/
app.post('/user', function (request, response) {
    // Create new user, but first check if the login_name already exists!
    User.findOne({'login_name': request.body.login_name}, function(err, user) {
        // hanlde err..
        if (err) {
            // Query returned an error.
            console.error('Doing lookup for login_name at user registration:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user !== null) {
            // user already exists
            response.status(400).send(JSON.stringify("Login Name not unique."));
        } else {
            // user does not exist, so let's create it and return success message.
            var newUser = {login_name: request.body.login_name, password: PasswordMethods.makePasswordEntry(request.body.password)};
            if (request.body.login_name === "admin"){newUser.role = 5};     // hardcode admin with authority level of 5 (God Mode)
            User.create(newUser, function (err, userObj) {
                if (err) {
                    console.error('Error while creating user', err);
                } else {
                    // user.objectID = userObj._id;
                    request.session.userObj = userObj;
                    request.session.user_id = userObj._id;
                    response.end(JSON.stringify(userObj));
                }
            });
        }
   });    
});


///////////////////////////////////////////////////////////////////////////////

app.set('port', (process.env.PORT || 3000));
app.get('/', function(request, response) {
  response.render('index')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});