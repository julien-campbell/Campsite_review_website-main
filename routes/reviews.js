const express = require('express');                 //separated the routes to make app.js cleaner
const router = express.Router({ mergeParams: true });    //id of campground is not in the request object for reviews.js. mergerParams combines the params made in app.js to reviews.js so the campground id can be used in review.js
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const Campground = require('../models/campground');   //connects to campground.js in model folder
const Review = require('../models/review')
const reviews = require('../controllers/reviews')

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))  //creates a review for a campground

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))   //deletes a review of a campground

module.exports = router;