const express = require('express');                 //separated the routes to make app.js cleaner
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');   //connects to campground.js in model folder
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');                          //middleware that helps upload files into database
const { storage } = require('../cloudinary');
const upload = multer({ storage });              //destination of the uploaded files will be in storage created in cloudinary


router.route('/')
    .get(catchAsync(campgrounds.index))     //home page
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); //creates new campground from form above and upload images to cloudinary

router.get('/new', isLoggedIn, campgrounds.renderNewForm)      //page for new campground form

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))         //page that shows each campground in detail when clicked
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) //update campground using form above
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))  //deletes campground in website and database

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)); //form that will let you edit the campground




module.exports = router;