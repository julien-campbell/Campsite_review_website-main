const Campground = require('../models/campground');   //connects to campground.js in model folder
const Review = require('../models/review')

module.exports.createReview = async (req, res) => { //posts review that is created
    const campground = await Campground.findById(req.params.id)        //saves campground the review is for
    const review = new Review(req.body.review) //will retreive all information from show.ejs that has review[] (ex. review[rating])
    review.author = req.user._id;               //associate review author to the person logged in
    campground.reviews.push(review);           //add the review object made above and save it into the campground review array
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created new review!') //create flash key in request object
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {              //deletes a review. also would like to delete the reference to the campground using mongo operator $pull
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })                   //deletes the reference in campground review object in the review array
    await Review.findByIdAndDelete(reviewId);                                                   //deletes review
    req.flash('success', 'Successfully deleted review!') //create flash key in request object
    res.redirect(`/campgrounds/${id}`)
}


