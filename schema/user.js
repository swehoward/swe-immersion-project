"use strict";
/*
 *  Define the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var userSchema = new mongoose.Schema({
    login_name: String,
    password: String,
    role: {type: Number, default: 1}, // contributor = 1, moderator = 3, administrator = 5
    id: String     // Unique ID identifying this user
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;