const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)               //page where user can register an ID for website
    .post(catchAsync(users.register));                 //posts registration from registration page from above into database

router.route('/login')
    .get(users.renderLogin)                                      //page where user can login
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login)    //authenticates user to check if they have a user in this website

router.get('/logout', users.logout)                         // logs out user

module.exports = router;
