const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');   //connects to campground.js in model folder
const Review = require('./models/review');   //connects to review.js in model folder


module.exports.isLoggedIn = (req, res, next) => {    //middleware to check if user is logged in           
    if (!req.isAuthenticated()) {            //checks if user is logged in (using passport)
        req.session.returnTo = req.originalUrl  //saves the url you were originally at before it redirects you to login page
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {      //middleware function but won't be used all the time. So app.use is not used but need req, res, and next
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')  //make a single string message since error is an array at the moment
        throw new ExpressError(msg, 400)           //if error is caught, will be brough to app.use a the bottom of this code
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {             //middleware function that checks if person who is editing/deleting campground is the owner/creator of campground
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do this!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {             //middleware function that checks if person who is editing/deleting review is the owner/creator of review
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do this!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}




module.exports.validateReview = (req, res, next) => {      //middleware function but won't be used all the time. So app.use is not used but need req, res, and next
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')  //make a single string message since error is an array at the moment
        throw new ExpressError(msg, 400)           //if error is caught, will be brough to app.use a the bottom of this code
    } else {
        next();
    }
}